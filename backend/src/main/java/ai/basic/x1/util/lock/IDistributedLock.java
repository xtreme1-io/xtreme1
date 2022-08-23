package ai.basic.x1.util.lock;

public interface IDistributedLock {
    boolean tryLock(String lockKey);

    boolean tryLock(String lockKey, long waitTime);

    void unlock(String lockKey);
}
