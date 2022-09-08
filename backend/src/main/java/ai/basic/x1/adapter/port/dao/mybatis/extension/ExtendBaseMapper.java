package ai.basic.x1.adapter.port.dao.mybatis.extension;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.toolkit.Constants;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * extend sql method
 * @author andy
 */
public interface ExtendBaseMapper<T> extends BaseMapper<T> {

    /**
     * batchInsert
     * @param list dataList
     *  @return success count
     */
    int insertBatch(@Param(Constants.LIST) List<T> list);

    /**
     * mysql batch insert or update
     * @param list dataList
     * @return success count
     */
    int mysqlInsertOrUpdateBatch(@Param(Constants.LIST) List<T> list);

    /**
     * logic deleted
     * @param list dataList
     * @return success count
     */
    int logicDeleteBatchByIdsWithFill(@Param(Constants.COLLECTION) List<T> list);

    /**
     * insert ignore

     * @param entity data
     * @return success count
     */
    int insertIgnore(T entity);

    /**
     * batch insert ignore
     * @param entityList dataList
     * @return success count
     */
    int insertIgnoreBatch(List<T> entityList);

    /**
     * replace
     * Replace Into means inserting the replacement data. The demand table is PrimaryKey, or the Unique index.
     * If the database already exists in data, replace it with new data.
     * If there is no data effect, it is the same as Insert into;
     * @param entity data
     * @return success count
     */
    int replace(T entity);

}
