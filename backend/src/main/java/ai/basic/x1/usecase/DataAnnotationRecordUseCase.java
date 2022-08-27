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
     * 查询当前登录人在dataset下的锁定数据
     *
     * @param datasetId 数据集ID
     * @param userId    用户ID
     * @return 锁定记录对象
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
     * 对数据进行解锁
     *
     * @param recordId 锁定记录ID
     * @param userId   用户ID
     */
    public void unLockByRecordId(Long recordId, Long userId) {
        var dataAnnotationRecord = dataAnnotationRecordDAO.getById(recordId);
        //暂时没有查询到记录 认为已经解锁
        if (ObjectUtil.isNull(dataAnnotationRecord)) {
            return;
        }
        if (!dataAnnotationRecord.getCreatedBy().equals(userId)) {
            throw new UsecaseException(DATASET_DATA_UNLOCK_ID_ERROR);
        }
        dataAnnotationRecordDAO.removeById(recordId);
        //删除data_edit中锁定数据
        var lambdaQueryWrapper = new LambdaQueryWrapper<DataEdit>();
        lambdaQueryWrapper.eq(DataEdit::getAnnotationRecordId, recordId);
        dataEditDAO.remove(lambdaQueryWrapper);
    }

    /**
     * 清除模型结果信息
     *
     * @param serialNo 模型流水号
     * @param dataIds  数据ID集合
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
     * 根据锁定记录ID查询锁定记录
     *
     * @param recordId 锁定记录ID
     * @param userId   用户ID
     * @return 数据锁定对象
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
