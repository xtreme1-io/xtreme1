package ai.basic.x1.adapter.api.config;

import ai.basic.x1.adapter.api.annotation.user.LoggedUserArgumentResolver;
import ai.basic.x1.adapter.api.filter.JwtHelper;
import ai.basic.x1.usecase.*;
import ai.basic.x1.util.lock.DistributedLock;
import ai.basic.x1.util.lock.IDistributedLock;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * @author Jagger Wang
 */
@Configuration(proxyBeanMethods = false)
public class CommonConfig implements WebMvcConfigurer {

    @Value("${jwt.secret}")
    public String jwtSecret;

    @Value("${jwt.issuer}")
    public String jwtIssuer;

    @Value("${jwt.expireHours}")
    public Integer jwtExpireHours;

    @Bean
    public Jackson2ObjectMapperBuilder jackson2ObjectMapperBuilder() {
        return new Jackson2ObjectMapperBuilder().featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtHelper jwtHelper() {
        return new JwtHelper(jwtSecret, jwtIssuer, jwtExpireHours);
    }


    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
        argumentResolvers.add(new LoggedUserArgumentResolver());
    }


    @Bean
    public UserUseCase userUsecase() {
        return new UserUseCase();
    }

    @Bean
    public DatasetUseCase datasetUsecase() {
        return new DatasetUseCase();
    }

    @Bean
    public DataInfoUseCase dataInfoUsecase() {
        return new DataInfoUseCase();
    }

    @Bean
    public FileUseCase fileUseCase() {
        return new FileUseCase();
    }

    @Bean
    public ExportUseCase exportUseCase() {
        return new ExportUseCase();
    }

    @Bean
    public ExportRecordUseCase exportRecordUseCase() {
        return new ExportRecordUseCase();
    }

    @Bean
    public ClassUseCase classUseCase() {
        return new ClassUseCase();
    }

    @Bean
    public ClassificationUseCase classificationUseCase() {
        return new ClassificationUseCase();
    }

    @Bean
    public DatasetClassUseCase datasetClassUseCase() {
        return new DatasetClassUseCase();
    }

    @Bean
    public DatasetClassificationUseCase datasetClassificationUseCase() {
        return new DatasetClassificationUseCase();
    }

    @Bean
    public OntologyUseCase ontologyUseCase() {
        return new OntologyUseCase();
    }

    @Bean(name = "distributedLock")
    public IDistributedLock distributedLock(StringRedisTemplate stringRedisTemplate) {
        return new DistributedLock(stringRedisTemplate, "ai:basicai:xtreme1:commonLock", 5000);
    }

    @Bean(name = "similarityDistributedLock")
    public IDistributedLock similarityDistributedLock(StringRedisTemplate stringRedisTemplate) {
        return new DistributedLock(stringRedisTemplate, "ai:basicai:xtreme1:similarityLock", 300000);
    }


    @Bean
    public ModelUseCase modelUseCase() {
        return new ModelUseCase();
    }

    @Bean
    public DataAnnotationObjectUseCase dataAnnotationObjectUseCase() {
        return new DataAnnotationObjectUseCase();
    }

    @Bean
    public DataAnnotationUseCase dataAnnotationUseCase() {
        return new DataAnnotationUseCase();
    }

    @Bean
    public DataAnnotationClassificationUseCase dataAnnotationClassificationUseCase() {
        return new DataAnnotationClassificationUseCase();
    }

    @Bean
    public DataAnnotationRecordUseCase dataAnnotationRecordUseCase() {
        return new DataAnnotationRecordUseCase();
    }

    @Bean
    public DataEditUseCase dataEditUseCase() {
        return new DataEditUseCase();
    }


    @Bean
    public DataFlowUseCase dataFlowUseCase() {
        return new DataFlowUseCase();
    }

    @Bean
    public UploadUseCase uploadUseCase() {
        return new UploadUseCase();
    }

    @Bean
    public UserTokenUseCase userTokenUseCase() {
        return new UserTokenUseCase();
    }

    @Bean
    public DataClassificationOptionUseCase dataClassificationOptionUseCase() {
        return new DataClassificationOptionUseCase();
    }

    @Bean
    public DatasetSimilarityRecordUseCase datasetSimilarityRecordUseCase() {
        return new DatasetSimilarityRecordUseCase();
    }

    @Bean
    public DatasetSimilarityJobUseCase datasetSimilarityJobUseCase() {
        return new DatasetSimilarityJobUseCase();
    }

    @Bean
    public ModelRecognitionUseCase modelRecognitionUseCase() {
        return new ModelRecognitionUseCase();
    }

    @Bean
    public ModelRunRecordUseCase modelRunRecordUseCase() {
        return new ModelRunRecordUseCase();
    }

    @Bean
    public UploadDataUseCase uploadDataUseCase() {
        return new UploadDataUseCase();
    }

    @Bean
    public PointCloudUploadUseCase pointCloudUploadUseCase() {
        return new PointCloudUploadUseCase();
    }

    @Bean
    public ImageUploadUseCase imageUploadUseCase() {
        return new ImageUploadUseCase();
    }


}
