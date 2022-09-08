package ai.basic.x1.adapter.port.minio;

import ai.basic.x1.entity.PresignedUrlBO;
import cn.hutool.core.io.FileUtil;
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

/**
 * @author fyb
 * @date 2022/3/30 11:20
 */
@Slf4j
@Component
public class MinioService {

    @Autowired
    private ExtendMinioClient client;

    /**
     * Create bucket
     *
     * @param bucketName Bucket name
     */
    @SneakyThrows
    private void createBucket(String bucketName) {
        var bucketExistsArgs = BucketExistsArgs.builder().bucket(bucketName).build();
        if (!client.bucketExists(bucketExistsArgs)) {
            client.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
        }
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
        createBucket(bucketName);
        //partSize:-1 is auto setting
        long partSize = -1;
        PutObjectArgs putArgs = PutObjectArgs.builder()
                .bucket(bucketName)
                .object(fileName)
                .stream(inputStream, size, partSize)
                .contentType(contentType)
                .build();
        client.putObject(putArgs);
        return getUrl(bucketName, fileName);
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
        fileList.forEach(file -> objects.add(
                new SnowballObject(
                        rootPath + file.getAbsolutePath().replace(tempPath, ""),
                        FileUtil.getInputStream(file),
                        file.length(),
                        null)));
        client.uploadSnowballObjects(UploadSnowballObjectsArgs.builder()
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
        GetPresignedObjectUrlArgs args = GetPresignedObjectUrlArgs.builder()
                .bucket(bucketName)
                .object(objectName)
                .method(Method.GET)
                .build();
        return client.getPresignedObjectUrl(args);
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
        var queryParams = new HashMap<String, String>();
        queryParams.put("response-content-type", "application/octet-stream");
        GetPresignedObjectUrlArgs args = GetPresignedObjectUrlArgs.builder()
                .method(Method.GET)
                .bucket(bucketName)
                .object(objectName)
                .extraQueryParams(queryParams)
                .expiry(60 * 60 * 24 * 7)
                .build();
        return client.getPresignedObjectUrl(args);
    }

    /**
     * Get pre-upload url and access url
     *
     * @param bucketName Bucket name
     * @param objectName File path
     * @return Pre-signed url
     */
    public PresignedUrlBO generatePresignedUrl(String bucketName, String objectName)
            throws ServerException, InsufficientDataException, ErrorResponseException, IOException,
            NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException,
            InternalException {
        createBucket(bucketName);
        GetPresignedObjectUrlArgs args = GetPresignedObjectUrlArgs.builder()
                .method(Method.PUT)
                .bucket(bucketName)
                .object(objectName)
                .expiry(60 * 60 * 24 * 7)
                .build();
        // This must be PUT, if it is GET, it is the file access address. If it is a POST upload, an error will be reported.
        String preUrl = client.getPresignedObjectUrl(args);
        String accessUrl = getUrl(bucketName, objectName);
        return PresignedUrlBO.builder()
                .accessUrl(accessUrl)
                .presignedUrl(preUrl).build();
    }
}