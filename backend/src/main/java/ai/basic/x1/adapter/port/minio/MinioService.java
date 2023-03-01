package ai.basic.x1.adapter.port.minio;

import ai.basic.x1.adapter.api.context.RequestContextHolder;
import ai.basic.x1.entity.PresignedUrlBO;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HttpStatus;
import io.minio.*;
import io.minio.errors.*;
import io.minio.http.Method;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import static ai.basic.x1.util.Constants.MINIO;
import static ai.basic.x1.util.Constants.SLANTING_BAR;

/**
 * @author fyb
 * @date 2022/3/30 11:20
 */
@Slf4j
@Component
public class MinioService {

    @Autowired
    private ExtendMinioClient extendMinioClient;

    @Autowired
    private MinioProp minioProp;

    /**
     * Create bucket
     *
     * @param bucketName Bucket name
     */
    @SneakyThrows
    private void createBucket(String bucketName) {
        var bucketExistsArgs = BucketExistsArgs.builder().bucket(bucketName).build();
        if (!extendMinioClient.bucketExists(bucketExistsArgs)) {
            extendMinioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
        }
    }


    /**
     * check object exist
     *
     * @param bucketName
     * @param objectName
     */
    public boolean checkObjectExist(String bucketName, String objectName) throws IOException, InvalidKeyException, InvalidResponseException, InsufficientDataException, NoSuchAlgorithmException, ServerException, InternalException, XmlParserException, ErrorResponseException {
        var bucketExistsArgs = BucketExistsArgs.builder().bucket(bucketName).build();
        boolean existBucket = extendMinioClient.bucketExists(bucketExistsArgs);
        if (existBucket) {
            var statObjectArgs = StatObjectArgs.builder().bucket(bucketName).object(objectName).build();
            try {
                var statObjectResponse = extendMinioClient.statObject(statObjectArgs);
                return !statObjectResponse.object().isEmpty();
            } catch (ErrorResponseException errorResponseException) {
                if (errorResponseException.response().code() == HttpStatus.HTTP_NOT_FOUND) {
                    return false;
                }
            }
        }
        return false;
    }


    /**
     * Upload file
     *
     * @param bucketName  Bucket name
     * @param fileName    File name
     * @param inputStream Input stream
     * @param contentType File content type
     * @param size        File size
     * @return File url
     */
    public String uploadFile(String bucketName, String fileName, InputStream inputStream, String contentType, long size)
            throws IOException, ServerException, InsufficientDataException, ErrorResponseException,
            NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException,
            InternalException {
        uploadFileWithoutUrl(bucketName, fileName, inputStream, contentType, size);
        return getUrl(bucketName, fileName);
    }

    public void uploadFileWithoutUrl(String bucketName, String fileName, InputStream inputStream, String contentType, long size) throws IOException, InvalidKeyException, InvalidResponseException, InsufficientDataException, NoSuchAlgorithmException, ServerException, InternalException, XmlParserException, ErrorResponseException {
        createBucket(bucketName);
        //partSize:-1 is auto setting
        long partSize = -1;
        var putArgs = PutObjectArgs.builder()
                .bucket(bucketName)
                .object(fileName)
                .stream(inputStream, size, partSize)
                .contentType(contentType)
                .build();
        extendMinioClient.putObject(putArgs);
    }

    /**
     * batch upload files
     *
     * @param bucketName Bucket name
     * @param rootPath   Root path
     * @param tempPath   Temp path
     * @param fileList   File list
     */
    public void uploadFileList(String bucketName, String rootPath, String tempPath, List<File> fileList)
            throws ErrorResponseException, InsufficientDataException, InternalException,
            InvalidKeyException, InvalidResponseException, IOException, NoSuchAlgorithmException,
            ServerException, XmlParserException {
        createBucket(bucketName);
        List<SnowballObject> objects = new ArrayList<>(fileList.size());
        int startingPosition = FileUtil.getAbsolutePath(FileUtil.file(tempPath).getAbsolutePath()).length();
        fileList.forEach(file -> objects.add(
                new SnowballObject(
                        rootPath + FileUtil.getAbsolutePath(file.getAbsolutePath()).substring(startingPosition),
                        FileUtil.getInputStream(file),
                        file.length(),
                        null)));
        extendMinioClient.uploadSnowballObjects(UploadSnowballObjectsArgs.builder()
                .bucket(bucketName)
                .objects(objects)
                .build());
    }

    /**
     * Get the temporary access url of the object, the default validity period is 7 days
     *
     * @param bucketName Bucket name
     * @param objectName File path
     * @return File url
     */
    public String getUrl(String bucketName, String objectName) throws ServerException, InsufficientDataException,
            ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException,
            InvalidResponseException, XmlParserException, InternalException {
        var builder = GetPresignedObjectUrlArgs.builder()
                .bucket(bucketName)
                .object(objectName)
                .method(Method.GET);
        var region = extendMinioClient.getRegion(builder.build());
        return replaceUrl(extendMinioClient.getPresignedObjectUrl(builder.region(region).build()));
    }

    /**
     * Get the temporary access url of the object, the default validity period is 7 days
     *
     * @param bucketName Bucket name
     * @param objectName File path
     * @return Internal file url
     */
    public String getInternalUrl(String bucketName, String objectName) throws ServerException, InsufficientDataException,
            ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException,
            InvalidResponseException, XmlParserException, InternalException {
        var builder = GetPresignedObjectUrlArgs.builder()
                .bucket(bucketName)
                .object(objectName)
                .method(Method.GET);
        return extendMinioClient.getPresignedObjectUrl(builder.build());
    }

    /**
     * Get file path based on file name - signature path
     *
     * @param bucketName Bucket name
     * @param objectName File path
     * @return File url
     */
    public String getPresignedUrl(String bucketName, String objectName) throws ServerException, InsufficientDataException,
            ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException,
            XmlParserException, InternalException {
        var queryParams = new HashMap<String, String>(1);
        queryParams.put("response-content-type", "application/octet-stream");
        var builder = GetPresignedObjectUrlArgs.builder()
                .method(Method.GET)
                .bucket(bucketName)
                .object(objectName)
                .extraQueryParams(queryParams)
                .expiry(60 * 60 * 24 * 7);
        var region = extendMinioClient.getRegion(builder.build());
        return replaceUrl(extendMinioClient.getPresignedObjectUrl(builder.region(region).build()));
    }

    /**
     * Get pre-upload url and access url
     *
     * @param bucketName   Bucket name
     * @param objectName   File path
     * @param isReplaceUrl Whether to replace with the external network address
     * @return Pre-signed url
     */
    public PresignedUrlBO generatePresignedUrl(String bucketName, String objectName, Boolean isReplaceUrl)
            throws ServerException, InsufficientDataException, ErrorResponseException, IOException,
            NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException,
            InternalException {
        createBucket(bucketName);
        var builder = GetPresignedObjectUrlArgs.builder()
                .method(Method.PUT)
                .bucket(bucketName)
                .object(objectName)
                .expiry(60 * 60 * 24 * 7);
        var region = extendMinioClient.getRegion(builder.build());
        // This must be PUT, if it is GET, it is the file access address. If it is a POST upload, an error will be reported.
        var preUrl = extendMinioClient.getPresignedObjectUrl(builder.region(region).build());
        if (isReplaceUrl) {
            preUrl = replaceUrl(preUrl);
        }
        var accessUrl = getInternalUrl(bucketName, objectName);
        return PresignedUrlBO.builder()
                .accessUrl(accessUrl)
                .presignedUrl(preUrl).build();
    }


    private String replaceUrl(String url) {
        var proto = "http";
        var host = "localhost";
        if (ObjectUtil.isNotNull(RequestContextHolder.getContext()) && ObjectUtil.isNotNull(RequestContextHolder.getContext().getRequestInfo())) {
            var forwardedProto = RequestContextHolder.getContext().getRequestInfo().getForwardedProto();
            proto = StrUtil.isNotEmpty(forwardedProto) ? forwardedProto : proto;

            var forwardedHost = RequestContextHolder.getContext().getRequestInfo().getHost();
            host = StrUtil.isNotEmpty(forwardedHost) ? forwardedHost : host;
        }
        return url.replace(minioProp.getEndpoint(), proto + "://" +
                host +
                SLANTING_BAR + MINIO + SLANTING_BAR);
    }
}