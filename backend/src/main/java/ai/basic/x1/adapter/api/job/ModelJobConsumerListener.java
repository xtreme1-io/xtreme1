package ai.basic.x1.adapter.api.job;

import ai.basic.x1.entity.ModelMessageBO;
import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.stream.ObjectRecord;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.stream.StreamListener;

@Slf4j
public class ModelJobConsumerListener implements StreamListener<String, ObjectRecord<String, String>> {

    private String group;
    private String streamKey;
    private RedisTemplate<String, Object> redisTemplate;
    private AbstractModelMessageHandler modelMessageHandler;

    public ModelJobConsumerListener(String streamKey, String group, RedisTemplate<String, Object> redisTemplate, AbstractModelMessageHandler modelMessageHandler) {
        this.streamKey = streamKey;
        this.group = group;
        this.redisTemplate = redisTemplate;
        this.modelMessageHandler = modelMessageHandler;
    }


    @Override
    public void onMessage(ObjectRecord message) {
        String modelMessageBO = (String) message.getValue();
        if (modelMessageHandler.modelRun(JSONUtil.toBean(modelMessageBO, ModelMessageBO.class))) {
            redisTemplate.opsForStream().acknowledge(streamKey, group, message.getId());
        }
    }
}
