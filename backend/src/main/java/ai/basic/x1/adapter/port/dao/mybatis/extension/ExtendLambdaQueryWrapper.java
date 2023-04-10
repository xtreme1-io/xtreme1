package ai.basic.x1.adapter.port.dao.mybatis.extension;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.StringPool;
import com.baomidou.mybatisplus.core.toolkit.support.ColumnCache;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;

/**
 * expand
 * @author fyb
 */
public class ExtendLambdaQueryWrapper<T> extends LambdaQueryWrapper<T> {

    protected String alias;

    protected String columnToString(SFunction<T, ?> column, boolean onlyColumn) {
        ColumnCache cache = getColumnCache(column);
        String columnStr = onlyColumn ? cache.getColumn() : cache.getColumnSelect();
        return alias != null ? alias + StringPool.DOT + columnStr : columnStr;
    }

    /**
     * Obtaining the SQL segment equivalent to the where condition defined in
     * the wrapper is the same as the getCustomSqlSegment method, the only difference is that the table alias of the condition in the where statement can be specified)
     * <p>
     * Instructions: `select xxx from table_a as a left join table_b as b on b.a_id = a.id` + ${ew.customSqlSegment("a")}
     * <p>
     */
    public String customSqlSegment(String alias) {
        this.alias = alias;
        String sqlSegment = getCustomSqlSegment();
        this.alias = null;
        return sqlSegment;
    }
}
