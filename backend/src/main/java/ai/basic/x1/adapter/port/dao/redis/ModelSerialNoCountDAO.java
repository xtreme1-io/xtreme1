package ai.basic.x1.adapter.port.dao.redis;

import ai.basic.x1.adapter.port.dao.AbstractRedisDAO;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class ModelSerialNoCountDAO extends AbstractRedisDAO<RedisTemplate<String, Object>> {

    protected ModelSerialNoCountDAO(RedisTemplate<String, Object> redisTemplate) {
        super(redisTemplate, "dataset", "model_serial_no_count");
    }

    public void setCount(Long modelSerialNo, Integer count) {
        template.opsForValue().set(prefixedKey(String.valueOf(modelSerialNo)), count);
    }

    public Integer getCount(Long modelSerialNo) {
        return Integer.valueOf(template.opsForValue().get(prefixedKey(String.valueOf(modelSerialNo))).toString());
    }

    public boolean removeModelSerialNoCount(Long modelSerialNo) {
        return template.delete(prefixedKey(String.valueOf(modelSerialNo)));
    }
}
