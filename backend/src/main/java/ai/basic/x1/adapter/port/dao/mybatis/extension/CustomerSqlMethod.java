package ai.basic.x1.adapter.port.dao.mybatis.extension;


import lombok.Getter;

/**
 * MybatisPlus自定义SQL方法枚举
 *
 * @author chqiu
 */
@Getter
public enum CustomerSqlMethod {

    MYSQL_INSERT_OR_UPDATE("mysqlInsertOrUpdateBatch","MYSQL系批量更新或插入","<script>INSERT INTO %s %s VALUES %s ON DUPLICATE KEY UPDATE %s</script>"),

    INSERT_BATCH("insertBatch","批量插入","<script>\nINSERT INTO %s %s VALUES %s\n</script>"),
    /**
     * 插入
     */
    INSERT_IGNORE_ONE("insertIgnore", "插入一条数据（选择字段插入），如果中已经存在相同的记录，则忽略当前新数据", "<script>\nINSERT IGNORE INTO %s %s VALUES %s\n</script>"),
    /**
     * 替换
     */
    REPLACE_ONE("replace", "替换一条数据（选择字段插入），存在则替换，不存在则插入", "<script>\nREPLACE INTO %s %s VALUES %s\n</script>");

    private final String method;
    private final String desc;
    private final String sql;

    CustomerSqlMethod(String method, String desc, String sql) {
        this.method = method;
        this.desc = desc;
        this.sql = sql;
    }
}

