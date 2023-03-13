package ai.basic.x1.adapter.api.job;

import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.port.dao.ModelDataResultDAO;
import ai.basic.x1.adapter.port.dao.ModelDatasetResultDAO;
import ai.basic.x1.adapter.port.dao.ModelRunRecordDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelDataResult;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelDatasetResult;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelRunRecord;
import ai.basic.x1.adapter.port.dao.redis.ModelSerialNoCountDAO;
import ai.basic.x1.adapter.port.dao.redis.ModelSerialNoIncrDAO;
import ai.basic.x1.entity.DataAnnotationObjectBO;
import ai.basic.x1.entity.ModelMessageBO;
import ai.basic.x1.entity.ModelTaskInfoBO;
import ai.basic.x1.entity.PreLabelModelObjectBO;
import ai.basic.x1.entity.enums.ModelCodeEnum;
import ai.basic.x1.entity.enums.RunStatusEnum;
import ai.basic.x1.usecase.exception.UsecaseCode;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.date.StopWatch;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import javax.annotation.PostConstruct;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author andy
 */
@Slf4j
public abstract class AbstractModelMessageHandler<T> {

    @Autowired
    private Jackson2ObjectMapperBuilder jackson2ObjectMapperBuilder;

    @Autowired
    protected ModelDataResultDAO modelDataResultDAO;

    @Autowired
    protected ModelDatasetResultDAO modelDatasetResultDAO;

    @Autowired
    protected ModelRunRecordDAO modelRunRecordDAO;

    @Autowired
    private ModelSerialNoCountDAO modelSerialNoCountDAO;
    @Autowired
    private ModelSerialNoIncrDAO modelSerialNoIncrDAO;
    protected ObjectMapper objectMapper;


    @PostConstruct
    public void init() {
        objectMapper = jackson2ObjectMapperBuilder.build();
        objectMapper.activateDefaultTyping(objectMapper.getPolymorphicTypeValidator(),
                ObjectMapper.DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY);
    }

    private static final Integer RETRY_COUNT = 3;

    /**
     * model run implement by subClass
     *
     * @param modelMessageBO
     * @return
     */
    public abstract ModelTaskInfoBO modelRun(ModelMessageBO modelMessageBO);

    /**
     * call remote model service implement by subClass
     *
     * @param modelMessageBO
     * @return
     */
    abstract ApiResult<T> callRemoteService(ModelMessageBO modelMessageBO);

    abstract void syncModelAnnotationResult(ModelTaskInfoBO modelTaskInfo, ModelMessageBO modelMessage);

    /**
     * model code implement by subClass
     *
     * @return
     */
    public abstract ModelCodeEnum getModelCodeEnum();

    public ApiResult<T> getRetryAbleApiResult(ModelMessageBO modelMessageBO) {
        ApiResult<T> apiResult = null;
        int count = 0;
        while (count <= RETRY_COUNT && ObjectUtil.isNull(apiResult)) {
            try {
                apiResult = callRemoteService(modelMessageBO);
                break;
            } catch (Throwable throwable) {
                log.error("call remote service is error", throwable);
            }
            count++;
        }
        if (apiResult != null && apiResult.getCode() == UsecaseCode.OK) {
            return apiResult;
        } else {
            if (apiResult != null) {
                return new ApiResult<>(apiResult.getCode(), apiResult.getMessage());
            } else {
                return new ApiResult<>(UsecaseCode.UNKNOWN, "service is busy");
            }
        }
    }

    public boolean handleDataModelRun(ModelMessageBO modelMessageBO) {
        try {
            var modelResult = modelRun(modelMessageBO);
            return saveToModelDataResult(modelMessageBO, modelResult);
        } catch (Exception e) {
            log.error("{} handleDataModelRun exception: {}", getModelCodeEnum(), e);
            return false;
        }
    }

    public boolean handleDatasetModelRun(ModelMessageBO modelMessageBO) {
        try {
            if (isNotExistModelRunRecord(modelMessageBO)) {
                return true;
            }
            var modelResult = modelRun(modelMessageBO);
            if (UsecaseCode.OK.getCode().equals(modelResult.getCode())) {
                syncModelAnnotationResult(modelResult, modelMessageBO);
            }
            if (saveToModelDatasetResult(modelMessageBO, modelResult)) {
                updateProgress(modelMessageBO);
            } else {
                log.warn("update model_dataset_result fail! modelMessageBO is {} ", JSONUtil.toJsonStr(modelMessageBO));
            }
            return true;
        } catch (Exception e) {
            log.error("{} handleDatasetModelRun exception: {}", getModelCodeEnum(), e);
            return false;
        }
    }

    private boolean isNotExistModelRunRecord(ModelMessageBO modelMessage) {
        var query = new LambdaQueryWrapper<ModelRunRecord>();
        query.eq(ModelRunRecord::getModelSerialNo, modelMessage.getModelSerialNo());
        return !modelRunRecordDAO.getBaseMapper().exists(query);
    }

    public boolean saveToModelDataResult(ModelMessageBO modelMessage, ModelTaskInfoBO modelTaskInfo) {
        if (ObjectUtil.isNotNull(modelTaskInfo)) {
            modelDataResultDAO.update(ModelDataResult.builder()
                            .updatedAt(OffsetDateTime.now())
                            .updatedBy(modelMessage.getCreatedBy())
                            .modelResult(JSONUtil.parseObj(modelTaskInfo))
                            .build(),
                    Wrappers.lambdaUpdate(ModelDataResult.class).eq(ModelDataResult::getModelSerialNo, modelMessage.getModelSerialNo())
                            .eq(ModelDataResult::getDataId, modelMessage.getDataId()));
        }
        return true;
    }

    public boolean saveToModelDatasetResult(ModelMessageBO modelMessage, ModelTaskInfoBO modelTaskInfo) {
        return modelDatasetResultDAO.update(Wrappers.lambdaUpdate(ModelDatasetResult.class)
                .set(ModelDatasetResult::getModelResult, JSONUtil.toJsonStr(modelTaskInfo))
                .set(ModelDatasetResult::getIsSuccess, UsecaseCode.OK.getCode().equals(modelTaskInfo.getCode()))
                .set(ModelDatasetResult::getErrorMessage, UsecaseCode.OK.getCode().equals(modelTaskInfo.getCode()) ? null : modelTaskInfo.getMessage())
                .set(ModelDatasetResult::getUpdatedBy, modelMessage.getCreatedBy())
                .set(ModelDatasetResult::getUpdatedAt, OffsetDateTime.now())
                .set(ModelDatasetResult::getDataConfidence, modelTaskInfo.getConfidence())
                .eq(ModelDatasetResult::getModelSerialNo, modelMessage.getModelSerialNo())
                .eq(ModelDatasetResult::getDataId, modelMessage.getDataId())
                .isNull(ModelDatasetResult::getModelResult)
        );
    }

    public void updateProgress(ModelMessageBO modelMessage) {
        Long key = modelMessage.getModelSerialNo();
        int currentPosition = modelSerialNoIncrDAO.incrModelSerialNo(key);
        Integer lastPosition = modelSerialNoCountDAO.getCount(key);
        if (currentPosition == 1) {
            modelRunRecordStart(modelMessage);
        }
        if (currentPosition == lastPosition) {
            long sizeFailure = getSizeFailure(modelMessage);
            if (sizeFailure > 0) {
                RunStatusEnum runStatus = sizeFailure == currentPosition ? RunStatusEnum.FAILURE : RunStatusEnum.SUCCESS_WITH_ERROR;
                modelRunRecordFailure(modelMessage, runStatus);
            } else {
                modelRunRecordSuccess(modelMessage);
            }
            removeCounter(key);
        }
    }

    private void modelRunRecordStart(ModelMessageBO modelMessage) {
        updateModelRunRecordStatus(modelMessage, RunStatusEnum.RUNNING, null);
    }

    private void updateModelRunRecordStatus(ModelMessageBO modelMessage, RunStatusEnum runStatus,
                                            String errorMsg) {
        boolean isUpdateErrorMsg = runStatus == RunStatusEnum.FAILURE || runStatus == RunStatusEnum.SUCCESS_WITH_ERROR;
        LambdaUpdateWrapper<ModelRunRecord> wrapper = Wrappers.lambdaUpdate(ModelRunRecord.class)
                .set(ModelRunRecord::getStatus, runStatus)
                .set(ModelRunRecord::getUpdatedAt, OffsetDateTime.now())
                .set(ModelRunRecord::getUpdatedBy, modelMessage.getCreatedBy())
                .eq(ModelRunRecord::getModelSerialNo, modelMessage.getModelSerialNo());
        if (isUpdateErrorMsg) {
            wrapper.set(ModelRunRecord::getErrorReason, errorMsg);
        }
        modelRunRecordDAO.update(wrapper);
    }

    private void modelRunRecordSuccess(ModelMessageBO modelMessage) {
        updateModelRunRecordStatus(modelMessage, RunStatusEnum.SUCCESS, null);
    }

    private void modelRunRecordFailure(ModelMessageBO modelMessage, RunStatusEnum runStatus) {
        List<ModelDatasetResult> modelDatasetErrorResults = modelDatasetResultDAO.getBaseMapper().selectList(
                Wrappers.lambdaQuery(ModelDatasetResult.class).select(ModelDatasetResult::getDataId, ModelDatasetResult::getErrorMessage)
                        .eq(ModelDatasetResult::getModelSerialNo, modelMessage.getModelSerialNo())
                        .eq(ModelDatasetResult::getIsSuccess, false)
                        .last("limit 1")
        );

        String errorMsg = JSONUtil.toJsonStr(modelDatasetErrorResults.stream().map(m -> m.getDataId() + ":" + m.getErrorMessage()).collect(Collectors.toList()));
        if (StrUtil.isNotEmpty(errorMsg) && errorMsg.length() > 200) {
            errorMsg = null;
        }

        updateModelRunRecordStatus(modelMessage, runStatus, errorMsg);
    }

    private long getSizeFailure(ModelMessageBO modelMessage) {
        var query = new LambdaQueryWrapper<ModelDatasetResult>();
        query.eq(ModelDatasetResult::getModelSerialNo, modelMessage.getModelSerialNo())
                .eq(ModelDatasetResult::getIsSuccess, false);
        return modelDatasetResultDAO.count(query);
    }

    private void removeCounter(Long key) {
        try {
            modelSerialNoIncrDAO.removeModelSerialNo(key);
            modelSerialNoCountDAO.removeModelSerialNoCount(key);
        } catch (Throwable throwable) {
            log.error("clean {} redis key error", key, throwable);
        }
    }

}
