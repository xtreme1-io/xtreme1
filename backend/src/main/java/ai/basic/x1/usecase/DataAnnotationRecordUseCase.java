package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.DataAnnotationRecordDAO;
import ai.basic.x1.adapter.port.dao.DataEditDAO;
import ai.basic.x1.adapter.port.dao.ModelDataResultDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataAnnotationRecord;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataEdit;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelDataResult;
import ai.basic.x1.entity.DataAnnotationRecordBO;
import ai.basic.x1.entity.LockRecordBO;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.util.ObjectUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
     * @param userId   user id
     */
    public void unLockByUserId(Long userId) {
        var dataAnnotationRecordLambdaQueryWrapper = new LambdaQueryWrapper<DataAnnotationRecord>();
        dataAnnotationRecordLambdaQueryWrapper.eq(DataAnnotationRecord::getCreatedBy, userId);
        dataAnnotationRecordDAO.remove(dataAnnotationRecordLambdaQueryWrapper);
        var dataEditLambdaQueryWrapper = new LambdaQueryWrapper<DataEdit>();
        dataEditLambdaQueryWrapper.eq(DataEdit::getCreatedBy, userId);
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

}
