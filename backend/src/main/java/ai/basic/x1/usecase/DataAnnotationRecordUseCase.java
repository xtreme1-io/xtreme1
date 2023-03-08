package ai.basic.x1.usecase;

import ai.basic.x1.adapter.api.context.RequestContextHolder;
import ai.basic.x1.adapter.api.context.UserInfo;
import ai.basic.x1.adapter.port.dao.DataAnnotationRecordDAO;
import ai.basic.x1.adapter.port.dao.DataEditDAO;
import ai.basic.x1.adapter.port.dao.ModelDataResultDAO;
import ai.basic.x1.adapter.port.dao.UserDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataAnnotationRecord;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataEdit;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelDataResult;
import ai.basic.x1.adapter.port.dao.mybatis.model.User;
import ai.basic.x1.entity.DataAnnotationRecordBO;
import ai.basic.x1.entity.LockRecordBO;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.util.ObjectUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

import static ai.basic.x1.usecase.exception.UsecaseCode.DATASET_DATA_UNLOCK_ID_ERROR;

/**
 * @author fyb
 * @date 2022/3/16 10:31
 */
public class DataAnnotationRecordUseCase {

    @Autowired
    private DataEditDAO dataEditDAO;

    @Autowired
    private DataEditUseCase dataEditUseCase;

    @Autowired
    private DataAnnotationRecordDAO dataAnnotationRecordDAO;

    @Autowired
    private ModelDataResultDAO modelDataResultDAO;

    @Autowired
    private UserDAO userDAO;

    /**
     * get locked record by user id
     *
     * @param datasetId dataset id
     * @param userId    user id
     * @return locked records
     */
    public LockRecordBO findLockRecordIdByDatasetId(Long datasetId, Long userId) {
        var lambdaQueryWrapper = new LambdaQueryWrapper<DataAnnotationRecord>();
        lambdaQueryWrapper.eq(DataAnnotationRecord::getDatasetId, datasetId);
        lambdaQueryWrapper.eq(DataAnnotationRecord::getCreatedBy, userId);
        var dataAnnotationRecord = dataAnnotationRecordDAO.getOne(lambdaQueryWrapper);
        if (ObjectUtil.isNotNull(dataAnnotationRecord)) {
            var recordId = dataAnnotationRecord.getId();
            var dataEditLambdaQueryWrapper = new LambdaQueryWrapper<DataEdit>();
            dataEditLambdaQueryWrapper.eq(DataEdit::getAnnotationRecordId, recordId);
            return LockRecordBO.builder().recordId(dataAnnotationRecord.getId())
                    .lockedNum(dataEditDAO.count(dataEditLambdaQueryWrapper)).build();
        }
        return null;
    }

    /**
     * unlock data by record id
     *
     * @param recordId record id
     * @param userId   user id
     */
    public void unLockByRecordId(Long recordId, Long userId) {
        var dataAnnotationRecord = dataAnnotationRecordDAO.getById(recordId);
        if (ObjectUtil.isNull(dataAnnotationRecord)) {
            return;
        }
        if (!dataAnnotationRecord.getCreatedBy().equals(userId)) {
            throw new UsecaseException(DATASET_DATA_UNLOCK_ID_ERROR);
        }
        dataAnnotationRecordDAO.removeById(recordId);
        var lambdaQueryWrapper = new LambdaQueryWrapper<DataEdit>();
        lambdaQueryWrapper.eq(DataEdit::getAnnotationRecordId, recordId);
        dataEditDAO.remove(lambdaQueryWrapper);
    }

    /**
     * unlock data by user id
     *
     * @param userIds user id
     */
    public void unLockByUserIds(Set<Long> userIds) {
        var dataAnnotationRecordLambdaQueryWrapper = new LambdaQueryWrapper<DataAnnotationRecord>();
        dataAnnotationRecordLambdaQueryWrapper.in(DataAnnotationRecord::getCreatedBy, userIds);
        dataAnnotationRecordDAO.remove(dataAnnotationRecordLambdaQueryWrapper);
        var dataEditLambdaQueryWrapper = new LambdaQueryWrapper<DataEdit>();
        dataEditLambdaQueryWrapper.in(DataEdit::getCreatedBy, userIds);
        dataEditDAO.remove(dataEditLambdaQueryWrapper);
    }

    /**
     * clean model running result
     *
     * @param serialNo serial number
     * @param dataIds  data ids
     */
    @Transactional(rollbackFor = Exception.class)
    public void removeModelDataResult(Long serialNo, List<Long> dataIds) {
        var lambdaUpdateWrapper = Wrappers.lambdaQuery(ModelDataResult.class);
        lambdaUpdateWrapper.eq(ModelDataResult::getModelSerialNo, serialNo);
        if (CollectionUtil.isNotEmpty(dataIds)) {
            lambdaUpdateWrapper.in(ModelDataResult::getDataId, dataIds);
        }
        modelDataResultDAO.remove(lambdaUpdateWrapper);
        var lambdaQueryWrapper = Wrappers.lambdaQuery(ModelDataResult.class);
        lambdaQueryWrapper.eq(ModelDataResult::getModelSerialNo, serialNo);
        var resultCount = modelDataResultDAO.count(lambdaQueryWrapper);
        if (resultCount == 0) {
            var recordLambdaUpdateWrapper = Wrappers.lambdaUpdate(DataAnnotationRecord.class)
                    .eq(DataAnnotationRecord::getSerialNo, serialNo);
            recordLambdaUpdateWrapper.set(DataAnnotationRecord::getSerialNo, null);
            dataAnnotationRecordDAO.update(recordLambdaUpdateWrapper);
        }
    }


    /**
     * get locked record by record id
     *
     * @param recordId record id
     * @param userId   user id
     * @return locked record
     */
    public DataAnnotationRecordBO findDataAnnotationRecordById(Long recordId, Long userId) {
        var lambdaQueryWrapper = new LambdaQueryWrapper<DataAnnotationRecord>();
        lambdaQueryWrapper.eq(DataAnnotationRecord::getId, recordId);
        lambdaQueryWrapper.eq(DataAnnotationRecord::getCreatedBy, userId);
        var dataAnnotationRecord = dataAnnotationRecordDAO.getOne(lambdaQueryWrapper);
        var dataAnnotationRecordBO = DefaultConverter.convert(dataAnnotationRecord, DataAnnotationRecordBO.class);
        if (ObjectUtil.isNotNull(dataAnnotationRecordBO)) {
            dataAnnotationRecordBO.setDatas(dataEditUseCase.findDataEditByRecordId(recordId, userId));
        }
        return dataAnnotationRecordBO;
    }

    /**
     * Query dataset lock records for all locking users in the dataset.
     *
     * @param datasetId Dataset Id
     * @return Locked record object collection.
     */
    public List<LockRecordBO> findLockRecordByDatasetId(Long datasetId) {
        var lambdaQueryWrapper = new LambdaQueryWrapper<DataAnnotationRecord>();
        lambdaQueryWrapper.eq(DataAnnotationRecord::getDatasetId, datasetId);
        var dataAnnotationRecordList = dataAnnotationRecordDAO.list(lambdaQueryWrapper);
        if (CollectionUtil.isEmpty(dataAnnotationRecordList)) {
            return List.of();
        }
        var userIds = new ArrayList<Long>();
        var lockRecordIds = new ArrayList<Long>(dataAnnotationRecordList.size());
        var lockRecordList = new ArrayList<LockRecordBO>(dataAnnotationRecordList.size());
        var lockRecordUserMap = new HashMap<Long, Long>(dataAnnotationRecordList.size());
        dataAnnotationRecordList.forEach(dataAnnotationRecord -> {
            lockRecordIds.add(dataAnnotationRecord.getId());
            userIds.add(dataAnnotationRecord.getCreatedBy());
            var lockRecordBO = LockRecordBO.builder().recordId(dataAnnotationRecord.getId()).build();
            lockRecordList.add(lockRecordBO);
            lockRecordUserMap.put(dataAnnotationRecord.getId(), dataAnnotationRecord.getCreatedBy());
        });
        var dataAnnotationRecordQueryWrapper = new QueryWrapper<DataEdit>();
        dataAnnotationRecordQueryWrapper.select("annotation_record_id as annotationRecordId , count(*) as lockedNum")
                .lambda().in(DataEdit::getAnnotationRecordId, lockRecordIds)
                .groupBy(DataEdit::getAnnotationRecordId);
        var dataEditMapList = dataEditDAO.listMaps(dataAnnotationRecordQueryWrapper);
        var dataEditList = DefaultConverter.convert(dataEditMapList, DataEdit.class);
        var lockRecordMap = dataEditList.stream().collect(Collectors.toMap(DataEdit::getAnnotationRecordId, DataEdit::getLockedNum));
        var userMap = new HashMap<Long, String>();
        var userList = userDAO.listByIds(userIds.stream().distinct().collect(Collectors.toList()));
        if (CollUtil.isNotEmpty(userList)) {
            userMap.putAll(userList.stream()
                    .collect(Collectors.toMap(User::getId, User::getNickname, (k1, k2) -> k1)));
        }
        lockRecordList.forEach(lockRecordBO -> {
            lockRecordBO.setLockedBy(userMap.get(lockRecordUserMap.get(lockRecordBO.getRecordId())));
            lockRecordBO.setLockedNum(lockRecordMap.get(lockRecordBO.getRecordId()));
        });
        return lockRecordList;
    }

    /**
     * Unlock data based on locked record ID.
     *
     * @param lockRecordIds Locked Record ID Collection
     */
    @Transactional(rollbackFor = Exception.class)
    public void unLockByLockRecordIds(List<Long> lockRecordIds) {
        dataAnnotationRecordDAO.removeBatchByIds(lockRecordIds);
        // Delete locked data in data_edit.
        var lambdaQueryWrapper = new LambdaQueryWrapper<DataEdit>();
        lambdaQueryWrapper.in(DataEdit::getAnnotationRecordId, lockRecordIds);
        var dataEditList = dataEditDAO.list(lambdaQueryWrapper);
        if (CollUtil.isNotEmpty(dataEditList)) {
            var targetUserIds = new HashSet<Long>();
            var dataEditIds = new ArrayList<Long>();
            var datasetId = new AtomicReference<Long>();
            dataEditList.forEach(dataEdit -> {
                dataEditIds.add(dataEdit.getId());
                datasetId.set(dataEdit.getDatasetId());
                targetUserIds.add(dataEdit.getCreatedBy());
            });
            dataEditDAO.removeBatchByIds(dataEditIds);
        }
    }

}
