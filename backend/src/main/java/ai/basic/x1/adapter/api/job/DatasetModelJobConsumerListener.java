package ai.basic.x1.adapter.api.job;

import ai.basic.x1.adapter.api.context.RequestContext;
import ai.basic.x1.adapter.api.context.RequestContextHolder;
import ai.basic.x1.adapter.api.context.UserInfo;
import ai.basic.x1.entity.ModelMessageBO;
import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.data.redis.connection.stream.ObjectRecord;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.stream.StreamListener;

import java.util.concurrent.ConcurrentHashMap;

/**
 * @author andy
 */
@Slf4j
public class DatasetModelJobConsumerListener implements StreamListener<String, ObjectRecord<String, String>> {

    private String group;
    private String streamKey;
    private RedisTemplate<String, Object> redisTemplate;
    private ConcurrentHashMap<String, AbstractModelMessageHandler> modelMessageHandlerMap = new ConcurrentHashMap<>();

    public DatasetModelJobConsumerListener(String streamKey, String group, RedisTemplate<String, Object> redisTemplate, ApplicationContext applicationContext) {
        this.streamKey = streamKey;
        this.group = group;
        this.redisTemplate = redisTemplate;
        for (AbstractModelMessageHandler messageHandler : applicationContext.getBeansOfType(AbstractModelMessageHandler.class).values()) {
            modelMessageHandlerMap.put(messageHandler.getModelCodeEnum().name(), messageHandler);
        }
    }


    @Override
    public void onMessage(ObjectRecord message) {
        String modelMessageBOJSONStr = (String) message.getValue();
        log.info("receive message:{}", modelMessageBOJSONStr);
        ModelMessageBO modelMessageBO = JSONUtil.toBean(modelMessageBOJSONStr, ModelMessageBO.class);
        buildRequestContext(modelMessageBO.getCreatedBy());
        if (modelMessageHandlerMap.get(modelMessageBO.getModelCode().name()).handleDatasetModelRun(modelMessageBO)) {
            redisTemplate.opsForStream().acknowledge(streamKey, group, message.getId());
        }
    }

    private void buildRequestContext(Long userId) {
        RequestContext requestContext = RequestContextHolder.createEmptyContent();
        requestContext.setUserInfo(UserInfo.builder().id(userId).build());
        RequestContextHolder.setContext(requestContext);
    }
}
