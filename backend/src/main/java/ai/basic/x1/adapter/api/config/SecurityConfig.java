package ai.basic.x1.adapter.api.config;

import ai.basic.x1.adapter.api.filter.JwtAuthenticationFilter;
import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.usecase.exception.UsecaseCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;

/**
 * @author Jagger Wang
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Override
    protected void configure(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.formLogin().disable()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.NEVER).and()
                .cors(corsConfigurer -> corsConfigurer.disable())
                .csrf(csrfConfigurer -> csrfConfigurer.disable())
                // Need to be after AnonymousAuthenticationFilter, otherwise JWT authentication will be overriden.
                .addFilterAfter(jwtAuthenticationFilter, AnonymousAuthenticationFilter.class)
                .exceptionHandling(exceptionConfigurer -> exceptionConfigurer
                        .authenticationEntryPoint(new JSONAuthenticationEntryPoint(new ApiResult(UsecaseCode.LOGIN_STATUS_TIMEOUT,
                                UsecaseCode.LOGIN_STATUS_TIMEOUT.getMessage()), HttpStatus.UNAUTHORIZED)))
                .authorizeRequests(authConfigurer -> authConfigurer.
                        antMatchers("/actuator/**", "/user/register", "/user/login", "/ontology/exportAsJson")
                        .permitAll()
                        .anyRequest().authenticated());
    }

}
