package ai.basic.x1.usecase;

import ai.basic.x1.adapter.api.context.RequestContextHolder;
import ai.basic.x1.adapter.port.dao.DataAnnotationObjectDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataAnnotationObject;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataEdit;
import ai.basic.x1.adapter.port.dao.mybatis.query.ScenarioQuery;
import ai.basic.x1.entity.DataAnnotationObjectBO;
import ai.basic.x1.entity.DataInfoBO;
import ai.basic.x1.entity.ScenarioQueryBO;
import ai.basic.x1.entity.UserBO;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.collection.ListUtil;
import cn.hutool.core.util.ObjectUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @author chenchao
 * @date 2022/8/26
 */
public class DataAnnotationObjectUseCase {

    @Autowired
    private DataAnnotationObjectDAO dataAnnotationObjectDAO;

    @Autowired
    private DataEditUseCase dataEditUseCase;

    @Autowired
    private UserUseCase userUseCase;

    /**
     * query results of annotation
     *
     * @param dataIds data id list
     * @return results pf annotation
     */
    public List<DataAnnotationObjectBO> findByDataIds(List<Long> dataIds) {
        var lambdaQueryWrapper = Wrappers.lambdaQuery(DataAnnotationObject.class);
        lambdaQueryWrapper.in(DataAnnotationObject::getDataId, dataIds);
        return DefaultConverter.convert(dataAnnotationObjectDAO.list(lambdaQueryWrapper), DataAnnotationObjectBO.class);
    }

    /**
     * @param dataAnnotationObjectBOs object that need insert or update
     * @param deleteDataIds           data id that need delete all objects
     */
    @Transactional(rollbackFor = Exception.class)
    public List<DataAnnotationObjectBO> save(List<DataAnnotationObjectBO> dataAnnotationObjectBOs, Set<Long> deleteDataIds) {
        Set<Long> dataIds = dataAnnotationObjectBOs.stream().map(DataAnnotationObjectBO::getDataId).collect(Collectors.toSet());
        dataIds.addAll(deleteDataIds);
        removeAllObjectByDataIds(deleteDataIds);
        List<DataAnnotationObjectBO> dataAnnotationObjectBOS = updateDataAnnotationObject(dataAnnotationObjectBOs);
        return dataAnnotationObjectBOS;
    }

    private List<DataAnnotationObjectBO> updateDataAnnotationObject(List<DataAnnotationObjectBO> dataAnnotationObjectBOs) {
        if (ObjectUtil.isEmpty(dataAnnotationObjectBOs)) {
            return new ArrayList<>();
        }
        Set<Long> dataIds = dataAnnotationObjectBOs.stream().map(DataAnnotationObjectBO::getDataId).collect(Collectors.toSet());
        var lambdaQueryWrapper = Wrappers.lambdaQuery(DataAnnotationObject.class)
                .in(DataAnnotationObject::getDataId, dataIds);
        List<DataAnnotationObject> oldInfos = dataAnnotationObjectDAO.list(lambdaQueryWrapper);
        var oldInfoMap = oldInfos.stream().collect(Collectors.toMap(DataAnnotationObject::getId, dataAnnotationObject -> dataAnnotationObject));

        List<DataAnnotationObjectBO> needUpdateObjectBOs = new ArrayList<>();
        List<DataAnnotationObjectBO> needInsertObjectBOs = new ArrayList<>();
        dataAnnotationObjectBOs.forEach(object -> {
            if (ObjectUtil.isNotNull(object.getId()) && ObjectUtil.isNotNull(oldInfoMap.get(object.getId()))) {
                object.setCreatedAt(oldInfoMap.get(object.getId()).getCreatedAt());
                object.setCreatedBy(oldInfoMap.get(object.getId()).getCreatedBy());
                needUpdateObjectBOs.add(object);
            } else if (ObjectUtil.isNull(object.getId())) {
                object.setCreatedAt(OffsetDateTime.now());
                object.setCreatedBy(RequestContextHolder.getContext().getUserInfo().getId());
                needInsertObjectBOs.add(object);
            }
        });
        // Returns the inserted list, which contains three values of dataId, id and frontId. It is used to update the id
        // to the inserted value in the front-end. This is to solve the problem of multiple consecutive saves, deleting
        // and re-inserting the inserted value, because the background is Determine whether the insert or update is based
        // on whether it contains an id
        List<DataAnnotationObjectBO> insertObjectBOs = new ArrayList<>();
        if (ObjectUtil.isNotEmpty(needInsertObjectBOs)) {
            var needInserts = DefaultConverter.convert(needInsertObjectBOs, DataAnnotationObject.class);
            dataAnnotationObjectDAO.getBaseMapper().insertBatch(needInserts);
            insertObjectBOs = DefaultConverter.convert(needInserts, DataAnnotationObjectBO.class);
        }
        if (ObjectUtil.isNotEmpty(needUpdateObjectBOs)) {
            var sublist = ListUtil.split(needUpdateObjectBOs, 2000);
            sublist.forEach(sub -> {
                var needUpdates = DefaultConverter.convert(sub, DataAnnotationObject.class);
                dataAnnotationObjectDAO.getBaseMapper().mysqlInsertOrUpdateBatch(needUpdates);
            });
        }
        Set<Long> dataAnnotationIds = needUpdateObjectBOs.stream().map(DataAnnotationObjectBO::getId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> oldIds = oldInfoMap.keySet();
        // remove all incoming object ids, the rest are deleted
        oldIds.removeIf(dataAnnotationIds::contains);
        dataAnnotationObjectDAO.removeBatchByIds(oldIds);
        return insertObjectBOs;
    }

    private void removeAllObjectByDataIds(Set<Long> dataIds) {
        if (CollUtil.isEmpty(dataIds)) {
            return;
        }
        LambdaQueryWrapper<DataAnnotationObject> deleteWrapper = new LambdaQueryWrapper<>();
        deleteWrapper.in(DataAnnotationObject::getDataId, dataIds);
        dataAnnotationObjectDAO.remove(deleteWrapper);
    }

    public Long countObjectByDatasetId(Long datasetId) {
        return dataAnnotationObjectDAO.count(new LambdaQueryWrapper<DataAnnotationObject>()
                .eq(DataAnnotationObject::getDatasetId, datasetId));
    }

    public Page<DataAnnotationObjectBO> findByScenarioPage(Integer pageNo, Integer pageSize, ScenarioQueryBO scenarioQueryBO) {
        var page = dataAnnotationObjectDAO.getBaseMapper().findByScenarioPage(new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(pageNo, pageSize),
                DefaultConverter.convert(scenarioQueryBO, ScenarioQuery.class));
        var dataAnnotationObjectBOPage = DefaultConverter.convert(page, DataAnnotationObjectBO.class);
        var dataAnnotationObjectBOList = dataAnnotationObjectBOPage.getList();
        if (CollectionUtil.isNotEmpty(dataAnnotationObjectBOList)) {
            var dataIds = dataAnnotationObjectBOList.stream().map(DataAnnotationObjectBO::getDataId).collect(Collectors.toList());
            var userIdMap = dataEditUseCase.getDataEditByDataIds(dataIds);
            var userIds = userIdMap.values();
            if (CollectionUtil.isNotEmpty(userIds)) {
                var userBOS = userUseCase.findByIds(ListUtil.toList(userIds));
                var userMap = userBOS.stream()
                        .collect(Collectors.toMap(UserBO::getId, UserBO::getNickname, (k1, k2) -> k1));
                dataAnnotationObjectBOList.forEach(dataAnnotationObjectBO -> dataAnnotationObjectBO.setLockedBy(userMap.get(userIdMap.get(dataAnnotationObjectBO.getDataId()))));
            }
        }
        return dataAnnotationObjectBOPage;
    }

    public List<DataAnnotationObjectBO> listByScenario(ScenarioQueryBO scenarioQueryBO) {
        var dataAnnotationObjectList = dataAnnotationObjectDAO.getBaseMapper().listByScenario(DefaultConverter.convert(scenarioQueryBO, ScenarioQuery.class));
        return DefaultConverter.convert(dataAnnotationObjectList, DataAnnotationObjectBO.class);
    }

    public Page<DataAnnotationObjectBO> findDataIdByScenarioPage(ScenarioQueryBO scenarioQueryBO) {
        var page = dataAnnotationObjectDAO.getBaseMapper().findDataIdByScenarioPage(
                new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(scenarioQueryBO.getPageNo(), scenarioQueryBO.getPageSize()),
                DefaultConverter.convert(scenarioQueryBO, ScenarioQuery.class));
        return DefaultConverter.convert(page, DataAnnotationObjectBO.class);
    }

}
