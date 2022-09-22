package ai.basic.x1.adapter.port.minio;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @author fyb
 * @date 2022/3/30 14:43
 */
@Data
@Component
@ConfigurationProperties(prefix = "minio")
public class MinioProp {

    /**
     * Endpoint
     */
    private String endpoint;

    /**
     * User name
     */
    private String accessKey;

    /**
     * Password
     */
    private String secretKey;

    /**
     * Bucket name
     */
    private String bucketName;

}