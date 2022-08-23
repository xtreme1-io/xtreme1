package ai.basic.x1.adapter.port.dao.mybatis.extension;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.toolkit.Constants;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 扩展
 */
public interface ExtendBaseMapper<T> extends BaseMapper<T> {

    /**
     * 批量插入
     * @param list 需要插入对象集合
     *  @return 新增条数
     */
    int insertBatch(@Param(Constants.LIST) List<T> list);

    /**
     * 自定义批量新增或更新
     * @param list 需要插入更新对象集合
     * @return 更新新增条数
     */
    int mysqlInsertOrUpdateBatch(@Param(Constants.LIST) List<T> list);

    /**
     * 带填充的逻辑删除
     * @param list 需要删除对象集合
     * @return 删除条数
     */
    int logicDeleteBatchByIdsWithFill(@Param(Constants.COLLECTION) List<T> list);

    /**
     * 插入数据，如果中已经存在相同的记录，则忽略当前新数据

     * @param entity 实体类
     * @return 影响条数
     */
    int insertIgnore(T entity);

    /**
     * 批量插入数据，如果中已经存在相同的记录，则忽略当前新数据
     * @param entityList 实体类列表
     * @return 影响条数
     */
    int insertIgnoreBatch(List<T> entityList);

    /**
     * 替换数据
     * replace into表示插入替换数据，需求表中有PrimaryKey，或者unique索引，如果数据库已经存在数据，则用新数据替换，如果没有数据效果则和insert into一样；
     * @param entity 实体类
     * @return 影响条数
     */
    int replace(T entity);

}
