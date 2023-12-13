package ai.basic.x1.usecase;

import ai.basic.x1.adapter.api.config.DatasetInitialInfo;
import ai.basic.x1.adapter.api.context.RequestContextHolder;
import ai.basic.x1.adapter.port.dao.*;
import ai.basic.x1.adapter.port.dao.mybatis.extension.ExtendLambdaQueryWrapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.*;
import ai.basic.x1.adapter.port.dao.mybatis.query.DataInfoQuery;
import ai.basic.x1.adapter.port.minio.MinioProp;
import ai.basic.x1.adapter.port.minio.MinioService;
import ai.basic.x1.entity.*;
import ai.basic.x1.entity.enums.*;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.Constants;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.collection.ListUtil;
import cn.hutool.core.date.DatePattern;
import cn.hutool.core.date.TemporalAccessorUtil;
import cn.hutool.core.lang.UUID;
import cn.hutool.core.thread.ThreadUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.alibaba.ttl.TtlRunnable;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.google.common.collect.Lists;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.stream.Collectors;

import static ai.basic.x1.entity.enums.DatasetTypeEnum.IMAGE;
import static ai.basic.x1.entity.enums.DatasetTypeEnum.TEXT;
import static ai.basic.x1.usecase.exception.UsecaseCode.DATASET_NOT_FOUND;
import static ai.basic.x1.usecase.exception.UsecaseCode.DEFAULT_DATASET_NOT_FOUND;
import static ai.basic.x1.util.Constants.*;

/**
 * @author fyb
 * @date 2022/2/21 12:12
 */
@Slf4j
public class DataInfoUseCase {

    @Autowired
    private DataInfoDAO dataInfoDAO;

    @Autowired
    private FileUseCase fileUseCase;

    @Autowired
    private DatasetDAO datasetDAO;

    @Autowired
    private MinioService minioService;

    @Autowired
    private ExportUseCase exportUseCase;

    @Autowired
    private MinioProp minioProp;

    @Autowired
    private DataAnnotationClassificationUseCase dataAnnotationClassificationUseCase;

    @Autowired
    private DataAnnotationObjectUseCase dataAnnotationObjectUseCase;

    @Autowired
    private UserUseCase userUseCase;

    @Autowired
    private DataEditUseCase dataEditUseCase;

    @Autowired
    private DataEditDAO dataEditDAO;

    @Autowired
    private ModelUseCase modelUseCase;

    @Autowired
    private DataAnnotationObjectDAO dataAnnotationObjectDAO;

    @Autowired
    private DataAnnotationRecordDAO dataAnnotationRecordDAO;

    @Autowired
    private ModelDataResultDAO modelDataResultDAO;

    @Autowired
    private DatasetSimilarityJobUseCase datasetSimilarityJobUseCase;

    @Autowired
    private DataAnnotationClassificationDAO dataAnnotationClassificationDAO;

    @Autowired
    private DatasetClassUseCase datasetClassUseCase;

    @Autowired
    private DatasetUseCase datasetUseCase;

    @Autowired
    private ModelRunRecordUseCase modelRunRecordUseCase;

    @Value("${export.data.version}")
    private String version;

    private static final ExecutorService executorService = ThreadUtil.newExecutor(2);

    private static final Long GROUND_TRUTH = -1L;

    private static final String GROUND_TRUTH_NAME = "Ground Truth";

    /**
     * Data split
     *
     * @param dataIds   Data id collection
     * @param splitType split type
     */
    public void splitByDataIds(List<Long> dataIds, SplitTypeEnum splitType) {
        var dataInfoLambdaUpdateWrapper = Wrappers.lambdaUpdate(DataInfo.class);
        dataInfoLambdaUpdateWrapper.nested(wq -> wq.in(DataInfo::getId, dataIds)
                .or()
                .in(DataInfo::getParentId, dataIds));
        dataInfoLambdaUpdateWrapper.set(DataInfo::getSplitType, splitType);
        dataInfoDAO.update(dataInfoLambdaUpdateWrapper);
    }

    /**
     * Data split
     *
     * @param splitFilterBO split filter parameter
     */
    @Transactional(rollbackFor = Exception.class)
    public void splitByFilter(DataInfoSplitFilterBO splitFilterBO) {
        var dataInfoLambdaQueryWrapper = getCommonSplitWrapper(splitFilterBO.getDatasetId(), splitFilterBO.getTargetDataType());
        var dataCount = dataInfoDAO.count(dataInfoLambdaQueryWrapper);
        var oneHundred = BigDecimal.valueOf(100);
        var limit = (int) Math.round(BigDecimal.valueOf(dataCount).multiply(BigDecimal.valueOf(splitFilterBO.getTotalSizeRatio())).divide(oneHundred).doubleValue());
        if (limit == 0) {
            return;
        }
        if (SplittingByEnum.RANDOM.equals(splitFilterBO.getSplittingBy())) {
            dataInfoLambdaQueryWrapper.last(" ORDER BY RAND()");
        } else {
            boolean isAsc = ObjectUtil.isNull(splitFilterBO.getAscOrDesc()) || SortEnum.ASC.equals(splitFilterBO.getAscOrDesc());
            dataInfoLambdaQueryWrapper.orderBy(SortByEnum.NAME.equals(splitFilterBO.getSortBy()), isAsc, DataInfo::getName);
            dataInfoLambdaQueryWrapper.orderBy(SortByEnum.CREATE_TIME.equals(splitFilterBO.getSortBy()), isAsc, DataInfo::getCreatedAt);
        }
        dataInfoLambdaQueryWrapper.last(" limit " + limit + "");
        var dataList = dataInfoDAO.list(dataInfoLambdaQueryWrapper);
        var dataIdList = dataList.stream().map(DataInfo::getId).collect(Collectors.toList());
        int indexTraining = (int) Math.round(BigDecimal.valueOf(limit).multiply(BigDecimal.valueOf(splitFilterBO.getTrainingRatio())).divide(oneHundred).doubleValue());
        int indexValidation = (int) Math.round(BigDecimal.valueOf(limit).multiply(BigDecimal.valueOf(splitFilterBO.getValidationRatio())).divide(oneHundred).doubleValue()) + indexTraining;
        var trainingDataIdList = dataIdList.subList(0, indexTraining);
        var validationDataIdList = dataIdList.subList(indexTraining, indexValidation);
        var testDataIdList = dataIdList.subList(indexValidation, limit);
        this.updateBatchByIds(trainingDataIdList, SplitTypeEnum.TRAINING);
        this.updateBatchByIds(validationDataIdList, SplitTypeEnum.VALIDATION);
        this.updateBatchByIds(testDataIdList, SplitTypeEnum.TEST);
    }

    private void updateBatchByIds(List<Long> dataIds, SplitTypeEnum splitType) {
        if (CollUtil.isNotEmpty(dataIds)) {
            var dataInfoLambdaUpdateWrapper = Wrappers.lambdaUpdate(DataInfo.class);
            dataInfoLambdaUpdateWrapper.nested(wq -> wq.in(DataInfo::getId, dataIds)
                    .or()
                    .in(DataInfo::getParentId, dataIds));
            dataInfoLambdaUpdateWrapper.set(DataInfo::getSplitType, splitType);
            dataInfoDAO.update(dataInfoLambdaUpdateWrapper);
        }
    }

    /**
     * Total amount of segmented data obtained
     *
     * @param datasetId      Dataset id
     * @param targetDataType Data type
     * @return Total count
     */
    public Long getSplitDataTotalCount(Long datasetId, SplitTargetDataTypeEnum targetDataType) {
        var dataInfoLambdaQueryWrapper = getCommonSplitWrapper(datasetId, targetDataType);
        return dataInfoDAO.count(dataInfoLambdaQueryWrapper);
    }

    private LambdaQueryWrapper<DataInfo> getCommonSplitWrapper(Long datasetId, SplitTargetDataTypeEnum targetDataType) {
        var dataInfoLambdaQueryWrapper = Wrappers.lambdaQuery(DataInfo.class);
        dataInfoLambdaQueryWrapper.eq(DataInfo::getDatasetId, datasetId);
        dataInfoLambdaQueryWrapper.select(DataInfo::getId);
        dataInfoLambdaQueryWrapper.ne(SplitTargetDataTypeEnum.SPLIT.equals(targetDataType), DataInfo::getSplitType, SplitTargetDataTypeEnum.NOT_SPLIT);
        dataInfoLambdaQueryWrapper.eq(SplitTargetDataTypeEnum.NOT_SPLIT.equals(targetDataType), DataInfo::getSplitType, targetDataType);
        dataInfoLambdaQueryWrapper.eq(DataInfo::getParentId, DEFAULT_PARENT_ID);
        return dataInfoLambdaQueryWrapper;
    }


    /**
     * Batch delete
     *
     * @param datasetId dataset id
     * @param ids       Data id collection
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteBatch(Long datasetId, List<Long> ids) {

        var dataInfoLambdaQueryWrapper = Wrappers.lambdaQuery(DataInfo.class);
        dataInfoLambdaQueryWrapper.eq(DataInfo::getDatasetId, datasetId);
        dataInfoLambdaQueryWrapper.in(DataInfo::getId, ids);
        var dataCount = dataInfoDAO.count(dataInfoLambdaQueryWrapper);
        if (dataCount <= 0) {
            throw new UsecaseException(UsecaseCode.DATA_NOT_FOUND);
        }
        var count = dataEditDAO.count(Wrappers.lambdaQuery(DataEdit.class).in(DataEdit::getDataId, ids).or().in(DataEdit::getSceneId, ids));
        if (count > 0) {
            throw new UsecaseException(UsecaseCode.DATASET_DATA_OTHERS_ANNOTATING);
        }
        var dataInfoDeleteLambdaQueryWrapper = Wrappers.lambdaQuery(DataInfo.class);
        dataInfoDeleteLambdaQueryWrapper.eq(DataInfo::getDatasetId, datasetId);
        dataInfoDeleteLambdaQueryWrapper.nested(wq -> wq.in(DataInfo::getId, ids)
                .or()
                .in(DataInfo::getParentId, ids));
        dataInfoDAO.remove(dataInfoDeleteLambdaQueryWrapper);

        executorService.execute(Objects.requireNonNull(TtlRunnable.get(() -> {
            var dataAnnotationObjectLambdaUpdateWrapper = Wrappers.lambdaUpdate(DataAnnotationObject.class);
            dataAnnotationObjectLambdaUpdateWrapper.eq(DataAnnotationObject::getDatasetId, datasetId);
            dataAnnotationObjectLambdaUpdateWrapper.in(DataAnnotationObject::getDataId, ids);
            dataAnnotationObjectDAO.remove(dataAnnotationObjectLambdaUpdateWrapper);
            var dataAnnotationClassificationLambdaUpdateWrapper = Wrappers.lambdaUpdate(DataAnnotationClassification.class);
            dataAnnotationClassificationLambdaUpdateWrapper.eq(DataAnnotationClassification::getDatasetId, datasetId);
            dataAnnotationClassificationLambdaUpdateWrapper.in(DataAnnotationClassification::getDataId, ids);
            dataAnnotationClassificationDAO.remove(dataAnnotationClassificationLambdaUpdateWrapper);
            datasetSimilarityJobUseCase.submitJob(datasetId);
        })));
    }

    /**
     * Paging query dataInfo
     *
     * @param queryBO Query parameter object
     * @return DataInfo page
     */
    public Page<DataInfoBO> findByPage(DataInfoQueryBO queryBO) {
        var lambdaQueryWrapper = commonDataQueryWrapper(queryBO);
        var dataInfoPage = dataInfoDAO.getBaseMapper().selectDataPage(new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(queryBO.getPageNo(), queryBO.getPageSize()),
                lambdaQueryWrapper, DefaultConverter.convert(queryBO, DataInfoQuery.class));
        var dataInfoBOPage = DefaultConverter.convert(dataInfoPage, DataInfoBO.class);
        var dataInfoBOList = dataInfoBOPage.getList();
        if (CollectionUtil.isNotEmpty(dataInfoBOList)) {
            setSceneFirstData(queryBO.getDatasetId(), dataInfoBOList);
            setDataInfoBOListFile(dataInfoBOList);
            var dataIds = dataInfoBOList.stream().map(DataInfoBO::getId).collect(Collectors.toList());
            var userIdMap = dataEditUseCase.getDataEditByDataIds(dataIds);
            var userIds = userIdMap.values();
            if (CollectionUtil.isNotEmpty(userIds)) {
                var userBOS = userUseCase.findByIds(ListUtil.toList(userIds));
                var userMap = userBOS.stream()
                        .collect(Collectors.toMap(UserBO::getId, UserBO::getNickname, (k1, k2) -> k1));
                dataInfoBOList.forEach(dataInfoBO -> dataInfoBO.setLockedBy(userMap.get(userIdMap.get(dataInfoBO.getId()))));
            }
        }
        return dataInfoBOPage;
    }


    /**
     * Query export data and return all data IDs
     *
     * @param dataInfoQueryBO Query object
     * @return Data id
     */
    @Deprecated
    public List<Long> findExportDataIds(DataInfoQueryBO dataInfoQueryBO) {
        var dataInfoQuery = DefaultConverter.convert(dataInfoQueryBO, DataInfoQuery.class);
        var lambdaQueryWrapper = commonDataQueryWrapper(dataInfoQueryBO);
        var dataList = dataInfoDAO.getBaseMapper().getExportData(lambdaQueryWrapper, dataInfoQuery);
        var dataIds = new ArrayList<Long>();
        var batchOrSceneIds = new ArrayList<Long>();
        if (CollUtil.isNotEmpty(dataList)) {
            dataList.forEach(dataInfo -> {
                if (ItemTypeEnum.SINGLE_DATA.equals(dataInfo.getType())) {
                    dataIds.add(dataInfo.getId());
                } else {
                    batchOrSceneIds.add(dataInfo.getId());
                }
            });
        }
        dataIds.addAll(this.getDataIdBySceneId(dataInfoQueryBO.getDatasetId(), batchOrSceneIds));
        return dataIds;
    }

    private List<Long> getDataIdBySceneId(Long datasetId, List<Long> sceneIds) {
        if (CollUtil.isEmpty(sceneIds)) {
            return ListUtil.empty();
        }
        var lambdaQueryWrapper = Wrappers.lambdaQuery(DataInfo.class)
                .select(DataInfo::getId)
                .eq(DataInfo::getDatasetId, datasetId)
                .eq(DataInfo::getType, ItemTypeEnum.SINGLE_DATA)
                .in(DataInfo::getParentId, sceneIds);
        var dataInfoList = dataInfoDAO.list(lambdaQueryWrapper);
        return CollUtil.isEmpty(dataInfoList) ? ListUtil.empty() : dataInfoList.stream().map(DataInfo::getId).collect(Collectors.toList());
    }

    public Wrapper<DataInfo> commonDataQueryWrapper(DataInfoQueryBO queryBO) {
        var lambdaQueryWrapper = new ExtendLambdaQueryWrapper<DataInfo>();
        lambdaQueryWrapper.eq(DataInfo::getDatasetId, queryBO.getDatasetId());
        lambdaQueryWrapper.eq(DataInfo::getIsDeleted, false);
        lambdaQueryWrapper.like(StrUtil.isNotEmpty(queryBO.getName()), DataInfo::getName, queryBO.getName());
        lambdaQueryWrapper.eq(ObjectUtil.isNotNull(queryBO.getAnnotationStatus()), DataInfo::getAnnotationStatus, queryBO.getAnnotationStatus());
        lambdaQueryWrapper.ge(ObjectUtil.isNotEmpty(queryBO.getCreateStartTime()), DataInfo::getCreatedAt, queryBO.getCreateStartTime());
        lambdaQueryWrapper.le(ObjectUtil.isNotEmpty(queryBO.getCreateEndTime()), DataInfo::getCreatedAt, queryBO.getCreateEndTime());
        lambdaQueryWrapper.in(CollUtil.isNotEmpty(queryBO.getIds()), DataInfo::getId, queryBO.getIds());
        lambdaQueryWrapper.eq(ObjectUtil.isNotNull(queryBO.getSplitType()), DataInfo::getSplitType, queryBO.getSplitType());
        lambdaQueryWrapper.eq(DataInfo::getParentId, ObjectUtil.isNotNull(queryBO.getParentId()) ? queryBO.getParentId() : Constants.DEFAULT_PARENT_ID);
        return lambdaQueryWrapper;
    }


    private void setSceneFirstData(Long datasetId, List<DataInfoBO> dataInfoBOList) {
        List<Long> dataIds = null;
        var sceneIds = dataInfoBOList.stream().filter(dataInfoBO -> ItemTypeEnum.SCENE.equals(dataInfoBO.getType())).map(DataInfoBO::getId).collect(Collectors.toList());
        if (CollectionUtil.isNotEmpty(sceneIds)) {
            dataIds = dataInfoDAO.getBaseMapper().selectFirstDataIdBySceneIds(datasetId, sceneIds);
        }
        if (CollectionUtil.isNotEmpty(dataIds)) {
            var dataInfoList = dataInfoDAO.listByIds(dataIds);
            var sceneDataInfoMap = dataInfoList.stream()
                    .collect(Collectors.toMap(DataInfo::getParentId, dataInfo -> dataInfo, (k1, k2) -> k1));
            dataInfoBOList.forEach(dataInfoBO -> {
                if (ItemTypeEnum.SCENE.equals(dataInfoBO.getType())) {
                    var dataInfo = sceneDataInfoMap.get(dataInfoBO.getId());
                    if (ObjectUtil.isNotNull(dataInfo)) {
                        dataInfoBO.setContent(DefaultConverter.convert(dataInfo.getContent(), DataInfoBO.FileNodeBO.class));
                    }
                }
            });
        }

    }

    /**
     * Query details by id
     *
     * @param id Data id
     * @return Data information
     */
    public DataInfoBO findById(Long id) {
        var dataInfoBO = DefaultConverter.convert(dataInfoDAO.getById(id), DataInfoBO.class);
        if (dataInfoBO == null) {
            throw new UsecaseException(UsecaseCode.NOT_FOUND);
        }
        var content = dataInfoBO.getContent();
        if (CollectionUtil.isNotEmpty(content)) {
            var fileIds = getFileIds(content);
            var fileMap = findFileByFileIds(fileIds);
            setFile(content, fileMap);
        }
        return dataInfoBO;
    }


    /**
     * Query data object list according to id collection
     *
     * @param ids                id collection
     * @param isQueryDeletedData Whether to query to delete data
     * @return Collection of data objects
     */
    public List<DataInfoBO> listByIds(List<Long> ids, Boolean isQueryDeletedData) {
        var dataInfoBOList = DefaultConverter.convert(dataInfoDAO.getBaseMapper().listByIds(ids, isQueryDeletedData), DataInfoBO.class);
        if (CollectionUtil.isNotEmpty(dataInfoBOList)) {
            setSceneFirstData(CollUtil.getFirst(dataInfoBOList).getDatasetId(), dataInfoBOList);
            setDataInfoBOListFile(dataInfoBOList);
        }
        return dataInfoBOList;
    }

    /**
     * Query data object list according to id collection
     *
     * @param ids                id collection
     * @param isQueryDeletedData Whether to query to delete data
     * @return Collection of data objects
     */
    public List<DataInfoBO> listRelationByIds(List<Long> ids, Boolean isQueryDeletedData) {
        var dataInfoBOList = DefaultConverter.convert(dataInfoDAO.getBaseMapper().listByIds(ids, isQueryDeletedData), DataInfoBO.class);
        if (CollectionUtil.isNotEmpty(dataInfoBOList)) {
            setDataInfoBOListFile(dataInfoBOList);
            var dataIds = new ArrayList<Long>();
            var datasetIds = new HashSet<Long>();
            dataInfoBOList.forEach(dataInfoBO -> {
                dataIds.add(dataInfoBO.getId());
                datasetIds.add(dataInfoBO.getDatasetId());
            });
            var userIdMap = dataEditUseCase.getDataEditByDataIds(dataIds);
            var userIds = userIdMap.values();
            if (CollectionUtil.isNotEmpty(userIds)) {
                var userBOS = userUseCase.findByIds(ListUtil.toList(userIds));
                var userMap = userBOS.stream()
                        .collect(Collectors.toMap(UserBO::getId, UserBO::getNickname, (k1, k2) -> k1));
                dataInfoBOList.forEach(dataInfoBO -> dataInfoBO.setLockedBy(userMap.get(userIdMap.get(dataInfoBO.getId()))));
            }
            var datasetList = datasetDAO.listByIds(datasetIds);
            var datasetMap = datasetList.stream().collect(Collectors.toMap(Dataset::getId, Dataset::getName));
            dataInfoBOList.forEach(dataInfoBO -> dataInfoBO.setDatasetName(datasetMap.get(dataInfoBO.getDatasetId())));
        }
        return dataInfoBOList;
    }

    /**
     * Query data object list according to id collection
     *
     * @param ids id collection
     * @return Collection of data objects
     */
    public List<DataInfoBO> getDataStatusByIds(List<Long> ids) {
        return DefaultConverter.convert(dataInfoDAO.listByIds(ids), DataInfoBO.class);
    }


    /**
     * Query dataset statistics based on dataset id collection
     *
     * @param datasetIds dataset id collection
     * @return Dataset Statistics
     */
    public Map<Long, DatasetStatisticsBO> getDatasetStatisticsByDatasetIds(List<Long> datasetIds) {
        var datasetStatisticsList = dataInfoDAO.getBaseMapper().getDatasetStatisticsByDatasetIds(datasetIds);
        return datasetStatisticsList.stream()
                .collect(Collectors.toMap(DatasetStatistics::getDatasetId, datasetStatistics -> DefaultConverter.convert(datasetStatistics, DatasetStatisticsBO.class), (k1, k2) -> k1));
    }

    /**
     * Get dataset statistics based on dataset id
     *
     * @param datasetId Dataset id
     * @return Dataset statistics
     */
    public DatasetStatisticsBO getDatasetStatisticsByDatasetId(Long datasetId) {
        var datasetStatisticsList = dataInfoDAO.getBaseMapper().getDatasetStatisticsByDatasetIds(Collections.singletonList(datasetId));
        return DefaultConverter.convert(datasetStatisticsList.stream().findFirst()
                .orElse(new DatasetStatistics(datasetId, 0, 0, 0)), DatasetStatisticsBO.class);
    }

    /**
     * Generate pre-signed url
     *
     * @param fileName  file name
     * @param datasetId dataset id
     * @param userId    user id
     */
    public PresignedUrlBO generatePresignedUrl(String fileName, Long datasetId, Long userId) {
        var objectName = String.format("%s/%s/%s/%s", userId, datasetId, UUID.randomUUID().toString().replace("-", ""), fileName);
        try {
            return minioService.generatePresignedUrl(minioProp.getBucketName(), objectName, Boolean.TRUE);
        } catch (Exception e) {
            log.error("Minio generate presigned url error", e);
            throw new UsecaseException("Minio generate presigned url error!");
        }
    }

    /**
     * Batch insert
     *
     * @param dataInfoBOList Collection of data details
     */
    public List<DataInfoBO> insertBatch(List<DataInfoBO> dataInfoBOList, Long datasetId, StringBuilder errorBuilder) {
        var names = dataInfoBOList.stream().map(DataInfoBO::getName).collect(Collectors.toList());
        var existDataInfoList = this.findByNames(datasetId, names);
        if (CollUtil.isNotEmpty(existDataInfoList)) {
            var existNames = existDataInfoList.stream().map(DataInfoBO::getName).collect(Collectors.toList());
            dataInfoBOList = dataInfoBOList.stream().filter(dataInfoBO -> !existNames.contains(dataInfoBO.getName())).collect(Collectors.toList());
            if (!errorBuilder.toString().contains("Duplicate")) {
                errorBuilder.append("Duplicate data names;");
            }
        }
        if (CollUtil.isEmpty(dataInfoBOList)) {
            return List.of();
        }
        try {
            List<DataInfo> infos = DefaultConverter.convert(dataInfoBOList, DataInfo.class);
            dataInfoDAO.saveBatch(infos);
            return DefaultConverter.convert(infos, DataInfoBO.class);
        } catch (DuplicateKeyException e) {
            log.error("Duplicate data name", e);
            if (!errorBuilder.toString().contains("Duplicate")) {
                errorBuilder.append("Duplicate data names;");
            }
            return List.of();
        }
    }

    /**
     * Export data
     *
     * @param dataInfoQueryBO Query parameters
     * @return Serial number
     */
    public Long export(DataInfoQueryBO dataInfoQueryBO) {
        var dataset = datasetDAO.getById(dataInfoQueryBO.getDatasetId());
        var fileName = String.format("%s-%s.zip", dataset.getName(), TemporalAccessorUtil.format(OffsetDateTime.now(), DatePattern.PURE_DATETIME_PATTERN));
        var serialNumber = exportUseCase.createExportRecord(fileName);
        dataInfoQueryBO.setPageNo(PAGE_NO);
        dataInfoQueryBO.setPageSize(PAGE_SIZE);
        dataInfoQueryBO.setDatasetType(dataset.getType());
        var datasetClassBOList = datasetClassUseCase.findAll(dataInfoQueryBO.getDatasetId());
        var classMap = new HashMap<Long, String>();
        if (CollectionUtil.isNotEmpty(datasetClassBOList)) {
            classMap.putAll(datasetClassBOList.stream().collect(Collectors.toMap(DatasetClassBO::getId, DatasetClassBO::getName)));
        }
        var resultMap = new HashMap<Long, String>();
        if (CollectionUtil.isNotEmpty(dataInfoQueryBO.getSelectModelRunIds())) {
            var modelRunRecordBOList = modelRunRecordUseCase.findByIds(dataInfoQueryBO.getSelectModelRunIds());
            if (CollUtil.isNotEmpty(modelRunRecordBOList)) {
                resultMap.putAll(modelRunRecordBOList.stream().collect(Collectors.toMap(ModelRunRecordBO::getId, ModelRunRecordBO::getRunNo)));
            }
            if (dataInfoQueryBO.getSelectModelRunIds().contains(GROUND_TRUTH)) {
                resultMap.put(GROUND_TRUTH, GROUND_TRUTH_NAME);
            }
        }
        dataInfoQueryBO.setIsAllResult(false);
        dataInfoQueryBO.setDataFormat(IMAGE.equals(dataInfoQueryBO.getDatasetType()) ? dataInfoQueryBO.getDataFormat() : DataFormatEnum.XTREME1);
        executorService.execute(Objects.requireNonNull(TtlRunnable.get(() ->
                exportUseCase.asyncExportDataZip(fileName, serialNumber, classMap, resultMap, dataInfoQueryBO,
                        this::findExportDataIds,
                        this::processData))));
        return serialNumber;
    }


    private List<DataInfoBO> findByNames(Long datasetId, List<String> names) {
        var dataInfoLambdaQueryWrapper = Wrappers.lambdaQuery(DataInfo.class);
        dataInfoLambdaQueryWrapper.eq(DataInfo::getDatasetId, datasetId);
        dataInfoLambdaQueryWrapper.in(DataInfo::getName, names);
        return DefaultConverter.convert(dataInfoDAO.list(dataInfoLambdaQueryWrapper), DataInfoBO.class);
    }

    /**
     * Data annotation
     *
     * @param dataPreAnnotationBO Data pre-annotation parameter
     * @param userId              User id
     * @return Annotation record id
     */
    @Transactional(rollbackFor = Throwable.class)
    public Long annotate(DataPreAnnotationBO dataPreAnnotationBO, Long userId) {
        return annotateCommon(dataPreAnnotationBO, null, userId);
    }

    private Long annotateCommon(DataPreAnnotationBO dataPreAnnotationBO, Long serialNo, Long userId) {
        var lambdaQueryWrapper = Wrappers.lambdaQuery(DataAnnotationRecord.class);
        lambdaQueryWrapper.eq(DataAnnotationRecord::getDatasetId, dataPreAnnotationBO.getDatasetId());
        lambdaQueryWrapper.eq(DataAnnotationRecord::getCreatedBy, userId);
        log.info("userId:{}", RequestContextHolder.getContext().getUserInfo().getId());
        log.info("datasetId:{},userId:{}", dataPreAnnotationBO.getDatasetId(), userId);
        var isFilterData = ObjectUtil.isNotNull(dataPreAnnotationBO.getIsFilterData()) ? dataPreAnnotationBO.getIsFilterData() : false;
        var boo = true;
        var dataAnnotationRecord = DataAnnotationRecord.builder()
                .datasetId(dataPreAnnotationBO.getDatasetId()).itemType(dataPreAnnotationBO.getOperateItemType()).createdBy(userId).serialNo(serialNo).build();
        try {
            dataAnnotationRecordDAO.save(dataAnnotationRecord);
        } catch (DuplicateKeyException duplicateKeyException) {
            boo = false;
            dataAnnotationRecord = dataAnnotationRecordDAO.getOne(lambdaQueryWrapper);
            if (!dataAnnotationRecord.getItemType().equals(dataPreAnnotationBO.getOperateItemType())) {
                throw new UsecaseException(UsecaseCode.DATASET_DATA_EXIST_OTHER_TYPE_ANNOTATE);
            }
            var dataEditLambdaQueryWrapper = Wrappers.lambdaQuery(DataEdit.class);
            dataEditLambdaQueryWrapper.eq(DataEdit::getAnnotationRecordId, dataAnnotationRecord.getId());
            var list = dataEditDAO.list(dataEditLambdaQueryWrapper);
            var dataIds = list.stream().map(DataEdit::getDataId).collect(Collectors.toList());
            if (dataPreAnnotationBO.getOperateItemType().equals(ItemTypeEnum.SCENE)) {
                dataIds = list.stream().map(DataEdit::getSceneId).collect(Collectors.toList());
            }
            if (CollectionUtil.isNotEmpty(dataIds) && dataIds.contains(dataPreAnnotationBO.getDataIds().get(0)) && isFilterData) {
                return dataAnnotationRecord.getId();
            }
        }
        var insertCount = batchInsertDataEdit(dataAnnotationRecord.getId(), dataPreAnnotationBO, userId);
        if (isFilterData) {
            if (insertCount == 0) {
                throw new UsecaseException(UsecaseCode.DATASET_DATA_EXIST_ANNOTATE);
            }
        } else {
            // Indicates that no new data is locked and there is no old lock record
            if (insertCount == 0 && boo) {
                throw new UsecaseException(UsecaseCode.DATASET_DATA_EXIST_ANNOTATE);
            }
        }
        return dataAnnotationRecord.getId();
    }

    /**
     * Data annotation with model
     *
     * @param dataPreAnnotationBO Data pre-annotation parameter
     * @param userId              User id
     * @return Annotation record id
     */
    @Transactional(rollbackFor = Throwable.class)
    public Long annotateWithModel(DataPreAnnotationBO dataPreAnnotationBO, Long userId) {
        Long serialNo = IdUtil.getSnowflakeNextId();
        ModelBO modelBO = modelUseCase.findById(dataPreAnnotationBO.getModelId());
        if (ObjectUtil.isNull(modelBO)) {
            throw new UsecaseException(UsecaseCode.MODEL_DOES_NOT_EXIST);
        }
        if (ObjectUtil.isNotNull(modelBO)) {
            batchInsertModelDataResult(dataPreAnnotationBO, modelBO, userId, serialNo);
        }
        return annotateCommon(dataPreAnnotationBO, serialNo, userId);
    }

    /**
     * Batch insert lock data
     *
     * @param dataAnnotationRecord Data annotation record
     */
    private Integer batchInsertDataEdit(Long dataAnnotationRecordId, DataPreAnnotationBO dataAnnotationRecord, Long userId) {
        var dataIds = dataAnnotationRecord.getDataIds();
        var insertCount = 0;
        if (CollectionUtil.isEmpty(dataIds)) {
            return insertCount;
        }
        var dataInfos = dataIds.stream().map(dataId -> DataInfoBO.builder().id(dataId).build()).collect(Collectors.toList());
        if (dataAnnotationRecord.getOperateItemType().equals(ItemTypeEnum.SCENE)) {
            dataInfos = getDataInfoBySceneIds(dataAnnotationRecord.getDatasetId(), dataIds);
        }
        var dataEditSubList = new ArrayList<DataEdit>();
        int i = 1;
        var dataEditBuilder = DataEdit.builder()
                .annotationRecordId(dataAnnotationRecordId)
                .datasetId(dataAnnotationRecord.getDatasetId())
                .modelId(dataAnnotationRecord.getModelId())
                .modelVersion(dataAnnotationRecord.getModelVersion())
                .createdBy(userId);
        for (var dataInfo : dataInfos) {
            var dataEdit = dataEditBuilder.dataId(dataInfo.getId()).sceneId(dataInfo.getParentId()).build();
            dataEditSubList.add(dataEdit);
            if ((i % BATCH_SIZE == 0) || i == dataInfos.size()) {
                insertCount += dataEditDAO.getBaseMapper().insertIgnoreBatch(dataEditSubList);
                dataEditSubList.clear();
            }
            i++;
        }
        return insertCount;
    }

    public List<DataInfoBO> getDataInfoBySceneIds(Long datasetId, List<Long> sceneIds) {
        var lambdaQueryWrapper = new LambdaQueryWrapper<DataInfo>();
        lambdaQueryWrapper.select(DataInfo::getId, DataInfo::getName, DataInfo::getOrderName, DataInfo::getParentId);
        lambdaQueryWrapper.in(DataInfo::getParentId, sceneIds);
        lambdaQueryWrapper.eq(DataInfo::getType, ItemTypeEnum.SINGLE_DATA);
        lambdaQueryWrapper.eq(DataInfo::getDatasetId, datasetId);
        lambdaQueryWrapper.orderByAsc(DataInfo::getOrderName);
        var dataInfoList = dataInfoDAO.list(lambdaQueryWrapper);
        return DefaultConverter.convert(dataInfoList, DataInfoBO.class);
    }

    /**
     * Model annotate
     *
     * @param dataPreAnnotationBO Data pre-annotation parameter
     * @param userId              User id
     * @return Serial number
     */
    @Transactional(rollbackFor = Throwable.class)
    public String modelAnnotate(DataPreAnnotationBO dataPreAnnotationBO, Long userId) {
        var modelBO = modelUseCase.findById(dataPreAnnotationBO.getModelId());
        var serialNo = IdUtil.getSnowflakeNextId();
        batchInsertModelDataResult(dataPreAnnotationBO, modelBO, userId, serialNo);
        return String.valueOf(serialNo);
    }

    /**
     * Batch insert data model results
     *
     * @param dataPreAnnotationBO Data pre-annotation parameter
     * @param modelBO             Model information
     * @param userId              User id
     */
    private void batchInsertModelDataResult(DataPreAnnotationBO dataPreAnnotationBO, ModelBO modelBO, Long userId, Long serialNo) {
        var modelDataResultList = new ArrayList<ModelDataResult>();
        var dataIds = dataPreAnnotationBO.getDataIds();
        if (dataPreAnnotationBO.getOperateItemType().equals(ItemTypeEnum.SCENE)) {
            var dataInfos = getDataInfoBySceneIds(dataPreAnnotationBO.getDatasetId(), dataIds);
            dataIds = dataInfos.stream().map(DataInfoBO::getId).collect(Collectors.toList());
        }
        var modelMessageBO = DefaultConverter.convert(dataPreAnnotationBO, ModelMessageBO.class);
        modelMessageBO.setCreatedBy(userId);
        modelMessageBO.setModelSerialNo(serialNo);
        modelMessageBO.setModelId(modelBO.getId());
        modelMessageBO.setModelVersion(modelBO.getVersion());
        modelMessageBO.setUrl(modelBO.getUrl());
        int i = 1;
        var modelDataResultBuilder = ModelDataResult.builder()
                .modelId(modelBO.getId())
                .modelVersion(modelBO.getVersion())
                .datasetId(dataPreAnnotationBO.getDatasetId())
                .modelSerialNo(serialNo)
                .resultFilterParam(JSONUtil.toJsonStr(dataPreAnnotationBO.getResultFilterParam()));
        for (var dataId : dataIds) {
            var modelDataResult = modelDataResultBuilder.dataId(dataId).build();
            modelDataResultList.add(modelDataResult);
            if ((i % BATCH_SIZE == 0) || i == dataIds.size()) {
                modelDataResultDAO.getBaseMapper().insertIgnoreBatch(modelDataResultList);
                modelDataResultList.clear();
            }
            i++;
        }
        var dataInfoBOList = listByIds(dataIds, false);
        var dataMap = dataInfoBOList.stream().collect(Collectors.toMap(DataInfoBO::getId, dataInfoBO -> dataInfoBO));
        for (var dataId : dataIds) {
            modelMessageBO.setDataId(dataId);
            modelMessageBO.setDataInfo(dataMap.get(dataId));
            modelMessageBO.setDatasetId(dataMap.get(dataId).getDatasetId());
            modelUseCase.sendDataModelMessageToMQ(modelMessageBO);
        }
    }

    /**
     * Get model annotation results
     *
     * @param serialNo Serial number
     * @param dataIds  Data id collection
     * @return Model annotation result
     */
    public ModelObjectBO getModelAnnotateResult(Long serialNo, List<Long> dataIds) {
        var lambdaQueryWrapper = new LambdaQueryWrapper<ModelDataResult>();
        lambdaQueryWrapper.eq(ModelDataResult::getModelSerialNo, serialNo);
        if (CollectionUtil.isNotEmpty(dataIds)) {
            lambdaQueryWrapper.in(ModelDataResult::getDataId, dataIds);
        }
        lambdaQueryWrapper.isNotNull(ModelDataResult::getModelResult);
        var modelDataResultList = modelDataResultDAO.getBaseMapper().selectList(lambdaQueryWrapper);
        if (CollectionUtil.isNotEmpty(modelDataResultList)) {
            var modelId = modelDataResultList.stream().findFirst().orElse(new ModelDataResult()).getModelId();
            var modelBO = modelUseCase.findById(modelId);
            return ModelObjectBO.builder().modelCode(modelBO.getModelCode())
                    .modelDataResults(DefaultConverter.convert(modelDataResultList, ModelDataResultBO.class)).build();
        }
        return new ModelObjectBO();
    }

    /**
     * Get Model run data id
     *
     * @param modelRunFilterData Model run Filter data parameter
     * @param datasetId          Dataset id
     * @param modelId            Model id
     * @param limit              data id count
     * @return data id
     */
    public List<Long> findModelRunDataIds(ModelRunFilterDataBO modelRunFilterData, Long datasetId, Long modelId, Long limit) {
        var lambdaQueryWrapper = this.getCommonModelRunDataWrapper(modelRunFilterData, datasetId);
        return dataInfoDAO.getBaseMapper().findModelRunDataIds(lambdaQueryWrapper, modelId, modelRunFilterData.getIsExcludeModelData(), limit);
    }

    /**
     * Get Model run data count
     *
     * @param modelRunFilterData Model run Filter data parameter
     * @param datasetId          Dataset id
     * @param modelId            Model id
     * @return data count
     */
    public Long findModelRunDataCount(ModelRunFilterDataBO modelRunFilterData, Long datasetId, Long modelId) {
        var lambdaQueryWrapper = this.getCommonModelRunDataWrapper(modelRunFilterData, datasetId);
        return dataInfoDAO.getBaseMapper().findModelRunDataCount(lambdaQueryWrapper, modelId, modelRunFilterData.getIsExcludeModelData());
    }

    private Wrapper<DataInfo> getCommonModelRunDataWrapper(ModelRunFilterDataBO modelRunFilterData, Long datasetId) {
        var lambdaQueryWrapper = Wrappers.lambdaQuery(DataInfo.class);
        lambdaQueryWrapper.eq(DataInfo::getDatasetId, datasetId);
        lambdaQueryWrapper.eq(ObjectUtil.isNotNull(modelRunFilterData.getAnnotationStatus()), DataInfo::getAnnotationStatus, modelRunFilterData.getAnnotationStatus());
        lambdaQueryWrapper.eq(ObjectUtil.isNotNull(modelRunFilterData.getSplitType()), DataInfo::getSplitType, modelRunFilterData.getSplitType());
        lambdaQueryWrapper.eq(DataInfo::getIsDeleted, false);
        lambdaQueryWrapper.eq(DataInfo::getType, ItemTypeEnum.SINGLE_DATA);
        return lambdaQueryWrapper;
    }

    /**
     * Get the file information and set the file information to the data list
     *
     * @param dataInfoBOList Data collection
     */
    private void setDataInfoBOListFile(List<DataInfoBO> dataInfoBOList) {
        var fileIds = new ArrayList<Long>();
        dataInfoBOList.forEach(dataInfoBO -> fileIds.addAll(getFileIds(dataInfoBO.getContent())));
        if (CollectionUtil.isNotEmpty(fileIds)) {
            var fileMap = findFileByFileIds(fileIds);
            dataInfoBOList.forEach(dataInfoBO -> setFile(dataInfoBO.getContent(), fileMap));
        }
    }

    /**
     * Set file information in content
     *
     * @param fileNodeBOList Data file information
     * @param fileMap        File map
     */
    private void setFile(List<DataInfoBO.FileNodeBO> fileNodeBOList, Map<Long, RelationFileBO> fileMap) {
        if (CollectionUtil.isEmpty(fileNodeBOList)) {
            return;
        }
        fileNodeBOList.forEach(fileNodeBO -> {
            if (fileNodeBO.getType().equals(FILE)) {
                fileNodeBO.setFile(fileMap.get(fileNodeBO.getFileId()));
            } else {
                setFile(fileNodeBO.getFiles(), fileMap);
            }
        });
    }

    /**
     * Query file information based on file ID collection
     *
     * @param fileIds File id collection
     * @return Relation file map
     */
    private Map<Long, RelationFileBO> findFileByFileIds(List<Long> fileIds) {
        var relationFileBOList = fileUseCase.findByIds(fileIds);
        return CollectionUtil.isNotEmpty(relationFileBOList) ?
                relationFileBOList.stream().collect(Collectors.toMap(RelationFileBO::getId, relationFileBO -> relationFileBO, (k1, k2) -> k1)) : Map.of();

    }

    /**
     * Loop to get file ID from content
     *
     * @param fileNodeBOList File node List
     * @return File id collection
     */
    private List<Long> getFileIds(List<DataInfoBO.FileNodeBO> fileNodeBOList) {
        var fileIds = new ArrayList<Long>();
        if (CollectionUtil.isEmpty(fileNodeBOList)) {
            return fileIds;
        }
        fileNodeBOList.forEach(fileNodeBO -> {
            if (fileNodeBO.getType().equals(FILE)) {
                fileIds.add(fileNodeBO.getFileId());
            } else {
                fileIds.addAll(getFileIds(fileNodeBO.getFiles()));
            }
        });
        return fileIds;
    }

    /**
     * Data process
     *
     * @param dataIds   Data id list
     * @param queryBO   Data query parameters
     * @param classMap  Class id and class name associated map
     * @param resultMap Result id and result name associated map
     * @return Data export collection
     */
    public List<DataExportBO> processData(List<Long> dataIds, DataInfoQueryBO queryBO, Map<Long, String> classMap, Map<Long, String> resultMap) {
        if (CollectionUtil.isEmpty(dataIds)) {
            return List.of();
        }
        var dataInfoExportBOList = new ArrayList<DataExportBO>();
        var dataAnnotationList = dataAnnotationClassificationUseCase.findByDataIds(dataIds);
        Map<Long, List<DataAnnotationClassificationBO>> dataAnnotationMap = CollectionUtil.isNotEmpty(dataAnnotationList) ? dataAnnotationList.stream().collect(
                Collectors.groupingBy(DataAnnotationClassificationBO::getDataId)) : Map.of();
        var dataAnnotationObjectList = dataAnnotationObjectUseCase.findByDataIds(dataIds, queryBO.getIsAllResult(), queryBO.getSelectModelRunIds());
        Map<Long, List<DataAnnotationObjectBO>> dataAnnotationObjectMap = CollectionUtil.isNotEmpty(dataAnnotationObjectList) ?
                dataAnnotationObjectList.stream().collect(Collectors.groupingBy(DataAnnotationObjectBO::getDataId))
                : Map.of();
        var dataList = this.listByIds(dataIds, true);
        this.addSceneInfo(dataList);
        dataList.forEach(dataInfoBO -> {
            var dataId = dataInfoBO.getId();
            var dataExportBaseBO = assembleExportDataContent(dataInfoBO, queryBO.getDatasetType());
            var annotationList = dataAnnotationMap.get(dataId);
            var objectList = dataAnnotationObjectMap.get(dataId);
            var dataResultExportBOList = new ArrayList<DataResultExportBO>();
            if (CollectionUtil.isNotEmpty(objectList)) {
                var objectSourceMap = objectList.stream().collect(Collectors.groupingBy(DataAnnotationObjectBO::getSourceId));
                objectSourceMap.forEach((sourceId, objectSourceList) -> {
                    var dataResultExportBO = DataResultExportBO.builder().dataId(dataId).version(version).build();
                    var objects = new ArrayList<DataResultObjectExportBO>();
                    objectSourceList.forEach(o -> {
                        var dataResultObjectExportBO = DefaultConverter.convert(o.getClassAttributes(), DataResultObjectExportBO.class);
                        dataResultObjectExportBO.setClassName(classMap.get(o.getClassId()));
                        dataResultObjectExportBO.setClassId(o.getClassId());
                        objects.add(dataResultObjectExportBO);
                    });
                    dataResultExportBO.setObjects(objects);
                    dataResultExportBO.setSourceName(resultMap.get(sourceId));

                    if (GROUND_TRUTH.equals(sourceId)) {
                        if (CollectionUtil.isNotEmpty(annotationList)) {
                            var classificationAttributes = annotationList.stream().map(DataAnnotationClassificationBO::getClassificationAttributes).collect(Collectors.toList());
                            dataResultExportBO.setClassificationValues(JSONUtil.parseArray(classificationAttributes));
                        }
                    }
                    dataResultExportBOList.add(dataResultExportBO);
                });

            }
            var dataInfoExportBO = DataExportBO.builder().data(dataExportBaseBO).build();
            dataInfoExportBO.setSceneName(dataInfoBO.getSceneName());
            if (CollectionUtil.isNotEmpty(annotationList) || CollectionUtil.isNotEmpty(objectList)) {
                dataInfoExportBO.setResult(dataResultExportBOList);
            }
            dataInfoExportBOList.add(dataInfoExportBO);
        });
        return dataInfoExportBOList;
    }

    private void addSceneInfo(List<DataInfoBO> dataInfoBOList) {
        var sceneMap = new HashMap<Long, DataInfoBO>();
        var sceneIds = dataInfoBOList.stream().filter(dataInfoBO -> ObjectUtil.isNotNull(dataInfoBO.getParentId()) && dataInfoBO.getParentId() != 0).map(DataInfoBO::getParentId).collect(Collectors.toList());
        // Find the upper Scene
        if (CollUtil.isNotEmpty(sceneIds)) {
            var sceneList = dataInfoDAO.listByIds(sceneIds);
            if (CollUtil.isNotEmpty(sceneList)) {
                sceneMap.putAll(sceneList.stream().collect(Collectors.toMap(DataInfo::getId, dataInfo -> DefaultConverter.convert(dataInfo, DataInfoBO.class))));
                handleSingleData(dataInfoBOList, sceneMap);
            }
        }
    }

    private void handleSingleData(List<DataInfoBO> singleDataList, Map<Long, DataInfoBO> sceneMap) {
        if (CollUtil.isEmpty(singleDataList)) {
            return;
        }
        singleDataList.stream().filter(dataInfoBO -> 0 != dataInfoBO.getParentId()).forEach(dataInfoBO -> {
            var scene = sceneMap.get(dataInfoBO.getParentId());
            dataInfoBO.setSceneName(scene.getName());
        });
    }

    /**
     * Assemble the export data content
     *
     * @return data information
     */
    private DataExportBaseBO assembleExportDataContent(DataInfoBO dataInfoBO, DatasetTypeEnum datasetType) {
        DataExportBaseBO dataExportBaseBO = new DataExportBaseBO();
        dataExportBaseBO.setDataId(dataInfoBO.getId());
        dataExportBaseBO.setName(dataInfoBO.getName());
        dataExportBaseBO.setType(datasetType.name());
        dataExportBaseBO.setVersion(version);
        var images = new ArrayList<ExportDataImageFileBO>();
        var lidarPointClouds = new ArrayList<ExportDataLidarPointCloudFileBO>();
        var texts = new ArrayList<ExportDataTextFileBO>();
        var cameraConfigBO = new ExportDataCameraConfigFileBO();
        for (DataInfoBO.FileNodeBO f : dataInfoBO.getContent()) {
            var fileDTO = Constants.FILE.equals(f.getType()) ? f.getFile() : CollectionUtil.getFirst(f.getFiles()).getFile();
            if (f.getName().startsWith(Constants.LIDAR_POINT_CLOUD)) {
                var lidarPointCloudBO = new ExportDataLidarPointCloudFileBO();
                lidarPointCloudBO.setUrl(fileDTO.getUrl());
                lidarPointCloudBO.setInternalUrl(fileDTO.getInternalUrl());
                lidarPointCloudBO.setFilename(fileDTO.getOriginalName());
                lidarPointCloudBO.setZipPath(fileDTO.getZipPath());
                lidarPointCloudBO.setDeviceName(f.getName());
                lidarPointClouds.add(lidarPointCloudBO);
            } else if (f.getName().equals(Constants.CAMERA_CONFIG)) {
                cameraConfigBO.setUrl(fileDTO.getUrl());
                cameraConfigBO.setFilename(fileDTO.getOriginalName());
                cameraConfigBO.setZipPath(fileDTO.getZipPath());
                cameraConfigBO.setInternalUrl(fileDTO.getInternalUrl());
                cameraConfigBO.setDeviceName(f.getName());
            } else if (f.getName().contains(Constants.IMAGE)) {
                var url = fileDTO.getUrl();
                var zipPath = fileDTO.getZipPath();
                var lidarFusionImageBO = DefaultConverter.convert(fileDTO.getExtraInfo(), ExportDataImageFileBO.class);
                lidarFusionImageBO = ObjectUtil.isNull(lidarFusionImageBO) ? new ExportDataImageFileBO() : lidarFusionImageBO;
                lidarFusionImageBO.setFilename(fileDTO.getOriginalName());
                lidarFusionImageBO.setUrl(url);
                lidarFusionImageBO.setInternalUrl(fileDTO.getInternalUrl());
                lidarFusionImageBO.setZipPath(zipPath);
                lidarFusionImageBO.setDeviceName(f.getName().equals("image0") ? "image_0" : f.getName());
                images.add(lidarFusionImageBO);
            } else if (f.getName().startsWith(Constants.TEXT)) {
                var textFileBO = DefaultConverter.convert(fileDTO.getExtraInfo(), ExportDataTextFileBO.class);
                textFileBO.setUrl(fileDTO.getUrl());
                textFileBO.setInternalUrl(fileDTO.getInternalUrl());
                textFileBO.setFilename(fileDTO.getOriginalName());
                textFileBO.setZipPath(fileDTO.getZipPath());
                textFileBO.setDeviceName(f.getName());
                texts.add(textFileBO);
            }
        }
        switch (datasetType) {
            case LIDAR_FUSION:
                dataExportBaseBO = DefaultConverter.convert(dataExportBaseBO, LidarFusionDataExportBO.class);
                ((LidarFusionDataExportBO) dataExportBaseBO).setLidarPointClouds(lidarPointClouds);
                ((LidarFusionDataExportBO) dataExportBaseBO).setCameraConfig(cameraConfigBO);
                ((LidarFusionDataExportBO) dataExportBaseBO).setCameraImages(images);
                break;
            case LIDAR_BASIC:
                dataExportBaseBO = DefaultConverter.convert(dataExportBaseBO, LidarBasicDataExportBO.class);
                ((LidarBasicDataExportBO) dataExportBaseBO).setLidarPointClouds(lidarPointClouds);
                break;
            case IMAGE:
                dataExportBaseBO = DefaultConverter.convert(dataExportBaseBO, ImageDataExportBO.class);
                ((ImageDataExportBO) dataExportBaseBO).setImages(images);
                break;
            case TEXT:
                dataExportBaseBO = DefaultConverter.convert(dataExportBaseBO, TextDataExportBO.class);
                ((TextDataExportBO) dataExportBaseBO).setTexts(texts);
                break;
            default:
                break;
        }
        return dataExportBaseBO;
    }

    /**
     * Export data
     *
     * @param scenarioQueryBO Query parameters
     * @return Serial number
     */
    public Long scenarioExport(ScenarioQueryBO scenarioQueryBO) {
        var fileName = String.format("%s-%s.zip", "export", TemporalAccessorUtil.format(OffsetDateTime.now(), DatePattern.PURE_DATETIME_PATTERN));
        var serialNumber = exportUseCase.createExportRecord(fileName);
        scenarioQueryBO.setPageNo(PAGE_NO);
        scenarioQueryBO.setPageSize(PAGE_SIZE_100);
        var datasetClassBOList = datasetClassUseCase.findByIds(scenarioQueryBO.getDatasetId(), scenarioQueryBO.getClassIds());
        var classMap = new HashMap<Long, String>();
        if (CollectionUtil.isNotEmpty(datasetClassBOList)) {
            classMap.putAll(datasetClassBOList.stream().collect(Collectors.toMap(DatasetClassBO::getId, DatasetClassBO::getName)));
        }
        var resultMap = this.getResultMap(scenarioQueryBO.getDatasetId());
        executorService.execute(Objects.requireNonNull(TtlRunnable.get(() ->
                exportUseCase.asyncExportDataZip(fileName, serialNumber, classMap, resultMap, scenarioQueryBO,
                        dataAnnotationObjectUseCase::findDataIdByScenario,
                        this::processScenarioData))));
        return serialNumber;
    }


    public List<DataExportBO> processScenarioData(List<Long> dataIds, ScenarioQueryBO queryBO, Map<Long, String> classMap, Map<Long, String> resultMap) {
        if (CollectionUtil.isEmpty(dataIds)) {
            return List.of();
        }
        var dataInfoExportBOList = new ArrayList<DataExportBO>();
        queryBO.setDataIds(dataIds);
        var dataAnnotationObjectList = dataAnnotationObjectUseCase.listByScenario(queryBO);
        Map<Long, List<DataAnnotationObjectBO>> dataAnnotationObjectMap = CollectionUtil.isNotEmpty(dataAnnotationObjectList) ?
                dataAnnotationObjectList.stream().collect(Collectors.groupingBy(DataAnnotationObjectBO::getDataId))
                : Map.of();
        var dataList = listByIds(dataIds, false);
        dataList.forEach(dataInfoBO -> {
            var dataId = dataInfoBO.getId();
            var dataExportBaseBO = assembleExportDataContent(dataInfoBO, queryBO.getDatasetType());
            var objectList = dataAnnotationObjectMap.get(dataId);
            var dataResultExportBO = DataResultExportBO.builder().dataId(dataId).version(version).build();
            if (CollectionUtil.isNotEmpty(objectList)) {
                var objects = new ArrayList<DataResultObjectExportBO>();
                objectList.forEach(o -> {
                    var dataResultObjectExportBO = DefaultConverter.convert(o.getClassAttributes(), DataResultObjectExportBO.class);
                    dataResultObjectExportBO.setClassName(classMap.get(o.getClassId()));
                    objects.add(dataResultObjectExportBO);
                });
                dataResultExportBO.setObjects(objects);
            }
            var dataInfoExportBO = DataExportBO.builder().data(dataExportBaseBO).build();
            if (CollectionUtil.isNotEmpty(objectList)) {
                dataInfoExportBO.setResult(List.of(dataResultExportBO));
            }
            dataInfoExportBOList.add(dataInfoExportBO);
        });
        return dataInfoExportBOList;
    }

    public DataResultBO getDataAndResult(Long datasetId, List<Long> dataIds) {
        var dataset = datasetDAO.getById(datasetId);
        if (ObjectUtil.isNull(dataset)) {
            throw new UsecaseException(DATASET_NOT_FOUND);
        }
        var dataInfoQueryBO = DataInfoQueryBO.builder().datasetType(dataset.getType()).build();
        var datasetClassBOList = datasetClassUseCase.findAll(datasetId);
        var classMap = new HashMap<Long, String>();
        if (CollectionUtil.isNotEmpty(datasetClassBOList)) {
            classMap.putAll(datasetClassBOList.stream().collect(Collectors.toMap(DatasetClassBO::getId, DatasetClassBO::getName)));
        }

        var resultMap = this.getResultMap(datasetId);
        dataInfoQueryBO.setIsAllResult(true);
        var dataExportBOList = processData(dataIds, dataInfoQueryBO, classMap, resultMap);
        var exportTime = TemporalAccessorUtil.format(OffsetDateTime.now(), DatePattern.PURE_DATETIME_PATTERN);
        var data = new ArrayList<DataExportBaseBO>();
        var results = new ArrayList<DataResultExportBO>();
        dataExportBOList.forEach(dataExportBO -> {
            if (ObjectUtil.isNotNull(dataExportBO.getData())) {
                data.add(dataExportBO.getData());
            }
            if (CollUtil.isNotEmpty(dataExportBO.getResult())) {
                results.addAll(dataExportBO.getResult());
            }
        });
        return DataResultBO.builder().version(version).datasetId(dataset.getId())
                .datasetName(dataset.getName()).exportTime(exportTime).data(data).results(results).build();
    }

    private Map<Long, String> getResultMap(Long datasetId) {
        var resultMap = new HashMap<Long, String>();
        var modelRunRecordBOList = modelRunRecordUseCase.findByDatasetId(datasetId);
        if (CollUtil.isNotEmpty(modelRunRecordBOList)) {
            resultMap.putAll(modelRunRecordBOList.stream().collect(Collectors.toMap(ModelRunRecordBO::getId, ModelRunRecordBO::getRunNo)));
        }
        resultMap.put(GROUND_TRUTH, GROUND_TRUTH_NAME);
        return resultMap;
    }

    public void setDatasetSixData(List<DatasetBO> datasetBOList) {
        if (CollectionUtil.isEmpty(datasetBOList)) {
            return;
        }
        var datasetIds = new ArrayList<Long>();
        var datasetTypeMap = new HashMap<Long, DatasetTypeEnum>();
        datasetBOList.forEach(datasetBO -> {
            datasetIds.add(datasetBO.getId());
            datasetTypeMap.put(datasetBO.getId(), datasetBO.getType());
        });
        var datasetSixDataList = dataInfoDAO.getBaseMapper().selectSixDataIdByDatasetIds(datasetIds);
        var dataIds = new HashSet<Long>();
        datasetSixDataList.forEach(datasetSixData -> {
            var datasetType = datasetTypeMap.get(datasetSixData.getDatasetId());
            var ids = StrUtil.splitToLong(datasetSixData.getDataIds(), ",");
            if (null != ids && ids.length > 0) {
                if (IMAGE.equals(datasetType)) {
                    CollectionUtil.addAll(dataIds, ids);
                } else {
                    dataIds.add(ids[0]);
                }
            }
        });
        if (CollectionUtil.isNotEmpty(dataIds)) {
            var dataInfoBOList = listByIds(new ArrayList<>(dataIds), false);
            var dataMap = dataInfoBOList.stream().collect(Collectors.groupingBy(DataInfoBO::getDatasetId));
            datasetBOList.forEach(datasetBO -> datasetBO.setDatas(dataMap.get(datasetBO.getId())));
        }
    }

    public DataInfoBO getInitDataInfoBO(DatasetInitialInfo datasetInitialInfo) {
        var dataset = datasetUseCase.getInitDataset(datasetInitialInfo);
        if (ObjectUtil.isNull(dataset)) {
            throw new UsecaseException(DEFAULT_DATASET_NOT_FOUND);
        }
        var dataInfoLambdaQueryWrapper = Wrappers.lambdaQuery(DataInfo.class);
        dataInfoLambdaQueryWrapper.eq(DataInfo::getDatasetId, dataset.getId());
        dataInfoLambdaQueryWrapper.last("limit 1");
        var dataInfoBO = DefaultConverter.convert(dataInfoDAO.getOne(dataInfoLambdaQueryWrapper), DataInfoBO.class);
        setDataInfoBOListFile(List.of(dataInfoBO));
        return dataInfoBO;
    }


}
