package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.ModelDAO;
import ai.basic.x1.adapter.port.dao.ModelDatasetResultDAO;
import ai.basic.x1.adapter.port.dao.ModelRunRecordDAO;
import ai.basic.x1.adapter.port.dao.mybatis.extension.ExtendLambdaQueryWrapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.*;
import ai.basic.x1.adapter.port.dao.redis.ModelSerialNoCountDAO;
import ai.basic.x1.adapter.port.dao.redis.ModelSerialNoIncrDAO;
import ai.basic.x1.entity.*;
import ai.basic.x1.entity.RunRecordQueryBO;
import ai.basic.x1.entity.enums.RunStatusEnum;
import ai.basic.x1.entity.enums.SortEnum;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.date.DatePattern;
import cn.hutool.core.date.DateUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.ObjectUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static ai.basic.x1.entity.enums.RunStatusEnum.SUCCESS;
import static ai.basic.x1.entity.enums.RunStatusEnum.SUCCESS_WITH_ERROR;


/**
 * @author fyb
 * @version 1.0
 */
@Slf4j
public class ModelRunRecordUseCase {

    @Autowired
    private ModelRunRecordDAO modelRunRecordDAO;

    @Autowired
    private ModelDatasetResultDAO modelDatasetResultDAO;

    @Autowired
    private ModelSerialNoCountDAO modelSerialNoCountDAO;

    @Autowired
    private ModelSerialNoIncrDAO modelSerialNoIncrDAO;

    @Autowired
    private ModelDAO modelDAO;

    @Autowired
    private ModelUseCase modelUseCase;

    public List<ModelRunRecordBO> findAllModelRunRecord(ModelRunRecordBO bo) {
        LambdaQueryWrapper<ModelRunRecord> modelRunRecordLambdaQueryWrapper = Wrappers.lambdaQuery();
        modelRunRecordLambdaQueryWrapper.eq(ObjectUtil.isNotNull(bo.getModelId()), ModelRunRecord::getModelId, bo.getModelId());
        modelRunRecordLambdaQueryWrapper.eq(ObjectUtil.isNotNull(bo.getDatasetId()), ModelRunRecord::getDatasetId, bo.getDatasetId());
        var modelRunRecordList = modelRunRecordDAO.getBaseMapper().selectList(modelRunRecordLambdaQueryWrapper);
        var result = DefaultConverter.convert(modelRunRecordList, ModelRunRecordBO.class);
        this.setProgressBar(result);
        return result;
    }

    @Transactional(readOnly = true)
    public Page<ModelRunRecordBO> findModelRunRecordByPage(RunRecordQueryBO bo, Integer pageNo, Integer pageSize) {
        var lambdaQueryWrapper = new ExtendLambdaQueryWrapper<ModelRunRecord>();
        lambdaQueryWrapper.eq(ModelRunRecord::getModelId, bo.getModelId());
        lambdaQueryWrapper.in(CollUtil.isNotEmpty(bo.getDatasetIds()), ModelRunRecord::getDatasetId, bo.getDatasetIds());
        lambdaQueryWrapper.like(ObjectUtil.isNotNull(bo.getRunNo()), ModelRunRecord::getRunNo, bo.getRunNo());
        lambdaQueryWrapper.eq(ObjectUtil.isNotNull(bo.getRunRecordType()), ModelRunRecord::getRunRecordType, bo.getRunRecordType());
        lambdaQueryWrapper.eq(ObjectUtil.isNotNull(bo.getStatus()), ModelRunRecord::getStatus, bo.getStatus());
        lambdaQueryWrapper.orderBy(true, SortEnum.ASC.equals(bo.getAscOrDesc()), ModelRunRecord::getCreatedAt);
        var modelRunRecordPage = modelRunRecordDAO.getBaseMapper().
                selectListWithDatasetNotDeleted(new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(pageNo, pageSize), lambdaQueryWrapper);
        var recordBOPage = DefaultConverter.convert(modelRunRecordPage, ModelRunRecordBO.class);
        this.setProgressBar(recordBOPage.getList());
        return recordBOPage;
    }

    public List<DatasetBO> findModelRunFilterDatasetName(String datasetName) {
        var datasetList = modelRunRecordDAO.getBaseMapper().findModelRunFilterDatasetName(datasetName);
        return DefaultConverter.convert(datasetList, DatasetBO.class);
    }


    private void setProgressBar(List<ModelRunRecordBO> modelRunRecords) {
        if (CollUtil.isNotEmpty(modelRunRecords)) {
            modelRunRecords.forEach(modelRunRecord -> {
                switch (modelRunRecord.getStatus()) {
                    case STARTED:
                        modelRunRecord.setCompletionRate(new BigDecimal(0));
                        break;
                    case SUCCESS:
                    case SUCCESS_WITH_ERROR:
                        modelRunRecord.setCompletionRate(new BigDecimal(1));
                        break;
                    case RUNNING:
                        try {
                            var total = modelSerialNoCountDAO.getCount(modelRunRecord.getModelSerialNo());
                            var progress = modelSerialNoIncrDAO.getCount(modelRunRecord.getModelSerialNo());
                            if (total != null && progress != null && progress > 0) {
                                var rate = new BigDecimal(progress).divide(new BigDecimal(total), 2, RoundingMode.HALF_UP);
                                modelRunRecord.setCompletionRate(rate);
                            }
                        } catch (Exception e) {
                            log.error("ModelRunRecord setProgressBar fail: " + e);
                        }
                        break;
                    default:
                }
            });
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteById(Long id) {
        ModelRunRecord modelRunRecord = modelRunRecordDAO.getById(id);
        if (modelRunRecord == null) {
            return;
        }
        modelRunRecordDAO.removeById(id);
        var modelRunRecordId = modelRunRecord.getId();

        modelDatasetResultDAO.remove(new LambdaUpdateWrapper<ModelDatasetResult>()
                .eq(ModelDatasetResult::getModelSerialNo, modelRunRecord.getModelSerialNo())
                .eq(ModelDatasetResult::getRunRecordId, modelRunRecordId)
        );
    }

    @Transactional(readOnly = true)
    public List<ModelRunRecordBO> findByIds(List<Long> ids) {
        return DefaultConverter.convert(modelRunRecordDAO.listByIds(ids),ModelRunRecordBO.class);
    }

    public List<ModelRunRecordBO> findByDatasetId(Long datasetId) {
        var lambdaQueryWrapper = Wrappers.lambdaQuery(ModelRunRecord.class);
        lambdaQueryWrapper.select(ModelRunRecord::getId, ModelRunRecord::getModelId, ModelRunRecord::getRunNo);
        lambdaQueryWrapper.eq(ModelRunRecord::getDatasetId, datasetId);
        lambdaQueryWrapper.in(ModelRunRecord::getStatus, List.of(SUCCESS, SUCCESS_WITH_ERROR));
        var modelRunRecordList = modelRunRecordDAO.list(lambdaQueryWrapper);
        return DefaultConverter.convert(modelRunRecordList,ModelRunRecordBO.class);
    }

    public List<DatasetModelResultBO> getDatasetModelRunResult(Long datasetId) {
       var modelRunRecordBOList = this.findByDatasetId(datasetId);
        if (CollUtil.isEmpty(modelRunRecordBOList)) {
            return List.of();
        }
        var modelResultBOList = new ArrayList<DatasetModelResultBO>();
        var modelIds = modelRunRecordBOList.stream().map(ModelRunRecordBO::getModelId).collect(Collectors.toSet());
        var modelList = modelDAO.listByIds(modelIds);
        var modelMap = modelList.stream().collect(Collectors.toMap(Model::getId, Model::getName));
        var modelRunMap = modelRunRecordBOList.stream().collect(Collectors.groupingBy(ModelRunRecordBO::getModelId));
        modelRunMap.forEach((modelId, runRecordList) -> {
            var runRecordBOList = runRecordList.stream().map(runRecord -> DefaultConverter.convert(runRecord, RunRecordBO.class)).collect(Collectors.toList());
            var datasetModelResultBO = DatasetModelResultBO.builder().modelId(modelId)
                    .modelName(modelMap.get(modelId)).runRecords(runRecordBOList).build();
            modelResultBOList.add(datasetModelResultBO);

        });
        return modelResultBOList;
    }

    public Long save(Long modelId, Long datasetId, Long totalDataNum) {
        ModelBO modelBO = modelUseCase.findById(modelId);
        if (ObjectUtil.isNull(modelBO)) {
            throw new UsecaseException(UsecaseCode.DATASET__MODEL_NOT_EXIST);
        }
        ModelRunRecord modelRunRecord = ModelRunRecord.builder()
                .modelId(modelId)
                .modelVersion(modelBO.getVersion())
                .modelSerialNo(IdUtil.getSnowflakeNextId())
                .runNo(DateUtil.format(OffsetDateTime.now().toLocalDateTime(), DatePattern.PURE_DATETIME_PATTERN))
                .datasetId(datasetId)
                .status(RunStatusEnum.STARTED)
                .dataCount(totalDataNum).build();
        modelRunRecordDAO.save(modelRunRecord);
        return modelRunRecord.getId();
    }

    public void updateById(Long runRecordId,RunStatusEnum status) {
        ModelRunRecord modelRunRecord = ModelRunRecord.builder()
                .id(runRecordId)
                .status(status).build();
        modelRunRecordDAO.updateById(modelRunRecord);
    }
}
