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
import java.util.List;

/**
 * @author fyb
 * @date 2022/3/30 11:20
 */
@Slf4j
@Component
public class MinioService {

    @Autowired
    private MinioClient client;

    /**
     * 创建bucket
     *
     * @param bucketName bucket名称
     */
    @SneakyThrows
    private void createBucket(String bucketName) {
        var bucketExistsArgs = BucketExistsArgs.builder().bucket(bucketName).build();
        if (!client.bucketExists(bucketExistsArgs)) {
            client.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
        }
    }

    /**
     * minio文件上传
     *
     * @param bucketName  存储桶
     * @param fileName    文件名
     * @param inputStream 输入流
     * @param contentType 文件类型
     * @param size        文件大小
     * @return 文件路径
     */
    public String uploadFile(String bucketName, String fileName, InputStream inputStream, String contentType, long size) throws IOException, ServerException, InsufficientDataException, ErrorResponseException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        createBucket(bucketName);
        //objectSize已知，partSize设为-1意为自动设置
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
     * *批量上传文件
     * @param bucketName 存储桶*
     * @param rootPath 根路径
     * @param tempPath 临时存储路径
     * @param fileList 文件集合
     */
    public void uploadFileList( String bucketName,String rootPath, String tempPath, List<File> fileList)
            throws ErrorResponseException, InsufficientDataException, InternalException,
            InvalidKeyException, InvalidResponseException, IOException, NoSuchAlgorithmException,
            ServerException, XmlParserException {
        createBucket(bucketName);
        List<SnowballObject> objects = new ArrayList<>(fileList.size());
        fileList.forEach(file ->
            objects.add(
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
     * 获取对象的临时访问url，有效期默认7天
     *
     * @param bucketName 存储桶
     * @param objectName 文件名
     * @return url地址
     */
    public String getUrl(String bucketName, String objectName) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        GetPresignedObjectUrlArgs args = GetPresignedObjectUrlArgs.builder()
                .bucket(bucketName)
                .object(objectName)
                .method(Method.GET)
                .build();
        return client.getPresignedObjectUrl(args);
    }

    /**
     * 获取预上传url与访问url
     *
     * @param bucketName 存储桶
     * @param objectName 文件路径
     * @return url地址
     */
    public PresignedUrlBO generatePresignedUrl(String bucketName, String objectName) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        GetPresignedObjectUrlArgs args = GetPresignedObjectUrlArgs.builder()
                .method(Method.PUT)
                .bucket(bucketName)
                .object(objectName)
                .expiry(60 * 60 * 24 * 7)
                .build();
        //这里必须是PUT，如果是GET的话就是文件访问地址了。如果是POST上传会报错.
        String preUrl = client.getPresignedObjectUrl(args);
        // 文件访问地址
        String accessUrl = getUrl(bucketName, objectName);
        return PresignedUrlBO.builder()
                .accessUrl(accessUrl)
                .presignedUrl(preUrl).build();
    }
}