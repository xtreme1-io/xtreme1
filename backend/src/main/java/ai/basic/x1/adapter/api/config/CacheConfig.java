package ai.basic.x1.adapter.api.config;

import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.cache.annotation.CachingConfigurerSupport;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.CacheKeyPrefix;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;

/**
 * @author Zhujh
 */
@Configuration
@EnableCaching
public class CacheConfig extends CachingConfigurerSupport {

    /**
     * 配置各个 Cache，包括 TTL、Prefix 等
     * @param jsonRedisSerializer
     * @return
     */
    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer(
            GenericJackson2JsonRedisSerializer jsonRedisSerializer
    ) {
        var defaultCacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(60))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(jsonRedisSerializer))
                .computePrefixWith(new CacheKeyPrefix() {
                    String SEPARATOR = ":";

                    @Override
                    public String compute(String cacheName) {
                        return "basicai" + SEPARATOR + "x1" + SEPARATOR + cacheName + SEPARATOR;
                    }
                });

        return (builder) -> builder
                .withCacheConfiguration("user", defaultCacheConfig
                        .entryTtl(Duration.ofMinutes(12 * 60)));
    }
}
