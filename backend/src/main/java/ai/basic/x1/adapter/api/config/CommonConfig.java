package ai.basic.x1.adapter.api.config;

import ai.basic.x1.adapter.api.annotation.user.LoggedUserArgumentResolver;
import ai.basic.x1.adapter.api.context.RequestContextInterceptor;
import ai.basic.x1.adapter.api.filter.JwtAuthenticationFilter;
import ai.basic.x1.adapter.api.filter.JwtHelper;
import ai.basic.x1.usecase.UserUseCase;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * @author Jagger Wang
 */
@Configuration(proxyBeanMethods = false)
public class CommonConfig  implements WebMvcConfigurer {

    @Value("${jwt.secret}")
    public String jwtSecret;

    @Value("${jwt.issuer}")
    public String jwtIssuer;

    @Value("${jwt.expireHours}")
    public Integer jwtExpireHours;

    @Bean
    public Jackson2ObjectMapperBuilder jackson2ObjectMapperBuilder() {
        return new Jackson2ObjectMapperBuilder()
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
        return new JwtAuthenticationFilter(jwtHelper, userUseCase);
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

}
