package ai.basic.x1.usecase;

import ai.basic.x1.adapter.api.config.DatasetInitialInfo;
import ai.basic.x1.adapter.api.context.RequestContextHolder;
import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.port.dao.*;
import ai.basic.x1.adapter.port.dao.mybatis.extension.ExtendLambdaQueryWrapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataInfo;
import ai.basic.x1.adapter.port.dao.mybatis.model.*;
import ai.basic.x1.adapter.port.dao.mybatis.query.DataInfoQuery;
import ai.basic.x1.adapter.port.minio.MinioProp;
import ai.basic.x1.adapter.port.minio.MinioService;
import ai.basic.x1.adapter.port.rpc.PointCloudConvertRenderHttpCaller;
import ai.basic.x1.adapter.port.rpc.dto.*;
import ai.basic.x1.entity.*;
import ai.basic.x1.entity.enums.*;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.*;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.collection.ListUtil;
import cn.hutool.core.date.DatePattern;
import cn.hutool.core.date.StopWatch;
import cn.hutool.core.date.TemporalAccessorUtil;
import cn.hutool.core.img.Img;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.io.StreamProgress;
import cn.hutool.core.lang.UUID;
import cn.hutool.core.lang.tree.Tree;
import cn.hutool.core.lang.tree.TreeUtil;
import cn.hutool.core.thread.ThreadUtil;
import cn.hutool.core.util.*;
import cn.hutool.crypto.SecureUtil;
import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONUtil;
import com.alibaba.ttl.TtlRunnable;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.google.common.collect.Sets;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;
import java.util.stream.Collectors;

import static ai.basic.x1.entity.enums.DataUploadSourceEnum.LOCAL;
import static ai.basic.x1.entity.enums.DatasetTypeEnum.IMAGE;
import static ai.basic.x1.entity.enums.DatasetTypeEnum.*;
import static ai.basic.x1.entity.enums.DatasetTypeEnum.TEXT;
import static ai.basic.x1.entity.enums.RelationEnum.*;
import static ai.basic.x1.entity.enums.SplitTypeEnum.NOT_SPLIT;
import static ai.basic.x1.entity.enums.UploadStatusEnum.*;
import static ai.basic.x1.usecase.exception.UsecaseCode.*;
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
    private UploadUseCase uploadUseCase;

    @Autowired
    private UploadRecordDAO uploadRecordDAO;

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


    @Value("${file.tempPath:/tmp/xtreme1/}")
    private String tempPath;

    @Value("${export.data.version}")
    private String version;

    @Value("${file.size.large:400}")
    private int largeFileSize;

    @Value("${file.size.medium:200}")
    private int mediumFileSize;

    @Value("${file.size.small:100}")
    private int smallFileSize;

    @Value("${file.prefix.large:large}")
    private String large;

    @Value("${file.prefix.medium:medium}")
    private String medium;

    @Value("${file.prefix.small:small}")
    private String small;

    @Autowired
    private PointCloudConvertRenderHttpCaller pointCloudConvertRenderHttpCaller;


    private static final ExecutorService executorService = ThreadUtil.newExecutor(2);

    private static final ExecutorService parseExecutorService = ThreadUtil.newExecutor(5);

    private static final Integer PC_RENDER_IMAGE_WIDTH = 2000;
    private static final Integer PC_RENDER_IMAGE_HEIGHT = 2000;
    private static final Integer RETRY_COUNT = 3;

    private static final Long GROUND_TRUTH = -1L;

    private static final String GROUND_TRUTH_NAME = "Ground Truth";
    /**
     * Filter out files whose file suffix is not image, and discard the file when it returns false
     */
    private final FileFilter imageFileFilter = file -> {
        //if the file extension is image return true, else false
        return IMAGE_DATA_TYPE.contains(FileUtil.getMimeType(file.getAbsolutePath())) && Constants.IMAGE.equalsIgnoreCase(FileUtil.getName(file.getParentFile()));
    };

    private final FileFilter textFileFilter = file -> {
        //if the file extension is json return true, else false
        return file.getAbsolutePath().toUpperCase().endsWith(JSON_SUFFIX) && Constants.TEXT.equalsIgnoreCase(FileUtil.getName(file.getParentFile()));
    };


    /**
     * Data split
     *
     * @param dataIds   Data id collection
     * @param splitType split type
     */
    public void splitByDataIds(List<Long> dataIds, SplitTypeEnum splitType) {
        var dataInfoLambdaUpdateWrapper = Wrappers.lambdaUpdate(DataInfo.class);
        dataInfoLambdaUpdateWrapper.in(DataInfo::getId, dataIds);
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
            dataInfoLambdaUpdateWrapper.in(DataInfo::getId, dataIds);
            dataInfoLambdaUpdateWrapper.set(DataInfo::getSplitType, splitType);
            dataInfoDAO.update(dataInfoLambdaUpdateWrapper);
        }
    }

    /**
     * Total amount of segmented data obtained
     *
     * @param datasetId      Dataset id
     * @param targetDataType Data type
     * @return
     */
    public Long getSplitDataTotalCount(Long datasetId, SplitTargetDataTypeEnum targetDataType) {
        var dataInfoLambdaQueryWrapper = getCommonSplitWrapper(datasetId, targetDataType);
        var dataCount = dataInfoDAO.count(dataInfoLambdaQueryWrapper);
        return dataCount;
    }

    private LambdaQueryWrapper<DataInfo> getCommonSplitWrapper(Long datasetId, SplitTargetDataTypeEnum targetDataType) {
        var dataInfoLambdaQueryWrapper = Wrappers.lambdaQuery(DataInfo.class);
        dataInfoLambdaQueryWrapper.eq(DataInfo::getDatasetId, datasetId);
        dataInfoLambdaQueryWrapper.select(DataInfo::getId);
        dataInfoLambdaQueryWrapper.ne(SplitTargetDataTypeEnum.SPLIT.equals(targetDataType), DataInfo::getSplitType, SplitTargetDataTypeEnum.NOT_SPLIT);
        dataInfoLambdaQueryWrapper.eq(SplitTargetDataTypeEnum.NOT_SPLIT.equals(targetDataType), DataInfo::getSplitType, targetDataType);
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
        var count = dataEditDAO.count(Wrappers.lambdaQuery(DataEdit.class).in(DataEdit::getDataId, ids));
        if (count > 0) {
            throw new UsecaseException(UsecaseCode.DATASET_DATA_OTHERS_ANNOTATING);
        }
        dataInfoDAO.removeBatchByIds(ids);

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
        var lambdaQueryWrapper = new ExtendLambdaQueryWrapper<DataInfo>();
        lambdaQueryWrapper.eq(DataInfo::getDatasetId, queryBO.getDatasetId());
        lambdaQueryWrapper.eq(DataInfo::getIsDeleted, false);
        lambdaQueryWrapper.like(StrUtil.isNotEmpty(queryBO.getName()), DataInfo::getName, queryBO.getName());
        lambdaQueryWrapper.eq(ObjectUtil.isNotNull(queryBO.getAnnotationStatus()), DataInfo::getAnnotationStatus, queryBO.getAnnotationStatus());
        lambdaQueryWrapper.ge(ObjectUtil.isNotEmpty(queryBO.getCreateStartTime()), DataInfo::getCreatedAt, queryBO.getCreateStartTime());
        lambdaQueryWrapper.le(ObjectUtil.isNotEmpty(queryBO.getCreateEndTime()), DataInfo::getCreatedAt, queryBO.getCreateEndTime());
        lambdaQueryWrapper.in(CollUtil.isNotEmpty(queryBO.getIds()), DataInfo::getId, queryBO.getIds());
        lambdaQueryWrapper.eq(ObjectUtil.isNotNull(queryBO.getSplitType()), DataInfo::getSplitType, queryBO.getSplitType());
        var dataInfoPage = dataInfoDAO.getBaseMapper().selectDataPage(new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(queryBO.getPageNo(), queryBO.getPageSize()),
                lambdaQueryWrapper, DefaultConverter.convert(queryBO, DataInfoQuery.class));
        var dataInfoBOPage = DefaultConverter.convert(dataInfoPage, DataInfoBO.class);
        var dataInfoBOList = dataInfoBOPage.getList();
        if (CollectionUtil.isNotEmpty(dataInfoBOList)) {
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
     * Get file information to group according to dataset id
     *
     * @param dataInfoBOList Data collection
     * @return Dataset and data collection map
     */
    public Map<Long, List<DataInfoBO>> getDataInfoListFileMap(List<DataInfoBO> dataInfoBOList) {
        if (CollectionUtil.isNotEmpty(dataInfoBOList)) {
            setDataInfoBOListFile(dataInfoBOList);
            return dataInfoBOList.stream().collect(
                    Collectors.groupingBy(DataInfoBO::getDatasetId));
        }
        return Map.of();
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
     * Upload data
     *
     * @param dataInfoUploadBO Upload data object Contains a collection of file information
     */
    @Transactional(rollbackFor = RuntimeException.class)
    public Long upload(DataInfoUploadBO dataInfoUploadBO) {
        var uploadRecordBO = uploadUseCase.createUploadRecord(dataInfoUploadBO.getFileUrl());
        var boo = DecompressionFileUtils.validateUrl(dataInfoUploadBO.getFileUrl());
        if (!boo) {
            uploadUseCase.updateUploadRecordStatus(uploadRecordBO.getId(), FAILED, DATASET_DATA_FILE_URL_ERROR.getMessage());
            log.error("File url error,datasetId:{},userId:{},fileUrl:{}", dataInfoUploadBO.getDatasetId(), dataInfoUploadBO.getUserId(), dataInfoUploadBO.getFileUrl());
            return uploadRecordBO.getSerialNumber();
        }
        var dataset = datasetDAO.getById(dataInfoUploadBO.getDatasetId());
        if (ObjectUtil.isNull(dataset)) {
            uploadUseCase.updateUploadRecordStatus(uploadRecordBO.getId(), FAILED, DATASET_NOT_FOUND.getMessage());
            log.error("Dataset not found,datasetId:{},userId:{},fileUrl:{}", dataInfoUploadBO.getDatasetId(), dataInfoUploadBO.getUserId(), dataInfoUploadBO.getFileUrl());
            return uploadRecordBO.getSerialNumber();
        }
        dataInfoUploadBO.setType(dataset.getType());
        var fileUrl = DecompressionFileUtils.removeUrlParameter(dataInfoUploadBO.getFileUrl());
        var mimeType = FileUtil.getMimeType(fileUrl);
        if (!validateUrlFileSuffix(dataInfoUploadBO, mimeType)) {
            uploadUseCase.updateUploadRecordStatus(uploadRecordBO.getId(), FAILED, DATASET_DATA_FILE_FORMAT_ERROR.getMessage());
            log.error("Incorrect file format,datasetId:{},userId:{},fileUrl:{}", dataInfoUploadBO.getDatasetId(), dataInfoUploadBO.getUserId(), dataInfoUploadBO.getFileUrl());
            return uploadRecordBO.getSerialNumber();
        }
        dataInfoUploadBO.setUploadRecordId(uploadRecordBO.getId());
        executorService.execute(Objects.requireNonNull(TtlRunnable.get(() -> {
            try {
                if (IMAGE.equals(dataset.getType()) && IMAGE_DATA_TYPE.contains(mimeType)) {
                    this.downloadAndDecompressionFile(dataInfoUploadBO, this::parseImageUploadFile);
                } else if (IMAGE.equals(dataset.getType()) && COMPRESSED_DATA_TYPE.contains(mimeType)) {
                    this.downloadAndDecompressionFile(dataInfoUploadBO, this::parseImageCompressedUploadFile);
                } else if (TEXT.equals(dataset.getType())) {
                    this.downloadAndDecompressionFile(dataInfoUploadBO, this::parseTextUploadFile);
                } else {
                    this.downloadAndDecompressionFile(dataInfoUploadBO, this::parsePointCloudUploadFile);
                }
            } catch (IOException e) {
                log.error("Download decompression file error", e);
            }
        })));
        return uploadRecordBO.getSerialNumber();
    }


    /**
     * Verify url file suffix
     *
     * @param dataInfoUploadBO Upload data object
     * @param mimeType         Mime type
     * @return boolean
     */
    private boolean validateUrlFileSuffix(DataInfoUploadBO dataInfoUploadBO, String mimeType) {
        boolean boo;
        boo = COMPRESSED_DATA_TYPE.contains(mimeType);
        if (IMAGE.equals(dataInfoUploadBO.getType()) && LOCAL.equals(dataInfoUploadBO.getSource())) {
            boo = boo || IMAGE_DATA_TYPE.contains(mimeType);
        }
        return boo;
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
                        this::findByPage,
                        this::processData))));
        return serialNumber;
    }

    public void parsePointCloudUploadFile(DataInfoUploadBO dataInfoUploadBO) {
        var errorBuilder = new StringBuilder();
        var datasetId = dataInfoUploadBO.getDatasetId();
        var userId = dataInfoUploadBO.getUserId();
        var datasetType = dataInfoUploadBO.getType();
        var pointCloudList = new ArrayList<File>();
        findPointCloudList(dataInfoUploadBO.getBaseSavePath(), pointCloudList);
        var rootPath = String.format("%s/%s", userId, datasetId);
        log.info("Get point_cloud datasetId:{},size:{}", datasetId, pointCloudList.size());
        if (CollectionUtil.isEmpty(pointCloudList)) {
            uploadUseCase.updateUploadRecordStatus(dataInfoUploadBO.getUploadRecordId(), FAILED, POINT_CLOUD_COMPRESSED_FILE_ERROR.getMessage());
            log.error("The format of the compression package is incorrect. It must contain point_cloud,userId:{},datasetId:{},fileUrl:{}",
                    userId, datasetId, dataInfoUploadBO.getFileUrl());
            uploadUseCase.updateUploadRecordStatus(dataInfoUploadBO.getUploadRecordId(), FAILED, POINT_CLOUD_COMPRESSED_FILE_ERROR.getMessage());
            return;
        }
        var totalDataNum = pointCloudList.stream()
                .filter(pointCloudFile -> !validDirectoryFormat(pointCloudFile.getParentFile(), datasetType))
                .mapToLong(pointCloudFile -> getDataNames(pointCloudFile.getParentFile(), datasetType).size()).sum();
        AtomicReference<Long> parsedDataNum = new AtomicReference<>(0L);
        var uploadRecordBOBuilder = UploadRecordBO.builder()
                .id(dataInfoUploadBO.getUploadRecordId()).totalDataNum(totalDataNum).parsedDataNum(parsedDataNum.get()).status(PARSING);
        if (totalDataNum <= 0) {
            uploadUseCase.updateUploadRecordStatus(dataInfoUploadBO.getUploadRecordId(), FAILED, COMPRESSED_PACKAGE_EMPTY.getMessage());
            throw new UsecaseException(COMPRESSED_PACKAGE_EMPTY);
        }
        Long sourceId = null;
        if (ObjectUtil.isNotNull(dataInfoUploadBO.getResultType())) {
            sourceId = -1L;
            if (ResultTypeEnum.MODEL_RUN.equals(dataInfoUploadBO.getResultType())) {
                sourceId = modelRunRecordUseCase.save(dataInfoUploadBO.getModelId(), datasetId, totalDataNum);
            }
        }
        var dataAnnotationObjectBOBuilder = DataAnnotationObjectBO.builder()
                .datasetId(datasetId).createdBy(userId).createdAt(OffsetDateTime.now()).sourceId(sourceId);
        pointCloudList.forEach(pointCloudFile -> {
            var isError = this.validDirectoryFormat(pointCloudFile.getParentFile(), datasetType);
            if (isError) {
                return;
            }
            var dataNameList = getDataNames(pointCloudFile.getParentFile(), datasetType);
            if (CollectionUtil.isEmpty(dataNameList)) {
                log.error("The file in {} folder is empty", pointCloudFile.getParentFile().getName());
                errorBuilder.append("The file in ").append(pointCloudFile.getParentFile().getName()).append(" folder is empty;");
                return;
            }
            log.info("Get data name,pointCloudParentName:{},dataName:{} ", pointCloudFile.getParentFile().getName(), JSONUtil.toJsonStr(dataNameList));
            var dataInfoBOBuilder = DataInfoBO.builder().datasetId(datasetId).status(DataStatusEnum.VALID)
                    .annotationStatus(DataAnnotationStatusEnum.NOT_ANNOTATED)
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .createdBy(userId)
                    .isDeleted(false);
            var list = ListUtil.split(dataNameList, 5);
            CountDownLatch countDownLatch = new CountDownLatch(list.size());
            list.forEach(subDataNameList -> parseExecutorService.submit(Objects.requireNonNull(TtlRunnable.get(() -> {
                var dataInfoBOList = new ArrayList<DataInfoBO>();
                var dataAnnotationObjectBOList = new ArrayList<DataAnnotationObjectBO>();
                try {
                    subDataNameList.forEach(dataName -> {
                        var dataFiles = getDataFiles(pointCloudFile.getParentFile(), dataName, datasetType);
                        if (CollectionUtil.isNotEmpty(dataFiles)) {
                            var tempDataId = ByteUtil.bytesToLong(SecureUtil.md5().digest(UUID.randomUUID().toString()));
                            var dataAnnotationObjectBO = dataAnnotationObjectBOBuilder.dataId(tempDataId).build();
                            handleDataResult(pointCloudFile.getParentFile(), dataName, dataAnnotationObjectBO, dataAnnotationObjectBOList, errorBuilder);
                            var fileNodeList = assembleContent(dataFiles, rootPath, dataInfoUploadBO);
                            log.info("Get data content,frameName:{},content:{} ", dataName, JSONUtil.toJsonStr(fileNodeList));
                            var dataInfoBO = dataInfoBOBuilder.name(dataName).content(fileNodeList).splitType(NOT_SPLIT).tempDataId(tempDataId).build();
                            dataInfoBOList.add(dataInfoBO);
                        }
                    });
                    if (CollectionUtil.isNotEmpty(dataInfoBOList)) {
                        var resDataInfoList = this.insertBatch(dataInfoBOList, datasetId, errorBuilder);
                        this.saveBatchDataResult(resDataInfoList, dataAnnotationObjectBOList);
                    }
                } catch (Exception e) {
                    log.error("Handle data error", e);
                } finally {
                    parsedDataNum.set(parsedDataNum.get() + subDataNameList.size());
                    var uploadRecordBO = uploadRecordBOBuilder.parsedDataNum(parsedDataNum.get()).build();
                    uploadRecordDAO.updateById(DefaultConverter.convert(uploadRecordBO, UploadRecord.class));
                    countDownLatch.countDown();
                }
            }))));
            try {
                countDownLatch.await();
            } catch (InterruptedException e) {
                log.error("Parse point cloud count down latch error", e);
            }
        });
        var uploadRecordBO = uploadRecordBOBuilder.parsedDataNum(totalDataNum).errorMessage(errorBuilder.toString()).status(PARSE_COMPLETED).build();
        uploadRecordDAO.updateById(DefaultConverter.convert(uploadRecordBO, UploadRecord.class));
        if (ObjectUtil.isNotNull(sourceId) && ResultTypeEnum.MODEL_RUN.equals(dataInfoUploadBO.getResultType())) {
            modelRunRecordUseCase.updateById(sourceId, RunStatusEnum.SUCCESS);
        }
    }


    private List<DataInfoBO> findByNames(Long datasetId, List<String> names) {
        var dataInfoLambdaQueryWrapper = Wrappers.lambdaQuery(DataInfo.class);
        dataInfoLambdaQueryWrapper.eq(DataInfo::getDatasetId, datasetId);
        dataInfoLambdaQueryWrapper.in(DataInfo::getName, names);
        return DefaultConverter.convert(dataInfoDAO.list(dataInfoLambdaQueryWrapper), DataInfoBO.class);
    }

    private void parseImageUploadFile(DataInfoUploadBO dataInfoUploadBO) {
        var userId = dataInfoUploadBO.getUserId();
        var datasetId = dataInfoUploadBO.getDatasetId();
        var dataInfoBOBuilder = DataInfoBO.builder().datasetId(datasetId).status(DataStatusEnum.VALID)
                .annotationStatus(DataAnnotationStatusEnum.NOT_ANNOTATED)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .createdBy(userId)
                .isDeleted(false);
        var file = FileUtil.file(dataInfoUploadBO.getSavePath());
        var imageExtraInfoBO = ImageExtraInfoBO.builder().height(Img.from(file).getImg().getHeight(null))
                .width(Img.from(file).getImg().getWidth(null)).build();
        var fileUrl = DecompressionFileUtils.removeUrlParameter(URLUtil.decode(dataInfoUploadBO.getFileUrl()));
        var path = fileUrl.replace(minioProp.getEndpoint(), "").replace(minioProp.getBucketName() + "/", "");
        var fileBO = FileBO.builder().name(file.getName()).originalName(file.getName()).bucketName(minioProp.getBucketName())
                .size(file.length()).path(path).type(FileUtil.getMimeType(path)).extraInfo(JSONUtil.parseObj(imageExtraInfoBO)).build();
        var fileBOS = fileUseCase.saveBatchFile(userId, Collections.singletonList(fileBO));
        var fileNodeBO = DataInfoBO.FileNodeBO.builder().name(fileBO.getName())
                .fileId(CollectionUtil.getFirst(fileBOS).getId()).type(FILE).build();
        var dataInfoBO = dataInfoBOBuilder.name(getFileName(file))
                .content(Collections.singletonList(fileNodeBO)).splitType(NOT_SPLIT).build();
        var errorBuilder = new StringBuilder();
        try {
            dataInfoDAO.save(DefaultConverter.convert(dataInfoBO, DataInfo.class));
        } catch (DuplicateKeyException e) {
            log.error("Duplicate data name", e);
            errorBuilder.append("Duplicate data name;");
        }
        var rootPath = String.format("%s/%s", userId, datasetId);
        var newSavePath = tempPath + fileBO.getPath().replace(rootPath, "");
        FileUtil.copy(dataInfoUploadBO.getSavePath(), newSavePath, true);
        createUploadThumbnail(userId, fileBOS, rootPath);
        FileUtil.clean(newSavePath);
        var uploadRecordBO = UploadRecordBO.builder()
                .id(dataInfoUploadBO.getUploadRecordId()).totalDataNum(1L).parsedDataNum(1L).errorMessage(errorBuilder.toString()).status(PARSE_COMPLETED).build();
        uploadRecordDAO.updateById(DefaultConverter.convert(uploadRecordBO, UploadRecord.class));
        datasetSimilarityJobUseCase.submitJob(datasetId);
    }


    public void parseTextUploadFile(DataInfoUploadBO dataInfoUploadBO) {
        var userId = dataInfoUploadBO.getUserId();
        var datasetId = dataInfoUploadBO.getDatasetId();
        var files = FileUtil.loopFiles(Paths.get(dataInfoUploadBO.getBaseSavePath()), 10, textFileFilter);
        var rootPath = String.format("%s/%s", userId, datasetId);
        var errorBuilder = new StringBuilder();
        var dataInfoBOBuilder = DataInfoBO.builder().datasetId(datasetId).status(DataStatusEnum.VALID)
                .annotationStatus(DataAnnotationStatusEnum.NOT_ANNOTATED)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .createdBy(userId)
                .isDeleted(false);
        var totalDataNum = Long.valueOf(files.size());
        AtomicReference<Long> parsedDataNum = new AtomicReference<>(0L);
        var uploadRecordBOBuilder = UploadRecordBO.builder()
                .id(dataInfoUploadBO.getUploadRecordId()).totalDataNum(totalDataNum).parsedDataNum(parsedDataNum.get()).status(PARSING);
        if (CollectionUtil.isNotEmpty(files)) {
            CountDownLatch countDownLatch = new CountDownLatch(files.size());
            files.forEach(f -> parseExecutorService.submit(Objects.requireNonNull(TtlRunnable.get(() -> {
                try {
                    var dataInfoBOList = new ArrayList<DataInfoBO>();
                    var textJson = JSONUtil.readJSONArray(f, StandardCharsets.UTF_8);
                    var list = JSONUtil.toList(textJson.toString(), TextDataContentBO.class);
                    var pathList = this.getTreeAllPath(list);
                    if (CollUtil.isEmpty(pathList)) {
                        return;
                    }
                    var newTextFileList = new ArrayList<File>();
                    AtomicInteger i = new AtomicInteger(1);
                    pathList.forEach(path -> {
                        ListUtil.reverse(path);
                        var suffix = FileUtil.getSuffix(f);
                        var originalPath = f.getAbsolutePath();
                        var newPath = String.format("%s_%s.%s", StrUtil.removeSuffix(originalPath, String.format(".%s", suffix)), i.get(), suffix);
                        var file = FileUtil.writeString(JSONUtil.toJsonStr(path), newPath, StandardCharsets.UTF_8);
                        newTextFileList.add(file);
                        i.getAndIncrement();
                    });
                    var fileBOS = uploadFileList(rootPath, newTextFileList, dataInfoUploadBO);
                    createUploadThumbnail(userId, fileBOS, rootPath);
                    fileBOS.forEach(fileBO -> {
                        var tempDataId = ByteUtil.bytesToLong(SecureUtil.md5().digest(UUID.randomUUID().toString()));
                        var file = FileUtil.file(tempPath + fileBO.getPath().replace(rootPath, ""));
                        var fileNodeBO = DataInfoBO.FileNodeBO.builder().name(fileBO.getName())
                                .fileId(fileBO.getId()).type(FILE).build();
                        var dataInfoBO = dataInfoBOBuilder.name(getFileName(file)).content(Collections.singletonList(fileNodeBO)).splitType(NOT_SPLIT).tempDataId(tempDataId).build();
                        dataInfoBOList.add(dataInfoBO);
                    });
                    if (CollectionUtil.isNotEmpty(dataInfoBOList)) {
                        insertBatch(dataInfoBOList, datasetId, errorBuilder);
                    }
                } catch (Exception e) {
                    log.error("Handle data error", e);
                } finally {
                    parsedDataNum.set(parsedDataNum.get() + 1);
                    var uploadRecordBO = uploadRecordBOBuilder.parsedDataNum(parsedDataNum.get()).build();
                    uploadRecordDAO.updateById(DefaultConverter.convert(uploadRecordBO, UploadRecord.class));
                    countDownLatch.countDown();
                }

            }))));
            try {
                countDownLatch.await();
            } catch (InterruptedException e) {
                log.error("Parse image count down latch error", e);
            }
            var uploadRecordBO = uploadRecordBOBuilder.parsedDataNum(totalDataNum).errorMessage(errorBuilder.toString()).status(PARSE_COMPLETED).build();
            uploadRecordDAO.updateById(DefaultConverter.convert(uploadRecordBO, UploadRecord.class));
            datasetSimilarityJobUseCase.submitJob(datasetId);
        } else {
            var uploadRecordBO = uploadRecordBOBuilder.status(FAILED).errorMessage(COMPRESSED_PACKAGE_EMPTY.getMessage()).build();
            uploadRecordDAO.updateById(DefaultConverter.convert(uploadRecordBO, UploadRecord.class));
            log.error("Image compressed package is empty,dataset id:{},filePath:{}", datasetId, dataInfoUploadBO.getFileUrl());
        }
    }

    public void parseImageCompressedUploadFile(DataInfoUploadBO dataInfoUploadBO) {
        if (DataFormatEnum.COCO.equals(dataInfoUploadBO.getDataFormat())) {
            var respPath = cocoConvertToX1(dataInfoUploadBO);
            var apiResult = new ApiResult<>();
            if (!FileUtil.exist(respPath) || !(OK.equals((apiResult = DefaultConverter.convert(JSONUtil.readJSONObject(FileUtil.file(respPath), Charset.defaultCharset()), ApiResult.class)).getCode()))) {
                var uploadRecordBOBuilder = UploadRecordBO.builder()
                        .id(dataInfoUploadBO.getUploadRecordId());
                var uploadRecordBO = uploadRecordBOBuilder.status(FAILED).errorMessage(FileUtil.exist(respPath) ? apiResult.getMessage() : DATASET_DATA_FILE_FORMAT_ERROR.getMessage()).build();
                uploadRecordDAO.updateById(DefaultConverter.convert(uploadRecordBO, UploadRecord.class));
                FileUtil.del(respPath);
                return;
            }
            FileUtil.del(respPath);
        }
        var userId = dataInfoUploadBO.getUserId();
        var datasetId = dataInfoUploadBO.getDatasetId();
        var files = FileUtil.loopFiles(Paths.get(dataInfoUploadBO.getBaseSavePath()), 3, imageFileFilter);
        var rootPath = String.format("%s/%s", userId, datasetId);
        var dataAnnotationObjectBOBuilder = DataAnnotationObjectBO.builder()
                .datasetId(datasetId).createdBy(userId).createdAt(OffsetDateTime.now());
        var dataAnnotationObjectBOList = new ArrayList<DataAnnotationObjectBO>();
        var errorBuilder = new StringBuilder();
        var dataInfoBOBuilder = DataInfoBO.builder().datasetId(datasetId).status(DataStatusEnum.VALID)
                .annotationStatus(DataAnnotationStatusEnum.NOT_ANNOTATED)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .createdBy(userId)
                .isDeleted(false);
        var totalDataNum = Long.valueOf(files.size());
        AtomicReference<Long> parsedDataNum = new AtomicReference<>(0L);
        var uploadRecordBOBuilder = UploadRecordBO.builder()
                .id(dataInfoUploadBO.getUploadRecordId()).totalDataNum(totalDataNum).parsedDataNum(parsedDataNum.get()).status(PARSING);
        if (CollectionUtil.isNotEmpty(files)) {
            Long sourceId = null;
            if (ObjectUtil.isNotNull(dataInfoUploadBO.getResultType())) {
                sourceId = -1L;
                if (ResultTypeEnum.MODEL_RUN.equals(dataInfoUploadBO.getResultType())) {
                    sourceId = modelRunRecordUseCase.save(dataInfoUploadBO.getModelId(), datasetId, totalDataNum);
                }
            }
            dataAnnotationObjectBOBuilder.sourceId(sourceId).sourceType(DataAnnotationObjectSourceTypeEnum.IMPORTED);
            var list = ListUtil.split(files, 10);
            CountDownLatch countDownLatch = new CountDownLatch(list.size());
            list.forEach(fl -> parseExecutorService.submit(Objects.requireNonNull(TtlRunnable.get(() -> {
                try {
                    var dataInfoBOList = new ArrayList<DataInfoBO>();
                    var fileBOS = uploadFileList(rootPath, fl, dataInfoUploadBO);
                    createUploadThumbnail(userId, fileBOS, rootPath);
                    fileBOS.forEach(fileBO -> {
                        var tempDataId = ByteUtil.bytesToLong(SecureUtil.md5().digest(UUID.randomUUID().toString()));
                        var dataAnnotationObjectBO = dataAnnotationObjectBOBuilder.dataId(tempDataId).build();
                        var file = FileUtil.file(tempPath + fileBO.getPath().replace(rootPath, ""));
                        handleDataResult(file.getParentFile().getParentFile(), getFileName(file), dataAnnotationObjectBO, dataAnnotationObjectBOList, errorBuilder);
                        var fileNodeBO = DataInfoBO.FileNodeBO.builder().name(fileBO.getName())
                                .fileId(fileBO.getId()).type(FILE).build();
                        var dataInfoBO = dataInfoBOBuilder.name(getFileName(file)).content(Collections.singletonList(fileNodeBO)).splitType(NOT_SPLIT).tempDataId(tempDataId).build();
                        dataInfoBOList.add(dataInfoBO);
                    });
                    if (CollectionUtil.isNotEmpty(dataInfoBOList)) {
                        var resDataInfoList = insertBatch(dataInfoBOList, datasetId, errorBuilder);
                        saveBatchDataResult(resDataInfoList, dataAnnotationObjectBOList);
                    }
                } catch (Exception e) {
                    log.error("Handle data error", e);
                } finally {
                    parsedDataNum.set(parsedDataNum.get() + fl.size());
                    var uploadRecordBO = uploadRecordBOBuilder.parsedDataNum(parsedDataNum.get()).build();
                    uploadRecordDAO.updateById(DefaultConverter.convert(uploadRecordBO, UploadRecord.class));
                    countDownLatch.countDown();
                }

            }))));
            try {
                countDownLatch.await();
            } catch (InterruptedException e) {
                log.error("Parse image count down latch error", e);
            }
            var uploadRecordBO = uploadRecordBOBuilder.parsedDataNum(totalDataNum).errorMessage(errorBuilder.toString()).status(PARSE_COMPLETED).build();
            uploadRecordDAO.updateById(DefaultConverter.convert(uploadRecordBO, UploadRecord.class));
            if (ObjectUtil.isNotNull(sourceId) && ResultTypeEnum.MODEL_RUN.equals(dataInfoUploadBO.getResultType())) {
                modelRunRecordUseCase.updateById(sourceId, RunStatusEnum.SUCCESS);
            }
            datasetSimilarityJobUseCase.submitJob(datasetId);
        } else {
            var uploadRecordBO = uploadRecordBOBuilder.status(FAILED).errorMessage(COMPRESSED_PACKAGE_EMPTY.getMessage()).build();
            uploadRecordDAO.updateById(DefaultConverter.convert(uploadRecordBO, UploadRecord.class));
            log.error("Image compressed package is empty,dataset id:{},filePath:{}", datasetId, dataInfoUploadBO.getFileUrl());
        }
    }

    private String cocoConvertToX1(DataInfoUploadBO dataInfoUploadBO) {
        var fileName = FileUtil.getPrefix(dataInfoUploadBO.getSavePath());
        var baseSavePath = String.format("%s%s/", tempPath, IdUtil.fastSimpleUUID());
        String srcPath = dataInfoUploadBO.getBaseSavePath();
        String outPath = String.format("%s%s", baseSavePath, fileName);
        ProcessBuilder builder = new ProcessBuilder();
        var respPath = String.format("%s%s/resp.json", tempPath, IdUtil.fastSimpleUUID());
        DataFormatUtil.convert(Constants.CONVERT_UPLOAD, srcPath, outPath, respPath);
        dataInfoUploadBO.setBaseSavePath(baseSavePath);
        return respPath;
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
                .datasetId(dataPreAnnotationBO.getDatasetId()).createdBy(userId).serialNo(serialNo).build();
        try {
            dataAnnotationRecordDAO.save(dataAnnotationRecord);
        } catch (DuplicateKeyException duplicateKeyException) {
            boo = false;
            dataAnnotationRecord = dataAnnotationRecordDAO.getOne(lambdaQueryWrapper);
            var dataEditLambdaQueryWrapper = Wrappers.lambdaQuery(DataEdit.class);
            dataEditLambdaQueryWrapper.eq(DataEdit::getAnnotationRecordId, dataAnnotationRecord.getId());
            var list = dataEditDAO.list(dataEditLambdaQueryWrapper);
            var dataIds = list.stream().map(DataEdit::getDataId).collect(Collectors.toList());
            if (CollectionUtil.isNotEmpty(dataIds) && dataIds.contains(dataPreAnnotationBO.getDataIds().get(0)) && isFilterData) {
                return dataAnnotationRecord.getId();
            }
        }
        var dataIds = dataPreAnnotationBO.getDataIds();
        var insertCount = batchInsertDataEdit(dataIds, dataAnnotationRecord.getId(), dataPreAnnotationBO, userId);
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
     * @param dataIds              Data id collection
     * @param dataAnnotationRecord Data annotation record
     */
    private Integer batchInsertDataEdit(List<Long> dataIds, Long dataAnnotationRecordId, DataPreAnnotationBO dataAnnotationRecord, Long userId) {
        var insertCount = 0;
        if (CollectionUtil.isEmpty(dataIds)) {
            return insertCount;
        }
        var dataEditSubList = new ArrayList<DataEdit>();
        int i = 1;
        var dataEditBuilder = DataEdit.builder()
                .annotationRecordId(dataAnnotationRecordId)
                .datasetId(dataAnnotationRecord.getDatasetId())
                .modelId(dataAnnotationRecord.getModelId())
                .modelVersion(dataAnnotationRecord.getModelVersion())
                .createdBy(userId);
        for (var dataId : dataIds) {
            var dataEdit = dataEditBuilder.dataId(dataId).build();
            dataEditSubList.add(dataEdit);
            if ((i % BATCH_SIZE == 0) || i == dataIds.size()) {
                insertCount += dataEditDAO.getBaseMapper().insertIgnoreBatch(dataEditSubList);
                dataEditSubList.clear();
            }
            i++;
        }
        return insertCount;
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
        return lambdaQueryWrapper;
    }

    /**
     * Download the file and unzip the file
     *
     * @param dataInfoUploadBO Upload data parameter
     * @param function         function
     */
    private <T extends DataInfoUploadBO> void downloadAndDecompressionFile(T dataInfoUploadBO, Consumer<T> function) throws IOException {
        var fileUrl = URLUtil.decode(dataInfoUploadBO.getFileUrl());
        var datasetId = dataInfoUploadBO.getDatasetId();
        var path = DecompressionFileUtils.removeUrlParameter(fileUrl);
        dataInfoUploadBO.setFileName(FileUtil.getPrefix(path));
        var baseSavePath = String.format("%s%s/", tempPath, UUID.randomUUID().toString().replace("-", ""));
        var savePath = baseSavePath + FileUtil.getName(path);
        FileUtil.mkParentDirs(savePath);
        // Download the compressed package locally
        log.info("Get compressed package start fileUrl:{},savePath:{}", fileUrl, savePath);
        HttpUtil.downloadFileFromUrl(fileUrl, FileUtil.newFile(savePath), new StreamProgress() {
            @Override
            public void start() {
                uploadUseCase.updateUploadRecordStatus(dataInfoUploadBO.getUploadRecordId(), DOWNLOADING, null);
            }

            @Override
            public void progress(long total, long progressSize) {
                if (progressSize % PROCESS_VALUE_SIZE == 0 || total == progressSize) {
                    var uploadRecord = UploadRecord.builder()
                            .id(dataInfoUploadBO.getUploadRecordId())
                            .status(DOWNLOADING)
                            .totalFileSize(total)
                            .downloadedFileSize(progressSize).build();
                    uploadRecordDAO.updateById(uploadRecord);
                }
            }

            @Override
            public void finish() {
                uploadUseCase.updateUploadRecordStatus(dataInfoUploadBO.getUploadRecordId(), DOWNLOAD_COMPLETED, null);
            }
        });
        log.info("Get compressed package end fileUrl:{},savePath:{}", fileUrl, savePath);
        dataInfoUploadBO.setSavePath(savePath);
        dataInfoUploadBO.setBaseSavePath(baseSavePath);
        // A single image does not need to be decompressed
        if (IMAGE_DATA_TYPE.contains(FileUtil.getMimeType(path))) {
            function.accept(dataInfoUploadBO);
            FileUtil.clean(baseSavePath);
            return;
        }
        // Unzip files
        log.info("Start decompression,datasetId:{},filePath:{}", datasetId, savePath);
        DecompressionFileUtils.decompress(savePath, baseSavePath);
        function.accept(dataInfoUploadBO);
        FileUtil.clean(baseSavePath);
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
     * Find folders for all point clouds
     *
     * @param path           path
     * @param pointCloudList point clouds
     */
    private void findPointCloudList(String path, List<File> pointCloudList) {
        var file = new File(path);
        if (FileUtil.isDirectory(path)) {
            for (var f : Objects.requireNonNull(file.listFiles())) {
                getPointCloudFile(f, pointCloudList);
                if (f.isDirectory()) {
                    findPointCloudList(f.getAbsolutePath(), pointCloudList);
                }
            }
        }
    }

    /**
     * Obtain the name of the folder or file under the folder according to the fixed folder,
     * which is used to determine how much data there is in the compressed package
     *
     * @param file           file
     * @param pointCloudList point clouds
     */
    private void getPointCloudFile(File file, List<File> pointCloudList) {
        var fileName = file.getName();
        if (POINT_CLOUD.equals(fileName)) {
            pointCloudList.add(file);
        }
    }

    /**
     * Verify folder format
     * If type is LIDAR_FUSION type, the file directory must contain image,point_cloud,camera_config.
     * If type is LIDAR_BASIC, the file directory must contain  point_cloud
     *
     * @param pointCloudParentFile Point cloud parent file
     * @param type                 Dataset type
     */
    private boolean validDirectoryFormat(File pointCloudParentFile, DatasetTypeEnum type) {
        var dirNames = Arrays.stream(Objects.requireNonNull(pointCloudParentFile.listFiles()))
                .filter(File::isDirectory)
                .map(file -> {
                    var fileName = file.getName();
                    if (fileName.startsWith(POINT_CLOUD_IMG)) {
                        return POINT_CLOUD_IMG;
                    } else if (fileName.equals(POINT_CLOUD)) {
                        return POINT_CLOUD;
                    } else if (fileName.equals(CAMERA_CONFIG)) {
                        return CAMERA_CONFIG;
                    } else {
                        return fileName;
                    }
                })
                .collect(Collectors.toSet());

        var allMatchDirFormat = false;
        var missDirs = new HashSet<String>();
        if (type.equals(LIDAR_FUSION)) {
            var fusionDirNames = Sets.newHashSet(POINT_CLOUD_IMG, POINT_CLOUD, CAMERA_CONFIG);
            allMatchDirFormat = dirNames.containsAll(fusionDirNames);
            missDirs.addAll(Sets.difference(fusionDirNames, dirNames));
        } else if (type.equals(LIDAR_BASIC)) {
            var basicDirNames = Sets.newHashSet(POINT_CLOUD);
            allMatchDirFormat = dirNames.containsAll(basicDirNames);
            missDirs.addAll(Sets.difference(basicDirNames, dirNames));
        }
        if (!allMatchDirFormat) {
            log.error("Compressed file format is missing: {}", missDirs);
        }
        return !allMatchDirFormat;
    }

    /**
     * Get the name collection of data
     *
     * @param pointCloudParentFile Point cloud parent file
     * @param type                 Dataset type
     */
    private List<String> getDataNames(File pointCloudParentFile, DatasetTypeEnum type) {
        var dataNames = new LinkedHashSet<String>();
        for (var f : Objects.requireNonNull(pointCloudParentFile.listFiles())) {
            var boo = validateFileNameByType(f, type);
            if (boo) {
                var list = Arrays.stream(Objects.requireNonNull(f.listFiles())).filter(this::validateFileFormat).map(this::getFileName).collect(Collectors.toSet());
                dataNames.addAll(list);
            }
        }
        return dataNames.stream().sorted().collect(Collectors.toList());
    }

    /**
     * Get file name remove suffix
     *
     * @param file File or folder
     * @return File name
     */
    private String getFileName(File file) {
        var fileName = file.getName();
        if (FileUtil.isFile(file)) {
            fileName = fileName.substring(0, fileName.lastIndexOf("."));
        }
        return fileName;
    }

    /**
     * Find a file of data
     *
     * @param file     File
     * @param dataName Data name
     * @param type     Dataset type
     */
    private List<File> getDataFiles(File file, String dataName, DatasetTypeEnum type) {
        var dataFiles = new ArrayList<File>();
        var isErr = false;
        for (var f : Objects.requireNonNull(file.listFiles())) {
            var boo = validateFileNameByType(f, type);
            if (boo) {
                var fcList = Arrays.stream(Objects.requireNonNull(f.listFiles()))
                        .filter(fc -> (validateFileFormat(fc) && getFileName(fc).equals(dataName))).collect(Collectors.toList());
                var count = fcList.size();
                switch (count) {
                    case 0:
                        log.error("Missing files in {} folder,file name is {}", f.getName(), dataName);
                        isErr = true;
                        break;
                    case 1:
                        dataFiles.addAll(fcList);
                        break;
                    default:
                        log.error("There are duplicate files in {} folder,file name is {}", f.getName(), dataName);
                        isErr = true;
                }
            }
        }
        return isErr ? ListUtil.empty() : dataFiles;
    }

    /**
     * Process the annotation results corresponding to data
     *
     * @param file                       The image is the parent of data, and the point cloud file is point_cloud
     * @param dataName                   Data name
     * @param dataAnnotationObjectBO     Data annotation object
     * @param dataAnnotationObjectBOList Data annotation object list
     */
    public void handleDataResult(File file, String dataName, DataAnnotationObjectBO dataAnnotationObjectBO,
                                 List<DataAnnotationObjectBO> dataAnnotationObjectBOList, StringBuilder errorBuilder) {

        // Indicates that no result data was imported
        if (ObjectUtil.isNotNull(dataAnnotationObjectBO.getSourceId())) {
            var resultFile = FileUtil.loopFiles(file, 2, null).stream()
                    .filter(fc -> fc.getName().toUpperCase().endsWith(JSON_SUFFIX) && dataName.equals(FileUtil.getPrefix(fc))
                            && fc.getParentFile().getName().equalsIgnoreCase(RESULT)).findFirst();
            if (resultFile.isPresent()) {
                try {
                    var resultJson = JSONUtil.readJSON(resultFile.get(), Charset.defaultCharset());
                    var result = new DataImportResultBO();
                    if (resultJson instanceof JSONArray) {
                        var dataImportResultBOList = JSONUtil.toList(JSONUtil.toJsonStr(resultJson), DataImportResultBO.class);
                        var objects = new ArrayList<DataAnnotationResultObjectBO>();
                        dataImportResultBOList.stream().filter(dataImportResultBO -> CollUtil.isNotEmpty(dataImportResultBO.getObjects())).forEach(dataImportResultBO ->
                                objects.addAll(dataImportResultBO.getObjects()));
                        result.setObjects(objects);
                    } else {
                        result = JSONUtil.toBean(JSONUtil.toJsonStr(resultJson), DataImportResultBO.class);
                    }
                    if (CollectionUtil.isEmpty(result.getObjects())) {
                        log.error("Objects is empty，dataId:{},dataName:{}", dataAnnotationObjectBO.getDataId(), dataName);
                        errorBuilder.append(FileUtil.getPrefix(dataName)).append(".json the objects in the result file cannot be empty;");
                        return;
                    }

                    var classMap = getClassMap(dataAnnotationObjectBO.getDatasetId(), result.getObjects());
                    result.getObjects().forEach(object -> {
                        var insertDataAnnotationObjectBO = DefaultConverter.convert(dataAnnotationObjectBO, DataAnnotationObjectBO.class);
                        object.setId(IdUtil.fastSimpleUUID());
                        object.setVersion(0);
                        processClassAttributes(classMap, object);
                        Objects.requireNonNull(insertDataAnnotationObjectBO).setClassAttributes(JSONUtil.parseObj(object));
                        insertDataAnnotationObjectBO.setClassId(object.getClassId());
                        if (verifyDataResult(object, dataAnnotationObjectBO.getDataId(), dataName)) {
                            dataAnnotationObjectBOList.add(insertDataAnnotationObjectBO);
                        }
                    });
                } catch (Exception e) {
                    log.error("Handle result json error,userId:{},datasetId:{}", dataAnnotationObjectBO.getCreatedBy(), dataAnnotationObjectBO.getDatasetId(), e);
                }
            }
        }
    }

    private Map<Long, DatasetClassBO> getClassMap(Long datasetId, List<DataAnnotationResultObjectBO> objects) {
        if (CollUtil.isEmpty(objects)) {
            return new HashMap<>();
        }
        var classIds = objects.stream().map(DataAnnotationResultObjectBO::getClassId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        if (CollUtil.isEmpty(classIds)) {
            return new HashMap<>();
        }
        var datasetClassBOList = datasetClassUseCase.findByIds(datasetId, new ArrayList<>(classIds));
        if (CollUtil.isNotEmpty(datasetClassBOList)) {
            return datasetClassBOList.stream().collect(Collectors.toMap(DatasetClassBO::getId,
                    t -> t));
        }
        return Map.of();
    }

    private void processClassAttributes(Map<Long, DatasetClassBO> classMap,
                                        DataAnnotationResultObjectBO object) {
        if (object == null) {
            return;
        }
        var classId = object.getClassId();
        if (classMap.containsKey(classId)) {
            object.setClassId(classId);
            object.setClassName(classMap.get(classId).getName());
        } else {
            object.setClassId(null);
            object.setClassValues(null);
            if (StrUtil.isNotEmpty(object.getClassName())) {
                object.setModelClass(object.getClassName());
                object.setClassName(null);
            }
        }
    }

    /**
     * Assemble the content of a single frame
     *
     * @param dataFiles        Data composition file
     * @param rootPath         Root path
     * @param dataInfoUploadBO Compression package name
     * @return content
     */
    private List<DataInfoBO.FileNodeBO> assembleContent(List<File> dataFiles, String rootPath, DataInfoUploadBO dataInfoUploadBO) {
        var nodeList = new ArrayList<DataInfoBO.FileNodeBO>();
        var files = new ArrayList<File>();
        dataFiles.forEach(dataFile -> {
            var parentName = dataFile.getParentFile().getName();
            var node = DataInfoBO.FileNodeBO.builder()
                    .name(StrUtil.toCamelCase(parentName))
                    .type(DIRECTORY)
                    .files(getDirList(dataFile, rootPath, files)).build();
            nodeList.add(node);
        });
        var fileBOS = uploadFileList(rootPath, files, dataInfoUploadBO);
        createUploadThumbnail(dataInfoUploadBO.getUserId(), fileBOS, rootPath);
        fileBOS.forEach(fileBO -> {
            if (fileBO.getName().toUpperCase().endsWith(PCD_SUFFIX)) {
                handelPointCloudConvertRender(fileBO);
            }
        });
        var fileIdMap = fileBOS.stream().collect(Collectors.toMap(FileBO::getPathHash, FileBO::getId));
        replaceFileId(nodeList, fileIdMap);
        nodeList.sort(Comparator.comparing(DataInfoBO.FileNodeBO::getName));
        return nodeList;
    }

    private List<DataInfoBO.FileNodeBO> getDirList(File node, String rootPath, List<File> files) {
        List<DataInfoBO.FileNodeBO> nodeList = new ArrayList<>();
        if (node.isDirectory()) {
            for (File n : Objects.requireNonNull(node.listFiles())) {
                nodeList.add(getNode(n, rootPath, files));
            }
        } else {
            nodeList.add(getNode(node, rootPath, files));
        }
        return nodeList;
    }

    private DataInfoBO.FileNodeBO getNode(File node, String rootPath, List<File> files) {
        if (node.isDirectory()) {
            return DataInfoBO.FileNodeBO.builder()
                    .name(StrUtil.toCamelCase(node.getName()))
                    .type(DIRECTORY)
                    .files(getDirList(node, rootPath, files)).build();
        } else {
            var path = rootPath + FileUtil.getAbsolutePath(node.getAbsolutePath()).replace(FileUtil.getAbsolutePath(FileUtil.file(tempPath).getAbsolutePath()), "");
            var fileId = ByteUtil.bytesToLong(SecureUtil.md5().digest(path));
            files.add(node);
            return DataInfoBO.FileNodeBO.builder()
                    .name(node.getName())
                    .fileId(fileId)
                    .type(FILE).build();
        }
    }

    /**
     * Replace the fileId in content with the real fileId
     *
     * @param nodeList  File node list
     * @param fileIdMap File id map
     */
    private void replaceFileId(List<DataInfoBO.FileNodeBO> nodeList, Map<Long, Long> fileIdMap) {
        nodeList.forEach(fileNodeBO -> {
            if (fileNodeBO.getType().equals(FILE)) {
                fileNodeBO.setFileId(fileIdMap.get(fileNodeBO.getFileId()));
            } else if (fileNodeBO.getType().equals(DIRECTORY) && CollectionUtil.isNotEmpty(fileNodeBO.getFiles())) {
                replaceFileId(fileNodeBO.getFiles(), fileIdMap);
            }
        });
    }

    /**
     * Batch save data results
     *
     * @param dataInfoBOList             Data list
     * @param dataAnnotationObjectBOList Data annotation object list
     */
    public void saveBatchDataResult(List<DataInfoBO> dataInfoBOList, List<DataAnnotationObjectBO> dataAnnotationObjectBOList) {
        var dataIdMap = dataInfoBOList.stream()
                .collect(Collectors.toMap(DataInfoBO::getTempDataId, DataInfoBO::getId, (k1, k2) -> k1));
        if (CollectionUtil.isNotEmpty(dataAnnotationObjectBOList)) {
            var newDataAnnotationObjectBOList = dataAnnotationObjectBOList.stream().filter(d -> dataIdMap.containsKey(d.getDataId())).collect(Collectors.toList());
            if (CollUtil.isNotEmpty(newDataAnnotationObjectBOList)) {
                newDataAnnotationObjectBOList.forEach(d -> d.setDataId(dataIdMap.get(d.getDataId())));
                dataAnnotationObjectDAO.getBaseMapper().insertBatch(DefaultConverter.convert(dataAnnotationObjectBOList, DataAnnotationObject.class));
                newDataAnnotationObjectBOList.clear();
            }
            dataAnnotationObjectBOList.clear();
        }
    }

    /**
     * Batch upload files
     *
     * @param rootPath         Path prefix
     * @param files            File list
     * @param dataInfoUploadBO Data upload information
     * @return File information list
     */
    public List<FileBO> uploadFileList(String rootPath, List<File> files, DataInfoUploadBO dataInfoUploadBO) {
        var bucketName = minioProp.getBucketName();
        try {
            minioService.uploadFileList(bucketName, rootPath, tempPath, files);
        } catch (Exception e) {
            log.error("Batch upload file error,filesPath:{}", JSONUtil.parseArray(files.stream().map(File::getAbsolutePath).collect(Collectors.toList())), e);
        }

        var fileBOS = new ArrayList<FileBO>();
        files.forEach(file -> {
            var startingPosition = FileUtil.getAbsolutePath(FileUtil.file(dataInfoUploadBO.getBaseSavePath()).getAbsolutePath()).length() + 1;
            var zipPath = FileUtil.getAbsolutePath(file.getAbsolutePath()).substring(startingPosition);
            var path = String.format("%s%s", rootPath, FileUtil.getAbsolutePath(file.getAbsolutePath()).replace(FileUtil.getAbsolutePath(FileUtil.file(tempPath).getAbsolutePath()), ""));
            zipPath = zipPath.startsWith(dataInfoUploadBO.getFileName()) ? zipPath : String.format("%s/%s", dataInfoUploadBO.getFileName(), zipPath);
            var mimeType = FileUtil.getMimeType(path);
            var fileBO = FileBO.builder().name(file.getName()).originalName(file.getName()).bucketName(bucketName)
                    .size(file.length()).path(path).zipPath(zipPath).type(mimeType).build();
            if (Constants.IMAGE_DATA_TYPE.contains(mimeType)) {
                var imageExtraInfoBO = ImageExtraInfoBO.builder().height(Img.from(file).getImg().getHeight(null))
                        .width(Img.from(file).getImg().getWidth(null)).build();
                fileBO.setExtraInfo(JSONUtil.parseObj(imageExtraInfoBO));
            }
            fileBOS.add(fileBO);
        });
        return fileUseCase.saveBatchFile(dataInfoUploadBO.getUserId(), fileBOS);
    }


    /**
     * Verify that the file name is correct based on the dataset type
     *
     * @param file Zip file
     * @param type Dataset type
     * @return boolean
     */
    private boolean validateFileNameByType(File file, DatasetTypeEnum type) {
        var fileName = file.getName();
        var boo = false;
        if (type.equals(LIDAR_FUSION)) {
            boo = file.isDirectory() && (fileName.startsWith(POINT_CLOUD_IMG) || fileName.equals(POINT_CLOUD) || fileName.equals(CAMERA_CONFIG));
        } else if (type.equals(DatasetTypeEnum.LIDAR_BASIC)) {
            boo = file.isDirectory() && fileName.equals(POINT_CLOUD);
        }
        return boo;
    }

    /**
     * Verify that the file format is correct
     *
     * @param file file
     * @return Is the file format correct
     */
    private boolean validateFileFormat(File file) {
        var boo = false;
        var mimeType = FileUtil.getMimeType(file.getAbsolutePath());
        var fileName = file.getName();
        if (DATA_TYPE.contains(mimeType) || fileName.toUpperCase().endsWith(PCD_SUFFIX) ||
                fileName.toUpperCase().endsWith(JSON_SUFFIX)) {
            boo = true;
        }
        return boo;
    }

    /**
     * Data process
     *
     * @param dataList Data list
     * @param queryBO  Data query parameters
     * @param classMap Class id and class name associated map
     * @param classMap Result id and result name associated map
     * @return Data export collection
     */
    public List<DataExportBO> processData(List<DataInfoBO> dataList, DataInfoQueryBO queryBO, Map<Long, String> classMap, Map<Long, String> resultMap) {
        if (CollectionUtil.isEmpty(dataList)) {
            return List.of();
        }
        var dataInfoExportBOList = new ArrayList<DataExportBO>();
        var dataIds = dataList.stream().map(DataInfoBO::getId).collect(Collectors.toList());
        var dataAnnotationList = dataAnnotationClassificationUseCase.findByDataIds(dataIds);
        Map<Long, List<DataAnnotationClassificationBO>> dataAnnotationMap = CollectionUtil.isNotEmpty(dataAnnotationList) ? dataAnnotationList.stream().collect(
                Collectors.groupingBy(DataAnnotationClassificationBO::getDataId)) : Map.of();
        var dataAnnotationObjectList = dataAnnotationObjectUseCase.findByDataIds(dataIds, queryBO.getIsAllResult(), queryBO.getSelectModelRunIds());
        Map<Long, List<DataAnnotationObjectBO>> dataAnnotationObjectMap = CollectionUtil.isNotEmpty(dataAnnotationObjectList) ?
                dataAnnotationObjectList.stream().collect(Collectors.groupingBy(DataAnnotationObjectBO::getDataId))
                : Map.of();
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
                            var classificationAttributes = annotationList.stream().map(dataAnnotationBO -> dataAnnotationBO.getClassificationAttributes()).collect(Collectors.toList());
                            dataResultExportBO.setClassificationValues(JSONUtil.parseArray(classificationAttributes));
                        }
                    }
                    dataResultExportBOList.add(dataResultExportBO);
                });

            }
            var dataInfoExportBO = DataExportBO.builder().data(dataExportBaseBO).build();
            if (CollectionUtil.isNotEmpty(annotationList) || CollectionUtil.isNotEmpty(objectList)) {
                dataInfoExportBO.setResult(dataResultExportBOList);
            }
            dataInfoExportBOList.add(dataInfoExportBO);
        });
        return dataInfoExportBOList;
    }

    /**
     * Assemble the export data content
     *
     * @return data information
     */
    private DataExportBaseBO assembleExportDataContent(DataInfoBO dataInfoBO, DatasetTypeEnum datasetType) {
        DataExportBaseBO dataExportBaseBO = new DataExportBaseBO();
        dataExportBaseBO.setId(dataInfoBO.getId());
        dataExportBaseBO.setName(dataInfoBO.getName());
        dataExportBaseBO.setType(datasetType.name());
        dataExportBaseBO.setVersion(version);
        String pointCloudUrl = null;
        String pointCloudZipPath = null;
        String cameraConfigUrl = null;
        String cameraConfigZipPath = null;
        String textUrl = null;
        String textZipPath = null;
        var images = new ArrayList<LidarFusionDataExportBO.LidarFusionImageBO>();
        for (DataInfoBO.FileNodeBO f : dataInfoBO.getContent()) {
            var relationFileBO = FILE.equals(f.getType()) ? f.getFile() : CollectionUtil.getFirst(f.getFiles()).getFile();
            if (f.getName().equals(StrUtil.toCamelCase(POINT_CLOUD))) {
                pointCloudUrl = relationFileBO.getUrl();
                pointCloudZipPath = relationFileBO.getZipPath();
            } else if (f.getName().equals(StrUtil.toCamelCase(CAMERA_CONFIG))) {
                cameraConfigUrl = relationFileBO.getUrl();
                cameraConfigZipPath = relationFileBO.getZipPath();
            } else if (f.getName().toUpperCase().endsWith(JSON_SUFFIX) && TEXT.equals(datasetType)) {
                textUrl = relationFileBO.getUrl();
                textZipPath = relationFileBO.getZipPath();
            } else {
                var url = relationFileBO.getUrl();
                var zipPath = relationFileBO.getZipPath();
                var lidarFusionImageBO = DefaultConverter.convert(relationFileBO.getExtraInfo(), LidarFusionDataExportBO.LidarFusionImageBO.class);
                lidarFusionImageBO = ObjectUtil.isNull(lidarFusionImageBO) ? new LidarFusionDataExportBO.LidarFusionImageBO() : lidarFusionImageBO;
                lidarFusionImageBO.setUrl(url);
                lidarFusionImageBO.setZipPath(zipPath);
                lidarFusionImageBO.setFilePath(relationFileBO.getPath());
                images.add(lidarFusionImageBO);
            }
        }
        switch (datasetType) {
            case LIDAR_FUSION:
                dataExportBaseBO = DefaultConverter.convert(dataExportBaseBO, LidarFusionDataExportBO.class);
                ((LidarFusionDataExportBO) dataExportBaseBO).setPointCloudUrl(pointCloudUrl);
                ((LidarFusionDataExportBO) dataExportBaseBO).setPointCloudZipPath(pointCloudZipPath);
                ((LidarFusionDataExportBO) dataExportBaseBO).setCameraConfigUrl(cameraConfigUrl);
                ((LidarFusionDataExportBO) dataExportBaseBO).setCameraConfigZipPath(cameraConfigZipPath);
                ((LidarFusionDataExportBO) dataExportBaseBO).setCameraImages(images);
                break;
            case LIDAR_BASIC:
                dataExportBaseBO = DefaultConverter.convert(dataExportBaseBO, LidarBasicDataExportBO.class);
                ((LidarBasicDataExportBO) dataExportBaseBO).setPointCloudUrl(pointCloudUrl);
                ((LidarBasicDataExportBO) dataExportBaseBO).setPointCloudZipPath(pointCloudZipPath);
                break;
            case IMAGE:
                dataExportBaseBO = DefaultConverter.convert(dataExportBaseBO, ImageDataExportBO.class);
                var image = CollectionUtil.getFirst(images);
                ((ImageDataExportBO) dataExportBaseBO).setImageUrl(image.getUrl());
                ((ImageDataExportBO) dataExportBaseBO).setImageZipPath(image.getZipPath());
                ((ImageDataExportBO) dataExportBaseBO).setWidth(image.getWidth());
                ((ImageDataExportBO) dataExportBaseBO).setHeight(image.getHeight());
                ((ImageDataExportBO) dataExportBaseBO).setFilePath(image.getFilePath());
                break;
            case TEXT:
                dataExportBaseBO = DefaultConverter.convert(dataExportBaseBO, TextDataExportBO.class);
                ((TextDataExportBO) dataExportBaseBO).setTextUrl(textUrl);
                ((TextDataExportBO) dataExportBaseBO).setTextZipPath(textZipPath);
                break;
            default:
                break;
        }
        return dataExportBaseBO;
    }

    /**
     * Generate thumbnail and upload
     *
     * @param userId   User id
     * @param fileBOS  File collection
     * @param rootPath Root path
     */
    private void createUploadThumbnail(Long userId, List<FileBO> fileBOS, String rootPath) {
        try {
            var thumbnailFileBOS = new ArrayList<FileBO>();
            var files = new ArrayList<File>();
            for (FileBO fileBO : fileBOS) {
                var mimeType = fileBO.getType();
                var savePath = tempPath + fileBO.getPath().replace(rootPath, "");
                if (IMAGE_DATA_TYPE.contains(mimeType)) {
                    var filePath = fileBO.getPath();
                    var basePath = filePath.substring(0, filePath.lastIndexOf(SLANTING_BAR) + 1);
                    var fileName = filePath.substring(filePath.lastIndexOf(SLANTING_BAR) + 1);
                    var fileBOBuilder = FileBO.builder().name(fileBO.getName()).originalName(fileBO.getName())
                            .bucketName(fileBO.getBucketName()).type(mimeType);
                    var file = FileUtil.file(savePath);
                    var baseSavePath = file.getParentFile().getAbsolutePath();
                    var largeFile = FileUtil.file(baseSavePath, String.format("%s/%s", large, fileName));
                    var mediumFile = FileUtil.file(baseSavePath, String.format("%s/%s", medium, fileName));
                    var smallFile = FileUtil.file(baseSavePath, String.format("%s/%s", small, fileName));
                    Thumbnails.of(file).size(largeFileSize, largeFileSize).toFile(largeFile);
                    Thumbnails.of(file).size(mediumFileSize, mediumFileSize).toFile(mediumFile);
                    Thumbnails.of(file).size(smallFileSize, smallFileSize).toFile(smallFile);
                    // large thumbnail
                    var largePath = String.format("%s%s/%s", basePath, large, fileName);
                    var largeFileBO = fileBOBuilder.path(largePath).relation(LARGE_THUMBTHUMBNAIL).relationId(fileBO.getId()).build();
                    // medium thumbnail
                    var mediumPath = String.format("%s%s/%s", basePath, medium, fileName);
                    var mediumFileBO = fileBOBuilder.path(mediumPath).relation(MEDIUM_THUMBTHUMBNAIL).relationId(fileBO.getId()).build();
                    // small thumbnail
                    var smallPath = String.format("%s%s/%s", basePath, small, fileName);
                    var smallFileBO = fileBOBuilder.path(smallPath).relation(SMALL_THUMBTHUMBNAIL).relationId(fileBO.getId()).build();
                    thumbnailFileBOS.addAll(ListUtil.toList(largeFileBO, mediumFileBO, smallFileBO));
                    files.addAll(ListUtil.toList(largeFile, mediumFile, smallFile));
                }
            }
            try {
                minioService.uploadFileList(minioProp.getBucketName(), rootPath, tempPath, files);
            } catch (Exception e) {
                log.error("Batch upload file error,filesPath:{}", JSONUtil.parseArray(files.stream().map(File::getAbsolutePath).collect(Collectors.toList())), e);
            }
            fileUseCase.saveBatchFile(userId, thumbnailFileBOS);
        } catch (IOException e) {
            log.error("Upload thumbnail error", e);
        }
    }


    public void handelPointCloudConvertRender(FileBO pcdFileBO) {
        String filePath = pcdFileBO.getPath();
        String basePath = "";
        String fileName;
        String binaryFileName = "";
        String imageFileName = "";
        if (filePath.contains(Constants.SLANTING_BAR)) {
            basePath = filePath.substring(0, filePath.lastIndexOf(Constants.SLANTING_BAR) + 1);
            fileName = filePath.substring(filePath.lastIndexOf(Constants.SLANTING_BAR) + 1);
            binaryFileName = "binary-" + fileName;
            imageFileName = "render-" + UUID.randomUUID().toString() + ".png";
        }

        String binaryPath = String.format("%s%s", basePath, binaryFileName);
        String imagePath = String.format("%s%s", basePath, imageFileName);
        PresignedUrlBO binaryPreSignUrlBO;
        PresignedUrlBO imagePreSignUrlBO;
        try {
            binaryPreSignUrlBO = minioService.generatePresignedUrl(pcdFileBO.getBucketName(), binaryPath, Boolean.FALSE);
            imagePreSignUrlBO = minioService.generatePresignedUrl(pcdFileBO.getBucketName(), imagePath, Boolean.FALSE);

        } catch (Throwable throwable) {
            log.error("generate preSignUrl error!", throwable);
            return;
        }
        List<PointCloudCRRespDTO> pointCloudCRRespDTOS = callPointCloudConvertRender(pcdFileBO, binaryPreSignUrlBO, imagePreSignUrlBO);
        if (CollUtil.isNotEmpty(pointCloudCRRespDTOS)) {
            for (PointCloudCRRespDTO pointCloudCRRespDTO : pointCloudCRRespDTOS) {
                if (pointCloudCRRespDTO.getCode() == 0) {
                    FileBO binaryPcdFile = FileBO.builder().name(binaryFileName)
                            .originalName(binaryFileName)
                            .path(binaryPath)
                            .type(pcdFileBO.getType())
                            .size(pointCloudCRRespDTO.getBinaryPcdSize())
                            .bucketName(pcdFileBO.getBucketName())
                            .createdAt(OffsetDateTime.now())
                            .createdBy(pcdFileBO.getCreatedBy())
                            .relation(RelationEnum.BINARY)
                            .relationId(pcdFileBO.getId())
                            .pathHash(ByteUtil.bytesToLong(SecureUtil.md5().digest(binaryPath))).build();
                    FileBO imageFile = FileBO.builder().name(imageFileName)
                            .originalName(imageFileName)
                            .path(imagePath)
                            .type(FileUtil.getMimeType(imageFileName))
                            .size(pointCloudCRRespDTO.getImageSize())
                            .bucketName(pcdFileBO.getBucketName())
                            .createdAt(OffsetDateTime.now())
                            .createdBy(pcdFileBO.getCreatedBy())
                            .relation(RelationEnum.POINT_CLOUD_RENDER_IMAGE)
                            .relationId(pcdFileBO.getId())
                            .pathHash(ByteUtil.bytesToLong(SecureUtil.md5().digest(imagePath)))
                            .extraInfo(JSONUtil.parseObj(pointCloudCRRespDTO.getPointCloudRange())
                                    .set("width", PC_RENDER_IMAGE_WIDTH)
                                    .set("height", PC_RENDER_IMAGE_HEIGHT))
                            .build();
                    fileUseCase.saveBatchFile(pcdFileBO.getCreatedBy(), List.of(binaryPcdFile, imageFile));
                }
            }
        }
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
                        dataAnnotationObjectUseCase::findDataIdByScenarioPage,
                        this::processScenarioData))));
        return serialNumber;
    }


    public List<DataExportBO> processScenarioData(List<DataAnnotationObjectBO> dataAnnotationObjectBOList, ScenarioQueryBO queryBO, Map<Long, String> classMap, Map<Long, String> resultMap) {
        if (CollectionUtil.isEmpty(dataAnnotationObjectBOList)) {
            return List.of();
        }
        var dataInfoExportBOList = new ArrayList<DataExportBO>();
        var dataIds = dataAnnotationObjectBOList.stream().map(DataAnnotationObjectBO::getDataId).collect(Collectors.toList());
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

    private List<PointCloudCRRespDTO> callPointCloudConvertRender(FileBO relationFileBO, PresignedUrlBO binaryPreSignUrlBO, PresignedUrlBO imagePreSignUrlBO) {
        PointCloudCRReqDTO pointCloudCRReqDTO = PointCloudCRReqDTO.builder()
                .data(List.of(buildPointCloutFileInfo(relationFileBO, binaryPreSignUrlBO, imagePreSignUrlBO)))
                .type(1)
                .renderParam(buildRenderParam())
                .convertParam(ConvertParam.builder().extraFields(Arrays.asList("rgb")).build()).build();
        ApiResult<List<PointCloudCRRespDTO>> apiResult = null;

        StopWatch stopWatch = new StopWatch();
        int count = 0;
        while (count <= RETRY_COUNT && ObjectUtil.isNull(apiResult)) {
            try {
                stopWatch.start();
                apiResult = pointCloudConvertRenderHttpCaller.callConvertRender(pointCloudCRReqDTO);
                stopWatch.stop();
                log.info("call pointCloudConvertRender took:{},req:{},resp:{}", stopWatch.getLastTaskTimeMillis(), JSONUtil.toJsonStr(pointCloudCRReqDTO), JSONUtil.toJsonStr(apiResult));
                break;
            } catch (Throwable throwable) {
                if (stopWatch.isRunning()) {
                    stopWatch.stop();
                }
                log.error("call pointCloudConvertRender service error! req:{}, resp:{}", JSONUtil.toJsonStr(pointCloudCRReqDTO), JSONUtil.toJsonStr(apiResult), throwable);
            }
            count++;
        }
        if (ObjectUtil.isNull(apiResult) || apiResult.getCode() != UsecaseCode.OK) {
            return null;
        }
        return apiResult.getData();
    }

    private PointCloudFileInfo buildPointCloutFileInfo(FileBO fileBO, PresignedUrlBO binaryPreSignUrlBO, PresignedUrlBO imagePreSignUrlBO) {
        PointCloudFileInfo pointCloudFileInfo = PointCloudFileInfo.builder().pointCloudFile(fileBO.getInternalUrl())
                .uploadBinaryPcdPath(binaryPreSignUrlBO.getPresignedUrl())
                .uploadImagePath(imagePreSignUrlBO.getPresignedUrl())
                .build();
        return pointCloudFileInfo;

    }

    private RenderParam buildRenderParam() {
        return RenderParam.builder().colors(List.of(6313414l, 3640543l, 1886145l, 3402883l, 8385883l))
                .zRange(null)
                .width(PC_RENDER_IMAGE_WIDTH)
                .height(PC_RENDER_IMAGE_HEIGHT)
                .numStd(3).build();
    }

    private Boolean verifyDataResult(DataAnnotationResultObjectBO dataAnnotationResultObjectBO, Long dataId, String dataName) {
        var boo = true;
        var types = List.of(ObjectTypeEnum.RECTANGLE.getValue(),
                ObjectTypeEnum.TWO_D_BOX.getValue(), ObjectTypeEnum.THREE_D_BOX.getValue(), ObjectTypeEnum.TWO_RECT.getValue(),
                ObjectTypeEnum.POLYLINE.getValue(), ObjectTypeEnum.POLYGON.getValue(), ObjectTypeEnum.THREE_D_SEGMENT_POINTS.getValue());
        if (!types.contains(dataAnnotationResultObjectBO.getType())) {
            log.error("Object type error，dataId:{},dataName:{}", dataId, dataName);
            boo = false;
        } else if (ObjectUtil.isNull(dataAnnotationResultObjectBO.getContour())) {
            log.error("Contour miss，dataId:{},dataName:{}", dataId, dataName);
            boo = false;
        }
        return boo;
    }

    public DataResultBO getDataAndResult(Long datasetId, List<Long> dataIds) {
        var dataset = datasetDAO.getById(datasetId);
        if (ObjectUtil.isNull(dataset)) {
            throw new UsecaseException(DATASET_NOT_FOUND);
        }
        var lambdaQueryWrapper = Wrappers.lambdaQuery(DataInfo.class);
        lambdaQueryWrapper.eq(DataInfo::getDatasetId, datasetId);
        if (CollectionUtil.isNotEmpty(dataIds)) {
            lambdaQueryWrapper.in(DataInfo::getId, dataIds);
        }
        var dataInfoBOList = DefaultConverter.convert(dataInfoDAO.list(lambdaQueryWrapper), DataInfoBO.class);
        if (CollectionUtil.isNotEmpty(dataInfoBOList)) {
            setDataInfoBOListFile(dataInfoBOList);
        }
        var dataInfoQueryBO = DataInfoQueryBO.builder().datasetType(dataset.getType()).build();
        var datasetClassBOList = datasetClassUseCase.findAll(datasetId);
        var classMap = new HashMap<Long, String>();
        if (CollectionUtil.isNotEmpty(datasetClassBOList)) {
            classMap.putAll(datasetClassBOList.stream().collect(Collectors.toMap(DatasetClassBO::getId, DatasetClassBO::getName)));
        }

        var resultMap = this.getResultMap(datasetId);
        dataInfoQueryBO.setIsAllResult(true);
        var dataExportBOList = processData(dataInfoBOList, dataInfoQueryBO, classMap, resultMap);
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

    /**
     * Get all paths in the tree list
     *
     * @param list tree list
     * @return
     */
    private List<List<TextDataContentBO>> getTreeAllPath(List<TextDataContentBO> list) {
        list = list.stream().filter(t -> StrUtil.isNotEmpty(t.getId()) && StrUtil.isNotEmpty(t.getRole()) && StrUtil.isNotEmpty(t.getText())).collect(Collectors.toList());
        if (CollUtil.isEmpty(list)) {
            return List.of();
        }
        // convert to tree
        List<Tree<String>> treeNodes = TreeUtil.build(list, null,
                (treeNode, tree) -> {
                    tree.setId(treeNode.getId());
                    tree.setParentId(treeNode.getParentId());
                    tree.setName(treeNode.getId());
                    // Extended properties ...
                    tree.putExtra("text", treeNode.getText());
                    tree.putExtra("role", treeNode.getRole());
                });

        var leafNodeList = new ArrayList<Tree<String>>();
        getLeafNodeList(treeNodes, leafNodeList);
        // get all links
        List<List<TextDataContentBO>> paths = new ArrayList<>();
        for (Tree<String> treeNode : leafNodeList) {
            List<TextDataContentBO> path = new ArrayList<>();
            path.add(DefaultConverter.convert(treeNode, TextDataContentBO.class));
            Tree<String> parent = treeNode.getParent();
            while (parent != null) {
                if (ObjectUtil.isNotNull(parent.getId())) {
                    path.add(DefaultConverter.convert(parent, TextDataContentBO.class));
                }
                parent = parent.getParent();
            }
            paths.add(path);
        }
        return paths;
    }

    /**
     * Get all leaf nodes under the tree
     *
     * @param treeNodes    tree node
     * @param leafNodeList collection of leaf nodes
     */
    private void getLeafNodeList(List<Tree<String>> treeNodes, List<Tree<String>> leafNodeList) {
        treeNodes.forEach(tree -> {
            if (CollUtil.isNotEmpty(tree.getChildren())) {
                getLeafNodeList(tree.getChildren(), leafNodeList);
            } else {
                leafNodeList.add(tree);
            }
        });
    }
}
