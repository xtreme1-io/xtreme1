package ai.basic.x1.usecase;

import ai.basic.x1.adapter.api.context.RequestContextHolder;
import ai.basic.x1.adapter.port.dao.DataAnnotationObjectDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataAnnotationObject;
import ai.basic.x1.entity.DataAnnotationObjectBO;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.collection.ListUtil;
import cn.hutool.core.util.ObjectUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author chenchao
 * @date 2022/8/26
 */
public class DataAnnotationObjectUseCase {

    @Autowired
    private DataAnnotationObjectDAO dataAnnotationObjectDAO;

//    @Autowired
//    private DataEditDAO dataEditDAO;

    /**
     * 查询class标注结果
     *
     * @param dataIds   数据ID集合
     * @param queryDate 查询时间
     * @return
     */
    public List<DataAnnotationObjectBO> findByDataIds(List<Long> dataIds, OffsetDateTime queryDate) {
        var lambdaQueryWrapper = Wrappers.lambdaQuery(DataAnnotationObject.class);
        lambdaQueryWrapper.in(DataAnnotationObject::getDataId, dataIds);
        if (ObjectUtil.isNotNull(queryDate)) {
            lambdaQueryWrapper.le(DataAnnotationObject::getCreatedAt, queryDate);
        }
        var annotationObjects = DefaultConverter.convert(dataAnnotationObjectDAO.list(lambdaQueryWrapper), DataAnnotationObjectBO.class);
        return annotationObjects;
    }

    /**
     * 查询class标注结果
     *
     * @param dataIds     数据ID集合
     * @return 数据标注物体集合
     */
    public List<DataAnnotationObjectBO> findByDataIds(List<Long> dataIds) {
        var lambdaQueryWrapper = Wrappers.lambdaQuery(DataAnnotationObject.class);
        lambdaQueryWrapper.in(DataAnnotationObject::getDataId, dataIds);
        return DefaultConverter.convert(dataAnnotationObjectDAO.list(lambdaQueryWrapper), DataAnnotationObjectBO.class);
    }

    /**
     * 根据查询时间筛选数据库的数据，防止查询时间之后的数据被删除
     * 因为存在一种情况，在查询方法将数据返回给前端之后，model run产生数据，如果不进行筛选会导致这段时间内产生的数据被删除，但用户没有感知。
     *
     * @param dataAnnotationObjectBOs 输入数据
     * @param deleteDataIds           需要删除的dataId列表
     */
    @Transactional(rollbackFor = Exception.class)
    public List<DataAnnotationObjectBO> saveDataAnnotationObject(List<DataAnnotationObjectBO> dataAnnotationObjectBOs, Set<Long> deleteDataIds) {
        checkPermission(dataAnnotationObjectBOs, deleteDataIds);
        removeAllObjectByDataIds(deleteDataIds);
        List<DataAnnotationObjectBO> dataAnnotationObjectBOS = updateDataAnnotationObject(dataAnnotationObjectBOs);
        return dataAnnotationObjectBOS;
    }

    private void checkPermission(List<DataAnnotationObjectBO> dataAnnotationObjectBOs, Set<Long> deleteDataIds) {
//        Set<Long> lockedDataIdList = getLockedDataIdList(RequestContextHolder.getContext().getUserInfo().getId());
//        Set<Long> dataIds = dataAnnotationObjectBOs.stream().map(DataAnnotationObjectBO::getDataId).collect(Collectors.toSet());
//        if (!lockedDataIdList.containsAll(deleteDataIds)||!lockedDataIdList.containsAll(dataIds)){
//            throw new UsecaseException(UsecaseCode.DATASET__DATA__DATA_HAS_BEEN_UNLOCKED);
//        }
    }

    private List<DataAnnotationObjectBO> updateDataAnnotationObject(List<DataAnnotationObjectBO> dataAnnotationObjectBOs) {
        if (ObjectUtil.isEmpty(dataAnnotationObjectBOs)){
            return new ArrayList<>();
        }
        Set<Long> dataIds = dataAnnotationObjectBOs.stream().map(DataAnnotationObjectBO::getDataId).collect(Collectors.toSet());
        var lambdaQueryWrapper = Wrappers.lambdaQuery(DataAnnotationObject.class)
                .in(DataAnnotationObject::getDataId, dataIds);
        List<DataAnnotationObject> oldInfos = dataAnnotationObjectDAO.getBaseMapper().selectList(lambdaQueryWrapper);
        var oldInfoMap = oldInfos.stream().collect(Collectors.toMap(DataAnnotationObject::getId, dataAnnotationObject -> dataAnnotationObject));

        List<DataAnnotationObjectBO> needUpdateObjectBOs = new ArrayList<>();
        List<DataAnnotationObjectBO> needInsertObjectBOs = new ArrayList<>();
        dataAnnotationObjectBOs.forEach(object->{
            if (ObjectUtil.isNotNull(object.getId())&&ObjectUtil.isNotNull(oldInfoMap.get(object.getId()))){
                object.setCreatedAt(oldInfoMap.get(object.getId()).getCreatedAt());
                object.setCreatedBy(oldInfoMap.get(object.getId()).getCreatedBy());
                needUpdateObjectBOs.add(object);
            }else if (ObjectUtil.isNull(object.getId())){
                object.setCreatedAt(OffsetDateTime.now());
                object.setCreatedBy(RequestContextHolder.getContext().getUserInfo().getId());
                needInsertObjectBOs.add(object);
            }
        });
        // 返回插入的list，包含dataId，id和frontId三个值，用来前端将id更新到已插入的值中，
        // 是为了解决连续多次保存，将已插入的值删除重新插入的问题，因为后台是根据是否包含id来
        // 判断该插入还是更新
        List<DataAnnotationObjectBO> insertObjectBOs = new ArrayList<>();
        if (ObjectUtil.isNotEmpty(needInsertObjectBOs)){
            var needInserts = DefaultConverter.convert(needInsertObjectBOs, DataAnnotationObject.class);
            dataAnnotationObjectDAO.getBaseMapper().insertBatch(needInserts);
            insertObjectBOs = DefaultConverter.convert(needInserts, DataAnnotationObjectBO.class);
        }
        if (ObjectUtil.isNotEmpty(needUpdateObjectBOs)){
            var sublist = ListUtil.split(needUpdateObjectBOs, 2000);
            sublist.forEach(sub->{
                var needUpdates = DefaultConverter.convert(sub, DataAnnotationObject.class);
                //dataAnnotationObjectDAO.updateBatchById(needUpdates);
                dataAnnotationObjectDAO.getBaseMapper().mysqlInsertOrUpdateBatch(needUpdates);
            });
        }
        Set<Long> dataAnnotationIds = needUpdateObjectBOs.stream().map(DataAnnotationObjectBO::getId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> oldIds = oldInfoMap.keySet();
        //remove所有传入的object id，剩下的就是被删除的
        oldIds.removeIf(dataAnnotationIds::contains);
        dataAnnotationObjectDAO.removeBatchByIds(oldIds);
        return insertObjectBOs;
    }

//    public Set<Long> getLockedDataIdList(@NotNull Long userId){
//        var dataEditQueryWrapper = Wrappers.lambdaQuery(DataEdit.class)
//                .eq(DataEdit::getCreatedBy, userId);
//        List<DataEdit> dataEdits = dataEditDAO.list(dataEditQueryWrapper);
//        return dataEdits.stream().map(DataEdit::getDataId).collect(Collectors.toSet());
//    }

    @Transactional(rollbackFor = Throwable.class)
    public void removeAllObjectByDataIds(Set<Long> dataIds){
        if (CollUtil.isEmpty(dataIds)){
            return;
        }
        LambdaQueryWrapper<DataAnnotationObject> deleteWrapper = new LambdaQueryWrapper<>();
        deleteWrapper.in(DataAnnotationObject::getDataId,dataIds);
        dataAnnotationObjectDAO.remove(deleteWrapper);
    }
}
