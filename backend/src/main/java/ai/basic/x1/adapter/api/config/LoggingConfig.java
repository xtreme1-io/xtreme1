package ai.basic.x1.adapter.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

/**
 * @author Jagger Wang
 */
@Configuration(proxyBeanMethods = false)
public class LoggingConfig {

    @Value("${logging.request.maxPayloadLength}")
    private int maxPayloadLength;

    @Bean
    public CommonsRequestLoggingFilter requestLoggingFilter() {
        var filter = new CommonsRequestLoggingFilter();
        filter.setIncludeQueryString(true);
        filter.setIncludePayload(true);
        filter.setMaxPayloadLength(maxPayloadLength);
        filter.setIncludeHeaders(false);
        filter.setIncludeClientInfo(false);
        return filter;
    }

}
