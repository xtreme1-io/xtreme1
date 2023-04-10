package ai.basic.x1.adapter.port.dao;

import cn.hutool.core.lang.Assert;

/**
 * @author Jagger Wang
 */
public abstract class AbstractRedisDAO<T> {
    protected static String KEY_SEPERATOR = ":";

    protected T template;

    protected String keyPrefix;

    protected AbstractRedisDAO(T template, String service) {
        this.template = template;
        this.keyPrefix = "x1" + KEY_SEPERATOR + service;
    }

    protected AbstractRedisDAO(T template, String service, String table) {
        this.template = template;
        this.keyPrefix = "x1" + KEY_SEPERATOR + service + KEY_SEPERATOR + table;
    }

    public String prefixedKey(String key) {
        Assert.notEmpty(key);

        return keyPrefix + KEY_SEPERATOR + key;
    }
}
