package ai.basic.x1.adapter.api.config;

import ai.basic.x1.adapter.api.job.ModelJobConsumerListener;
import ai.basic.x1.adapter.api.job.ModelRunErrorHandler;
import ai.basic.x1.adapter.api.job.PreLabelModelMessageHandler;
import ai.basic.x1.entity.ModelMessageBO;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.RedisSystemException;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.stream.Consumer;
import org.springframework.data.redis.connection.stream.ObjectRecord;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.hash.ObjectHashMapper;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.stream.StreamMessageListenerContainer;

import java.time.Duration;
import java.util.concurrent.Executor;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static ai.basic.x1.util.Constants.*;

@Configuration
public class JobConfig {
    @Bean
    public Executor redisStreamExecutor() {
        int processors = Runtime.getRuntime().availableProcessors();
        AtomicInteger index = new AtomicInteger(1);
        ThreadPoolExecutor executor = new ThreadPoolExecutor(processors, processors, 0, TimeUnit.SECONDS,
                new LinkedBlockingDeque<>(), r -> {
            Thread thread = new Thread(r);
            thread.setName("redisConsumer-" + index.getAndIncrement());
            thread.setDaemon(true);
            return thread;
        });
        return executor;
    }

    @Bean(initMethod = "start", destroyMethod = "stop")
    public StreamMessageListenerContainer<String, ObjectRecord<String, ModelMessageBO>> streamMessageListenerContainer(Executor redisStreamExecutor,
                                                                                                                       RedisConnectionFactory redisConnectionFactory,
                                                                                                                       RedisTemplate redisTemplate) {

        try {
            redisTemplate.opsForStream().createGroup(MODEL_RUN_STREAM_KEY, MODEL_RUN_CONSUMER_GROUP);
        } catch (RedisSystemException redisSystemException) {
            //no do
        }
        StreamMessageListenerContainer.StreamMessageListenerContainerOptions<String, ObjectRecord<String, ModelMessageBO>> options =
                StreamMessageListenerContainer.StreamMessageListenerContainerOptions
                        .builder()
                        .batchSize(10)
                        .executor(redisStreamExecutor)
                        .keySerializer(RedisSerializer.string())
                        .hashKeySerializer(RedisSerializer.string())
                        .hashValueSerializer(RedisSerializer.string())
                        // less than `spring.redis.timeout`
                        .pollTimeout(Duration.ofSeconds(1))
                        .objectMapper(new ObjectHashMapper())
                        .errorHandler(new ModelRunErrorHandler())
                        .targetType(ModelMessageBO.class)
                        .build();
        StreamMessageListenerContainer<String, ObjectRecord<String, ModelMessageBO>> streamMessageListenerContainer =
                StreamMessageListenerContainer.create(redisConnectionFactory, options);
        StreamMessageListenerContainer.ConsumerStreamReadRequest<String> streamReadRequest = StreamMessageListenerContainer
                .StreamReadRequest
                .builder(StreamOffset.create(MODEL_RUN_STREAM_KEY, ReadOffset.lastConsumed()))
                .consumer(Consumer.from(MODEL_RUN_CONSUMER_GROUP, MODEL_RUN_CONSUMER_NAME))
                .autoAcknowledge(false)
                .cancelOnError(throwable -> false)
                .build();
        streamMessageListenerContainer.register(streamReadRequest, new ModelJobConsumerListener(MODEL_RUN_STREAM_KEY, MODEL_RUN_CONSUMER_GROUP, redisTemplate, preLabelModelMessageHandler()));
        return streamMessageListenerContainer;
    }

    @Bean
    public PreLabelModelMessageHandler preLabelModelMessageHandler() {
        return new PreLabelModelMessageHandler();
    }
}
