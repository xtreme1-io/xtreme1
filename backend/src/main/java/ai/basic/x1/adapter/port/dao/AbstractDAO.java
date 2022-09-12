package ai.basic.x1.adapter.port.dao;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.enums.SqlMethod;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.metadata.TableInfo;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.baomidou.mybatisplus.core.toolkit.*;
import com.baomidou.mybatisplus.extension.conditions.query.LambdaQueryChainWrapper;
import com.baomidou.mybatisplus.extension.conditions.query.QueryChainWrapper;
import com.baomidou.mybatisplus.extension.conditions.update.LambdaUpdateChainWrapper;
import com.baomidou.mybatisplus.extension.conditions.update.UpdateChainWrapper;
import com.baomidou.mybatisplus.extension.kotlin.KtQueryChainWrapper;
import com.baomidou.mybatisplus.extension.kotlin.KtUpdateChainWrapper;
import com.baomidou.mybatisplus.extension.toolkit.ChainWrappers;
import com.baomidou.mybatisplus.extension.toolkit.SqlHelper;
import org.apache.ibatis.binding.MapperMethod;
import org.apache.ibatis.logging.Log;
import org.apache.ibatis.logging.LogFactory;
import org.apache.ibatis.session.SqlSession;
import org.mybatis.spring.SqlSessionUtils;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * @author Jagger Wang
 */
public abstract class AbstractDAO<M extends BaseMapper<T>, T> {
    protected Log log = LogFactory.getLog(getClass());

    private static final int DEFAULT_BATCH_SIZE = 1000;

    @Autowired
    protected M baseMapper;

    public M getBaseMapper() {
        return baseMapper;
    }

    protected Class<T> entityClass = currentModelClass();

    public Class<T> getEntityClass() {
        return entityClass;
    }

    protected Class<M> mapperClass = currentMapperClass();

    /**
     * Determine whether the database operation is successful
     *
     * @param result success count
     * @return boolean
     * @deprecated 3.3.1
     */
    @Deprecated
    protected boolean retBool(Integer result) {
        return SqlHelper.retBool(result);
    }

    protected Class<M> currentMapperClass() {
        return (Class<M>) ReflectionKit.getSuperClassGenericType(this.getClass(), AbstractDAO.class, 0);
    }

    protected Class<T> currentModelClass() {
        return (Class<T>) ReflectionKit.getSuperClassGenericType(this.getClass(), AbstractDAO.class, 1);
    }


    /**
     * batch sql SqlSession
     *
     * @deprecated 3.3.0
     */
    @Deprecated
    protected SqlSession sqlSessionBatch() {
        return SqlHelper.sqlSessionBatch(entityClass);
    }

    /**
     * close sqlSession
     *
     * @param sqlSession session
     * @deprecated 3.3.0
     */
    @Deprecated
    protected void closeSqlSession(SqlSession sqlSession) {
        SqlSessionUtils.closeSqlSession(sqlSession, GlobalConfigUtils.currentSessionFactory(entityClass));
    }

    /**
     * get SqlStatement
     *
     * @param sqlMethod ignore
     * @return ignore
     * @see #getSqlStatement(SqlMethod)
     * @deprecated 3.4.0
     */
    @Deprecated
    protected String sqlStatement(SqlMethod sqlMethod) {
        return SqlHelper.table(entityClass).getSqlStatement(sqlMethod.getMethod());
    }

    public boolean saveBatch(Collection<T> entityList) {
        return this.saveBatch(entityList, 1000);
    }

    /**
     * batch insert
     *
     * @param entityList ignore
     * @param batchSize  ignore
     * @return ignore
     */
    public boolean saveBatch(Collection<T> entityList, int batchSize) {
        String sqlStatement = getSqlStatement(SqlMethod.INSERT_ONE);
        return executeBatch(entityList, batchSize, (sqlSession, entity) -> sqlSession.insert(sqlStatement, entity));
    }

    /**
     * get mapperStatementId
     *
     * @param sqlMethod method name
     * @return named id
     * @since 3.4.0
     */
    protected String getSqlStatement(SqlMethod sqlMethod) {
        return SqlHelper.getSqlStatement(mapperClass, sqlMethod);
    }

    /**
     * TableId save or update
     *
     * @param entity
     * @return boolean
     */
    public boolean saveOrUpdate(T entity) {
        if (null != entity) {
            TableInfo tableInfo = TableInfoHelper.getTableInfo(this.entityClass);
            Assert.notNull(tableInfo, "error: can not execute. because can not find cache of TableInfo for entity!");
            String keyProperty = tableInfo.getKeyProperty();
            Assert.notEmpty(keyProperty, "error: can not execute. because can not find column for id from entity!");
            Object idVal = tableInfo.getPropertyValue(entity, tableInfo.getKeyProperty());
            return StringUtils.checkValNull(idVal) || Objects.isNull(getById((Serializable) idVal)) ? save(entity) : updateById(entity);
        }
        return false;
    }

    public boolean saveOrUpdateBatch(Collection<T> entityList) {
        return this.saveOrUpdateBatch(entityList, 1000);
    }

    public boolean saveOrUpdateBatch(Collection<T> entityList, int batchSize) {
        TableInfo tableInfo = TableInfoHelper.getTableInfo(entityClass);
        Assert.notNull(tableInfo, "error: can not execute. because can not find cache of TableInfo for entity!");
        String keyProperty = tableInfo.getKeyProperty();
        Assert.notEmpty(keyProperty, "error: can not execute. because can not find column for id from entity!");
        return SqlHelper.saveOrUpdateBatch(this.entityClass, this.mapperClass, this.log, entityList, batchSize, (sqlSession, entity) -> {
            Object idVal = tableInfo.getPropertyValue(entity, keyProperty);
            return StringUtils.checkValNull(idVal)
                    || CollectionUtils.isEmpty(sqlSession.selectList(getSqlStatement(SqlMethod.SELECT_BY_ID), entity));
        }, (sqlSession, entity) -> {
            MapperMethod.ParamMap<T> param = new MapperMethod.ParamMap<>();
            param.put(Constants.ENTITY, entity);
            sqlSession.update(getSqlStatement(SqlMethod.UPDATE_BY_ID), param);
        });
    }

    public boolean update(Wrapper<T> updateWrapper) {
        return this.update((T) null, updateWrapper);
    }

    public boolean update(T entity, Wrapper<T> updateWrapper) {
        return SqlHelper.retBool(this.getBaseMapper().update(entity, updateWrapper));
    }

    public boolean updateBatchById(Collection<T> entityList) {
        return this.updateBatchById(entityList, 1000);
    }

    public boolean updateBatchById(Collection<T> entityList, int batchSize) {
        String sqlStatement = getSqlStatement(SqlMethod.UPDATE_BY_ID);
        return executeBatch(entityList, batchSize, (sqlSession, entity) -> {
            MapperMethod.ParamMap<T> param = new MapperMethod.ParamMap<>();
            param.put(Constants.ENTITY, entity);
            sqlSession.update(sqlStatement, param);
        });
    }

    public List<T> listByIds(Collection<? extends Serializable> idList) {
        return this.getBaseMapper().selectBatchIds(idList);
    }

    public List<T> listByMap(Map<String, Object> columnMap) {
        return this.getBaseMapper().selectByMap(columnMap);
    }

    public T getOne(Wrapper<T> queryWrapper) {
        return this.getOne(queryWrapper, true);
    }

    public T getOne(Wrapper<T> queryWrapper, boolean throwEx) {
        if (throwEx) {
            return baseMapper.selectOne(queryWrapper);
        }
        return SqlHelper.getObject(log, baseMapper.selectList(queryWrapper));
    }

    public Map<String, Object> getMap(Wrapper<T> queryWrapper) {
        return SqlHelper.getObject(log, baseMapper.selectMaps(queryWrapper));
    }

    public <V> V getObj(Wrapper<T> queryWrapper, Function<? super Object, V> mapper) {
        return SqlHelper.getObject(log, listObjs(queryWrapper, mapper));
    }

    public long count() {
        return this.count(Wrappers.emptyWrapper());
    }

    public long count(Wrapper<T> queryWrapper) {
        return SqlHelper.retCount(this.getBaseMapper().selectCount(queryWrapper));
    }

    /**
     * execute batch
     *
     * @param consumer consumer
     * @since 3.3.0
     * @deprecated 3.3.1
     */
    @Deprecated
    protected boolean executeBatch(Consumer<SqlSession> consumer) {
        return SqlHelper.executeBatch(this.entityClass, this.log, consumer);
    }

    /**
     * execute batch
     *
     * @param list      data list
     * @param batchSize size
     * @param consumer  method
     * @param <E>       generics type
     * @return Operation result
     * @since 3.3.1
     */
    protected <E> boolean executeBatch(Collection<E> list, int batchSize, BiConsumer<SqlSession, E> consumer) {
        return SqlHelper.executeBatch(this.entityClass, this.log, list, batchSize, consumer);
    }

    /**
     * batch execute
     *
     * @param list     data list
     * @param consumer method
     * @param <E>      generics type
     * @return execute result
     * @since 3.3.1
     */
    protected <E> boolean executeBatch(Collection<E> list, BiConsumer<SqlSession, E> consumer) {
        return executeBatch(list, DEFAULT_BATCH_SIZE, consumer);
    }

    public boolean removeById(Serializable id) {
        TableInfo tableInfo = TableInfoHelper.getTableInfo(getEntityClass());
        if (tableInfo.isWithLogicDelete() && tableInfo.isWithUpdateFill()) {
            return removeById(id, true);
        }
        return SqlHelper.retBool(getBaseMapper().deleteById(id));
    }

    public boolean removeById(T entity) {
        return SqlHelper.retBool(this.getBaseMapper().deleteById(entity));
    }

    public boolean removeByMap(Map<String, Object> columnMap) {
        Assert.notEmpty(columnMap, "error: columnMap must not be empty", new Object[0]);
        return SqlHelper.retBool(this.getBaseMapper().deleteByMap(columnMap));
    }

    public boolean remove(Wrapper<T> queryWrapper) {
        return SqlHelper.retBool(this.getBaseMapper().delete(queryWrapper));
    }

    public boolean removeByIds(Collection<?> list) {
        if (CollectionUtils.isEmpty(list)) {
            return false;
        }
        TableInfo tableInfo = TableInfoHelper.getTableInfo(getEntityClass());
        if (tableInfo.isWithLogicDelete() && tableInfo.isWithUpdateFill()) {
            return removeBatchByIds(list, true);
        }
        return SqlHelper.retBool(getBaseMapper().deleteBatchIds(list));
    }

    public boolean removeByIds(Collection<?> list, boolean useFill) {
        if (CollectionUtils.isEmpty(list)) {
            return false;
        } else {
            return useFill ? this.removeBatchByIds(list, true) : SqlHelper.retBool(this.getBaseMapper().deleteBatchIds(list));
        }
    }

    public boolean removeBatchByIds(Collection<?> list) {
        return this.removeBatchByIds(list, 1000);
    }

    public boolean removeById(Serializable id, boolean useFill) {
        TableInfo tableInfo = TableInfoHelper.getTableInfo(entityClass);
        if (useFill && tableInfo.isWithLogicDelete()) {
            if (!entityClass.isAssignableFrom(id.getClass())) {
                T instance = tableInfo.newInstance();
                tableInfo.setPropertyValue(instance, tableInfo.getKeyProperty(), id);
                return removeById(instance);
            }
        }
        return SqlHelper.retBool(getBaseMapper().deleteById(id));
    }

    public boolean removeBatchByIds(Collection<?> list, int batchSize) {
        TableInfo tableInfo = TableInfoHelper.getTableInfo(entityClass);
        return removeBatchByIds(list, batchSize, tableInfo.isWithLogicDelete() && tableInfo.isWithUpdateFill());
    }

    public boolean removeBatchByIds(Collection<?> list, int batchSize, boolean useFill) {
        String sqlStatement = getSqlStatement(SqlMethod.DELETE_BY_ID);
        TableInfo tableInfo = TableInfoHelper.getTableInfo(entityClass);
        return executeBatch(list, batchSize, (sqlSession, e) -> {
            if (useFill && tableInfo.isWithLogicDelete()) {
                if (entityClass.isAssignableFrom(e.getClass())) {
                    sqlSession.update(sqlStatement, e);
                } else {
                    T instance = tableInfo.newInstance();
                    tableInfo.setPropertyValue(instance, tableInfo.getKeyProperty(), e);
                    sqlSession.update(sqlStatement, instance);
                }
            } else {
                sqlSession.update(sqlStatement, e);
            }
        });
    }

    public T getById(Serializable id) {
        return this.getBaseMapper().selectById(id);
    }

    public boolean save(T entity) {
        return SqlHelper.retBool(this.getBaseMapper().insert(entity));
    }

    public boolean updateById(T entity) {
        return SqlHelper.retBool(this.getBaseMapper().updateById(entity));
    }


    public List<T> list(Wrapper<T> queryWrapper) {
        return this.getBaseMapper().selectList(queryWrapper);
    }

    public List<T> list() {
        return this.list(Wrappers.emptyWrapper());
    }


    public List<Object> listObjs() {
        return this.listObjs(Function.identity());
    }

    public <V> List<V> listObjs(Function<? super Object, V> mapper) {
        return this.listObjs(Wrappers.emptyWrapper(), mapper);
    }

    public List<Object> listObjs(Wrapper<T> queryWrapper) {
        return this.listObjs(queryWrapper, Function.identity());
    }

    public <V> List<V> listObjs(Wrapper<T> queryWrapper, Function<? super Object, V> mapper) {
        return (List) this.getBaseMapper().selectObjs(queryWrapper).stream().filter(Objects::nonNull).map(mapper).collect(Collectors.toList());
    }

    public boolean removeBatchByIds(Collection<?> list, boolean useFill) {
        return this.removeBatchByIds(list, 1000, useFill);
    }

    public <E extends IPage<T>> E page(E page, Wrapper<T> queryWrapper) {
        return this.getBaseMapper().selectPage(page, queryWrapper);
    }

    public <E extends IPage<T>> E page(E page) {
        return this.page(page, Wrappers.emptyWrapper());
    }

    public List<Map<String, Object>> listMaps(Wrapper<T> queryWrapper) {
        return this.getBaseMapper().selectMaps(queryWrapper);
    }

    public List<Map<String, Object>> listMaps() {
        return this.listMaps(Wrappers.emptyWrapper());
    }

    public <E extends IPage<Map<String, Object>>> E pageMaps(E page, Wrapper<T> queryWrapper) {
        return this.getBaseMapper().selectMapsPage(page, queryWrapper);
    }

    public <E extends IPage<Map<String, Object>>> E pageMaps(E page) {
        return this.pageMaps(page, Wrappers.emptyWrapper());
    }

    public QueryChainWrapper<T> query() {
        return ChainWrappers.queryChain(this.getBaseMapper());
    }

    public LambdaQueryChainWrapper<T> lambdaQuery() {
        return ChainWrappers.lambdaQueryChain(this.getBaseMapper());
    }

    public KtQueryChainWrapper<T> ktQuery() {
        return ChainWrappers.ktQueryChain(this.getBaseMapper(), this.getEntityClass());
    }

    public KtUpdateChainWrapper<T> ktUpdate() {
        return ChainWrappers.ktUpdateChain(this.getBaseMapper(), this.getEntityClass());
    }

    public UpdateChainWrapper<T> update() {
        return ChainWrappers.updateChain(this.getBaseMapper());
    }

    public LambdaUpdateChainWrapper<T> lambdaUpdate() {
        return ChainWrappers.lambdaUpdateChain(this.getBaseMapper());
    }

    public boolean saveOrUpdate(T entity, Wrapper<T> updateWrapper) {
        return this.update(entity, updateWrapper) || this.saveOrUpdate(entity);
    }
}
