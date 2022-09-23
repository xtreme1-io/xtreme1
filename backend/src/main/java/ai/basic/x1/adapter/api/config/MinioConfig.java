package ai.basic.x1.adapter.api.config;

import ai.basic.x1.adapter.port.minio.ExtendMinioClient;
import ai.basic.x1.adapter.port.minio.MinioProp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Minio config
 *
 * @author fyb
 * @date 2022/3/30 10:49
 */
@Configuration
@EnableConfigurationProperties(MinioProp.class)
public class MinioConfig {

    @Autowired
    private MinioProp minioProp;

    /**
     * Get minioClient
     *
     * @return extendMinioClient
     */
    @Bean(value = "extendMinioClient")
    public ExtendMinioClient extendMinioClient() {
        return new ExtendMinioClient(ExtendMinioClient.builder().endpoint(minioProp.getEndpoint()).credentials(minioProp.getAccessKey(), minioProp.getSecretKey()).build());
    }

}
