package ai.basic.x1.adapter.port.minio;

import io.minio.*;
import io.minio.errors.*;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

/**
 * @author fyb
 */
public class ExtendMinioClient extends MinioClient {

    private final RegionClient regionClient;

    public ExtendMinioClient(MinioClient client, MinioAsyncClient asyncClient) {
        super(client);
        this.regionClient = new RegionClient(asyncClient);
    }

    public String getRegion(GetPresignedObjectUrlArgs args)
            throws ErrorResponseException, InsufficientDataException, InternalException,
            InvalidKeyException, InvalidResponseException, IOException, NoSuchAlgorithmException,
            XmlParserException, ServerException {
        try {
            return regionClient.region(args.bucket(), args.region()).get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(e);
        } catch (ExecutionException e) {
            regionClient.throwEncapsulatedException(e);
            return null;
        }
    }

    /**
     * Since minio 8.6.0, region lookup is only reachable from MinioAsyncClient.
     */
    private static class RegionClient extends MinioAsyncClient {

        RegionClient(MinioAsyncClient client) {
            super(client);
        }

        CompletableFuture<String> region(String bucketName, String region)
                throws InsufficientDataException, InternalException, InvalidKeyException, IOException,
                NoSuchAlgorithmException, XmlParserException {
            return getRegionAsync(bucketName, region);
        }
    }
}
