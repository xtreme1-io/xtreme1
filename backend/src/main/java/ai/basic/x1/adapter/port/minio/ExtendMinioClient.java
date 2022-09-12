package ai.basic.x1.adapter.port.minio;

import com.google.common.collect.Multimap;
import com.google.common.io.ByteStreams;
import io.minio.*;
import io.minio.errors.*;
import org.apache.commons.compress.archivers.tar.TarArchiveEntry;
import org.apache.commons.compress.archivers.tar.TarArchiveOutputStream;
import org.xerial.snappy.SnappyFramedOutputStream;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Date;

/**
 * @author fyb
 */
public class ExtendMinioClient extends MinioClient {

    public ExtendMinioClient(MinioClient client) {
        super(client);
    }

    /**
     * Uploads multiple objects in a single put call. It is done by creating intermediate TAR file
     * optionally compressed which is uploaded to S3 service.
     *
     * <pre>Example:{@code
     * // Upload snowball objects.
     * List<SnowballObject> objects = new ArrayList<SnowballObject>();
     * objects.add(
     *     new SnowballObject(
     *         "my-object-one",
     *         new ByteArrayInputStream("hello".getBytes(StandardCharsets.UTF_8)),
     *         5,
     *         null));
     * objects.add(
     *     new SnowballObject(
     *         "my-object-two",
     *         new ByteArrayInputStream("java".getBytes(StandardCharsets.UTF_8)),
     *         4,
     *         null));
     * minioClient.uploadSnowballObjects(
     *     UploadSnowballObjectsArgs.builder().bucket("my-bucketname").objects(objects).build());
     * }</pre>
     *
     * @param args {@link UploadSnowballObjectsArgs} object.
     * @throws ErrorResponseException    thrown to indicate S3 service returned an error response.
     * @throws InsufficientDataException thrown to indicate not enough data available in InputStream.
     * @throws InternalException         thrown to indicate internal library error.
     * @throws InvalidKeyException       thrown to indicate missing of HMAC SHA-256 library.
     * @throws InvalidResponseException  thrown to indicate S3 service returned invalid or no error
     *                                   response.
     * @throws IOException               thrown to indicate I/O error on S3 operation.
     * @throws NoSuchAlgorithmException  thrown to indicate missing of MD5 or SHA-256 digest library.
     * @throws XmlParserException        thrown to indicate XML parsing error.
     */
    @Override
    public ObjectWriteResponse uploadSnowballObjects(UploadSnowballObjectsArgs args)
            throws ErrorResponseException, InsufficientDataException, InternalException,
            InvalidKeyException, InvalidResponseException, IOException, NoSuchAlgorithmException,
            ServerException, XmlParserException {
        checkArgs(args);

        FileOutputStream fos = null;
        BufferedOutputStream bos = null;
        SnappyFramedOutputStream sos = null;
        ByteArrayOutputStream baos = null;
        TarArchiveOutputStream tarOutputStream = null;

        try {
            OutputStream os = null;
            if (args.stagingFilename() != null) {
                fos = new FileOutputStream(args.stagingFilename());
                bos = new BufferedOutputStream(fos);
                os = bos;
            } else {
                baos = new ByteArrayOutputStream();
                os = baos;
            }

            if (args.compression()) {
                sos = new SnappyFramedOutputStream(os);
                os = sos;
            }

            tarOutputStream = new TarArchiveOutputStream(os);
            tarOutputStream.setLongFileMode(TarArchiveOutputStream.LONGFILE_GNU);
            for (SnowballObject object : args.objects()) {
                if (object.filename() != null) {
                    Path filePath = Paths.get(object.filename());
                    TarArchiveEntry entry = new TarArchiveEntry(filePath.toFile(), object.name());
                    tarOutputStream.putArchiveEntry(entry);
                    Files.copy(filePath, tarOutputStream);
                } else {
                    TarArchiveEntry entry = new TarArchiveEntry(object.name());
                    if (object.modificationTime() != null) {
                        entry.setModTime(Date.from(object.modificationTime().toInstant()));
                    }
                    entry.setSize(object.size());
                    tarOutputStream.putArchiveEntry(entry);
                    ByteStreams.copy(object.stream(), tarOutputStream);
                }
                tarOutputStream.closeArchiveEntry();
            }
            tarOutputStream.finish();
        } finally {
            if (tarOutputStream != null) {
                tarOutputStream.flush();
            }
            if (sos != null) {
                sos.flush();
            }
            if (bos != null) {
                bos.flush();
            }
            if (fos != null) {
                fos.flush();
            }
            if (tarOutputStream != null) {
                tarOutputStream.close();
            }
            if (sos != null) {
                sos.close();
            }
            if (bos != null) {
                bos.close();
            }
            if (fos != null) {
                fos.close();
            }
        }

        Multimap<String, String> headers = newMultimap(args.extraHeaders());
        headers.putAll(args.genHeaders());
        headers.put("X-Amz-Meta-Snowball-Auto-Extract", "true");

        if (args.stagingFilename() == null) {
            byte[] data = baos.toByteArray();
            return putObject(
                    args.bucket(),
                    args.region(),
                    args.object(),
                    data,
                    data.length,
                    headers,
                    args.extraQueryParams());
        }

        long length = Paths.get(args.stagingFilename()).toFile().length();
        if (length > ObjectWriteArgs.MAX_OBJECT_SIZE) {
            throw new IllegalArgumentException(
                    "tarball size " + length + " is more than maximum allowed 5TiB");
        }
        try (RandomAccessFile file = new RandomAccessFile(args.stagingFilename(), "r")) {
            return putObject(
                    args.bucket(),
                    args.region(),
                    args.object(),
                    file,
                    length,
                    headers,
                    args.extraQueryParams());
        }
    }

    public String getRegion(GetPresignedObjectUrlArgs args)
            throws ErrorResponseException, InsufficientDataException, InternalException,
            InvalidKeyException, InvalidResponseException, IOException, NoSuchAlgorithmException,
            XmlParserException, ServerException {
        String region = getRegion(args.bucket(), args.region());
        return region;
    }
}
