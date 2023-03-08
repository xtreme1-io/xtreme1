package ai.basic.x1.adapter.port.dao.redis;

import ai.basic.x1.adapter.port.dao.AbstractRedisDAO;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class ModelSerialNoIncrDAO extends AbstractRedisDAO<RedisTemplate<String, Object>> {

    protected ModelSerialNoIncrDAO(RedisTemplate<String, Object> redisTemplate) {
        super(redisTemplate, "dataset", "model_serial_no_incr");
    }

    public int incrModelSerialNo(Long modelSerialNo) {
        return template.opsForValue().increment(this.prefixedKey(String.valueOf(modelSerialNo))).intValue();
    }

    public boolean removeModelSerialNo(Long modelSerialNo) {
        return template.delete(this.prefixedKey(String.valueOf(modelSerialNo)));
    }

    public Integer getCount(Long modelSerialNo) {
        return Integer.valueOf(template.opsForValue().get(prefixedKey(String.valueOf(modelSerialNo))).toString());
    }
}
