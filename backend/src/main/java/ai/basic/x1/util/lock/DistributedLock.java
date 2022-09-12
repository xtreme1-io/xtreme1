package ai.basic.x1.util.lock;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;

import java.util.Collections;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * @author fyb
 *
 * Base redis reentrant lock
 */
@Slf4j
public class DistributedLock implements IDistributedLock {

    private final String lockKeyPrefix;
    private final StringRedisTemplate stringRedisTemplate;
    private String instanceId;
    private long lockTimeout;

    public DistributedLock(StringRedisTemplate stringRedisTemplate, String lockKeyPrefix, long lockTimeout) {
        this.lockKeyPrefix = lockKeyPrefix;
        this.stringRedisTemplate = stringRedisTemplate;
        this.lockTimeout = lockTimeout;
        instanceId = UUID.randomUUID().toString();
    }

    @Override
    public boolean tryLock(String lockKey) {
        return lock(lockKey, lockTimeout, TimeUnit.MILLISECONDS);
    }

    @Override
    public boolean tryLock(String lockKey, long waitTime) {
        if (waitTime <= 0) {
            throw new UnsupportedOperationException("waitTime must > 0!");
        }
        try {
            long start = System.currentTimeMillis();
            boolean ret;
            do {
                ret = lock(lockKey, lockTimeout, TimeUnit.MILLISECONDS);
                if (ret) {
                    break;
                }
                try {
                    Thread.sleep(100);
                } catch (InterruptedException iex) {
                    log.error("try lock error", iex);
                    break;
                }
            } while (System.currentTimeMillis() - start < waitTime);
            return ret;
        } catch (Exception ex) {
            return false;
        }
    }

    @Override
    public void unlock(String lockKey) {
        String luaScript =
                "if (redis.call('hexists', KEYS[1], ARGV[1]) == 0) then" +
                        "    return nil;" +
                        "end ;" +
                        "local counter = redis.call('hincrby', KEYS[1], ARGV[1], -1);" +
                        "if (counter > 0) then" +
                        "    return 0;" +
                        "else" +
                        "    redis.call('del', KEYS[1]);" +
                        "    return 1;" +
                        "end ;" +
                        "return nil;";
        Object result = stringRedisTemplate.execute(new DefaultRedisScript<>(luaScript, Long.class), Collections.singletonList(lockKeyPrefix + lockKey), getLockName(Thread.currentThread().getId()));
        if (result == null) {
            throw new IllegalMonitorStateException("attempt to unlock lock, not locked by lockName:" + Thread.currentThread().getId());
        }
    }

    private String getLockName(long threadId) {
        return instanceId + ":" + threadId;
    }

    private boolean lock(String lockKey, long leaseTime, TimeUnit unit) {
        String luaScript =
                "if (redis.call('exists', KEYS[1]) == 0) then" +
                        "    redis.call('hincrby', KEYS[1], ARGV[2], 1);" +
                        "    redis.call('pexpire', KEYS[1], ARGV[1]);" +
                        "    return 1;" +
                        "end ;" +
                        "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then" +
                        "    redis.call('hincrby', KEYS[1], ARGV[2], 1);" +
                        "    redis.call('pexpire', KEYS[1], ARGV[1]);" +
                        "    return 1;" +
                        "end ;" +
                        "return 0;";
        return stringRedisTemplate.execute(RedisScript.of(luaScript, Boolean.class), Collections.singletonList(lockKeyPrefix + lockKey), String.valueOf(unit.toMillis(leaseTime)), getLockName(Thread.currentThread().getId())).booleanValue();

    }
}
