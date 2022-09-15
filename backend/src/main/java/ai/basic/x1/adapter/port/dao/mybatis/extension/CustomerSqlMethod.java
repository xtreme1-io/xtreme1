package ai.basic.x1.adapter.port.dao.mybatis.extension;


import lombok.Getter;

/**
 * MybatisPlus customer sql method enum
 *
 * @author andy
 */
@Getter
public enum CustomerSqlMethod {

    /**
     * MYSQL_INSERT_OR_UPDATE
     */
    MYSQL_INSERT_OR_UPDATE("mysqlInsertOrUpdateBatch", "MYSQL batch insert on duplicate key", "<script>INSERT INTO %s %s VALUES %s ON DUPLICATE KEY UPDATE %s</script>"),

    /**
     * INSERT_BATCH
     */
    INSERT_BATCH("insertBatch", "Batch insert ", "<script>\nINSERT INTO %s %s VALUES %s\n</script>"),

    /**
     * INSERT_IGNORE_ONE
     */
    INSERT_IGNORE_ONE("insertIgnore", "Insert ignore repeat data", "<script>\nINSERT IGNORE INTO %s %s VALUES %s\n</script>"),

    /**
     * REPLACE_ONE
     */
    REPLACE_ONE("replace", "Replace data", "<script>\nREPLACE INTO %s %s VALUES %s\n</script>");

    private final String method;
    private final String desc;
    private final String sql;

    CustomerSqlMethod(String method, String desc, String sql) {
        this.method = method;
        this.desc = desc;
        this.sql = sql;
    }
}

