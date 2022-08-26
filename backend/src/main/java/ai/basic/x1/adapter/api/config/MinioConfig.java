package ai.basic.x1.adapter.api.config;

import ai.basic.x1.adapter.port.minio.MinioProp;
import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * * minio 核心配置类
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
     * 获取 MinioClient
     *
     * @return minioClient
     */
    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder().endpoint(minioProp.getEndpoint()).credentials(minioProp.getAccessKey(), minioProp.getSecretKey()).build();
    }

}
