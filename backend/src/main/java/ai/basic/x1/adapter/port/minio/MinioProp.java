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
     * 连接url
     */
    private String endpoint;
    /**
     * 用户名
     */
    private String accessKey;
    /**
     * 密码
     */
    private String secretKey;

    /**
     * 桶名称
     */
    private String bucketName;
}