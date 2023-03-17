package ai.basic.x1.adapter.api.config;

import ai.basic.x1.adapter.api.job.*;
import org.springframework.context.ApplicationContext;
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

/**
 * @author andy
 */
@Configuration
public class JobConfig {
    private static final int PROCESSORS = Runtime.getRuntime().availableProcessors();
    @Bean
    public Executor dataRedisStreamExecutor() {
        AtomicInteger index = new AtomicInteger(1);
        ThreadPoolExecutor executor = new ThreadPoolExecutor(PROCESSORS, PROCESSORS, 0, TimeUnit.SECONDS,
                new LinkedBlockingDeque<>(), r -> {
            Thread thread = new Thread(r);
            thread.setName("dataRedisConsumer-executor" + index.getAndIncrement());
            thread.setDaemon(true);
            return thread;
        });
        return executor;
    }

    @Bean
    public Executor datasetRedisStreamExecutor() {
        AtomicInteger index = new AtomicInteger(1);
        ThreadPoolExecutor executor = new ThreadPoolExecutor(PROCESSORS, PROCESSORS, 0, TimeUnit.SECONDS,
                new LinkedBlockingDeque<>(), r -> {
            Thread thread = new Thread(r);
            thread.setName("datasetRedisConsumer-executor" + index.getAndIncrement());
            thread.setDaemon(true);
            return thread;
        });
        return executor;
    }

    @Bean
    public Executor similarityExecutor() {
        AtomicInteger index = new AtomicInteger(1);
        ThreadPoolExecutor executor = new ThreadPoolExecutor(PROCESSORS, PROCESSORS, 0, TimeUnit.SECONDS,
                new LinkedBlockingDeque<>(), r -> {
            Thread thread = new Thread(r);
            thread.setName("similarity-executor" + index.getAndIncrement());
            thread.setDaemon(true);
            return thread;
        });
        return executor;
    }

    @Bean(initMethod = "start", destroyMethod = "stop")
    public StreamMessageListenerContainer<String, ObjectRecord<String, String>> dataStreamMessageListenerContainer(Executor dataRedisStreamExecutor,
                                                                                                               RedisConnectionFactory redisConnectionFactory,
                                                                                                               RedisTemplate redisTemplate,
                                                                                                               ApplicationContext applicationContext
    ) {

        try {
            redisTemplate.opsForStream().createGroup(DATA_MODEL_RUN_STREAM_KEY, MODEL_RUN_CONSUMER_GROUP);
        } catch (RedisSystemException redisSystemException) {
            //no do
        }
        StreamMessageListenerContainer.StreamMessageListenerContainerOptions<String, ObjectRecord<String, String>> options =
                StreamMessageListenerContainer.StreamMessageListenerContainerOptions
                        .builder()
                        .batchSize(10)
                        .executor(dataRedisStreamExecutor)
                        .keySerializer(RedisSerializer.string())
                        .hashKeySerializer(RedisSerializer.string())
                        .hashValueSerializer(RedisSerializer.string())
                        // less than `spring.redis.timeout`
                        .pollTimeout(Duration.ofSeconds(1))
                        .objectMapper(new ObjectHashMapper())
                        .errorHandler(new ModelRunErrorHandler())
                        .targetType(String.class)
                        .build();
        StreamMessageListenerContainer<String, ObjectRecord<String, String>> streamMessageListenerContainer =
                StreamMessageListenerContainer.create(redisConnectionFactory, options);
        StreamMessageListenerContainer.ConsumerStreamReadRequest<String> dataStreamReadRequest = StreamMessageListenerContainer
                .StreamReadRequest
                .builder(StreamOffset.create(DATA_MODEL_RUN_STREAM_KEY, ReadOffset.lastConsumed()))
                .consumer(Consumer.from(MODEL_RUN_CONSUMER_GROUP, MODEL_RUN_CONSUMER_NAME))
                .autoAcknowledge(false)
                .cancelOnError(throwable -> false)
                .build();
        streamMessageListenerContainer.register(dataStreamReadRequest, new DataModelJobConsumerListener(DATA_MODEL_RUN_STREAM_KEY, MODEL_RUN_CONSUMER_GROUP, redisTemplate, applicationContext));
        return streamMessageListenerContainer;
    }

    @Bean(initMethod = "start", destroyMethod = "stop")
    public StreamMessageListenerContainer<String, ObjectRecord<String, String>> streamMessageListenerContainerDataset(Executor datasetRedisStreamExecutor,
                                                                                                               RedisConnectionFactory redisConnectionFactory,
                                                                                                               RedisTemplate redisTemplate,
                                                                                                               ApplicationContext applicationContext
    ) {
        try {
            redisTemplate.opsForStream().createGroup(DATASET_MODEL_RUN_STREAM_KEY, DATASET_MODEL_RUN_CONSUMER_GROUP);
        } catch (RedisSystemException redisSystemException) {
            //no do
        }
        StreamMessageListenerContainer.StreamMessageListenerContainerOptions<String, ObjectRecord<String, String>> options =
                StreamMessageListenerContainer.StreamMessageListenerContainerOptions
                        .builder()
                        .batchSize(10)
                        .executor(datasetRedisStreamExecutor)
                        .keySerializer(RedisSerializer.string())
                        .hashKeySerializer(RedisSerializer.string())
                        .hashValueSerializer(RedisSerializer.string())
                        // less than `spring.redis.timeout`
                        .pollTimeout(Duration.ofSeconds(1))
                        .objectMapper(new ObjectHashMapper())
                        .errorHandler(new ModelRunErrorHandler())
                        .targetType(String.class)
                        .build();
        StreamMessageListenerContainer<String, ObjectRecord<String, String>> streamMessageListenerContainer =
                StreamMessageListenerContainer.create(redisConnectionFactory, options);

        StreamMessageListenerContainer.ConsumerStreamReadRequest<String> datasetStreamReadRequest = StreamMessageListenerContainer
                .StreamReadRequest
                .builder(StreamOffset.create(DATASET_MODEL_RUN_STREAM_KEY, ReadOffset.lastConsumed()))
                .consumer(Consumer.from(DATASET_MODEL_RUN_CONSUMER_GROUP, DATASET_MODEL_RUN_CONSUMER_NAME))
                .autoAcknowledge(false)
                .cancelOnError(throwable -> false)
                .build();
        streamMessageListenerContainer.register(datasetStreamReadRequest, new DatasetModelJobConsumerListener(DATASET_MODEL_RUN_STREAM_KEY, DATASET_MODEL_RUN_CONSUMER_GROUP, redisTemplate, applicationContext));
        return streamMessageListenerContainer;
    }

    @Bean
    public PointCloudDetectionModelMessageHandler pointCloudDetectionModelMessageHandler() {
        return new PointCloudDetectionModelMessageHandler();
    }

    @Bean
    public ImageDetectionModelHandler imageDetectionModelHandler() {
        return new ImageDetectionModelHandler();
    }
}
