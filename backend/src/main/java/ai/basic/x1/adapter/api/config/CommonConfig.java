package ai.basic.x1.adapter.api.config;

import ai.basic.x1.adapter.api.annotation.user.LoggedUserArgumentResolver;
import ai.basic.x1.adapter.api.context.RequestContextInterceptor;
import ai.basic.x1.adapter.api.filter.JwtAuthenticationFilter;
import ai.basic.x1.adapter.api.filter.JwtHelper;
import ai.basic.x1.usecase.*;
import ai.basic.x1.util.lock.DistributedLock;
import ai.basic.x1.util.lock.IDistributedLock;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.math.BigInteger;
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

    public static final List<String> excludeUris = List.of("/user/login", "/user/register","/error","/user/test");
    @Bean
    public Jackson2ObjectMapperBuilder jackson2ObjectMapperBuilder() {
        return new Jackson2ObjectMapperBuilder()
                .serializerByType(Long.TYPE, ToStringSerializer.instance)
                .serializerByType(Long.class, ToStringSerializer.instance)
                .serializerByType(BigInteger.class, ToStringSerializer.instance)
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtHelper jwtHelper() {
        return new JwtHelper(jwtSecret, jwtIssuer, jwtExpireHours);
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtHelper jwtHelper, UserUseCase userUseCase) {
        return new JwtAuthenticationFilter(jwtHelper, userUseCase, excludeUris);
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
        argumentResolvers.add(new LoggedUserArgumentResolver());
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new RequestContextInterceptor());
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

    @Bean
    public IDistributedLock distributedLock(StringRedisTemplate stringRedisTemplate) {
        return new DistributedLock(stringRedisTemplate, "basicai:x1:", 5000);
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
    public DataAnnotationRecordUseCase dataAnnotationRecordUseCase() {
        return new DataAnnotationRecordUseCase();
    }

    @Bean
    public DataEditUseCase dataEditUseCase() {
        return new DataEditUseCase();
    }



    @Bean
    public DataFlowUseCase dataFlowUseCase(){
        return new DataFlowUseCase();
    }
}
