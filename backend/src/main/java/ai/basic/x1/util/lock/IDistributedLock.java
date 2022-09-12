package ai.basic.x1.util.lock;

/**
 * @author andy
 */
public interface IDistributedLock {
    /**
     * Try get lock by lockeKey
     * @param lockKey
     * @return
     */
    boolean tryLock(String lockKey);

    /**
     * Try get lock by lockKey and waitTime
     * @param lockKey
     * @param waitTime
     * @return
     */
    boolean tryLock(String lockKey, long waitTime);

    /**
     * Unlock
     * @param lockKey
     */
    void unlock(String lockKey);
}
