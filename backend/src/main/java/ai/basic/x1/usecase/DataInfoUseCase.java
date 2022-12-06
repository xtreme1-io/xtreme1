package ai.basic.x1.usecase;

import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.port.dao.*;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataInfo;
import ai.basic.x1.adapter.port.dao.mybatis.model.*;
import ai.basic.x1.adapter.port.minio.MinioProp;
import ai.basic.x1.adapter.port.minio.MinioService;
import ai.basic.x1.adapter.port.rpc.PointCloudConvertRenderHttpCaller;
import ai.basic.x1.adapter.port.rpc.dto.*;
import ai.basic.x1.entity.*;
import ai.basic.x1.entity.enums.*;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.Constants;
import ai.basic.x1.util.DecompressionFileUtils;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.collection.ListUtil;
import cn.hutool.core.date.DatePattern;
import cn.hutool.core.date.StopWatch;
import cn.hutool.core.date.TemporalAccessorUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.io.StreamProgress;
import cn.hutool.core.lang.UUID;
import cn.hutool.core.thread.ThreadUtil;
import cn.hutool.core.util.*;
import cn.hutool.crypto.SecureUtil;
import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.alibaba.ttl.TtlRunnable;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.google.common.collect.Sets;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Paths;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;
import java.util.stream.Collectors;

import static ai.basic.x1.entity.enums.DataUploadSourceEnum.LOCAL;
import static ai.basic.x1.entity.enums.DatasetTypeEnum.*;
import static ai.basic.x1.entity.enums.RelationEnum.*;
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
    private DataAnnotationUseCase dataAnnotationUseCase;

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

    @Value("${file.tempPath:/tmp/x1/}")
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
    /**
     * Filter out files whose file suffix is not image, and discard the file when it returns false
     */
    private final FileFilter filefilter = file -> {
        //if the file extension is image return true, else false
        return IMAGE_DATA_TYPE.contains(FileUtil.getMimeType(file.getAbsolutePath()));
    };

    /**
     * Batch delete
     *
     * @param ids Data id collection
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteBatch(List<Long> ids) {
        var count = dataEditDAO.count(Wrappers.lambdaQuery(DataEdit.class).in(DataEdit::getDataId, ids));
        if (count > 0) {
            throw new UsecaseException(UsecaseCode.DATASET_DATA_OTHERS_ANNOTATING);
        }
        var dataInfoLambdaUpdateWrapper = Wrappers.lambdaUpdate(DataInfo.class);
        dataInfoLambdaUpdateWrapper.in(DataInfo::getId, ids);
        dataInfoLambdaUpdateWrapper.set(DataInfo::getIsDeleted, true);
        dataInfoDAO.update(dataInfoLambdaUpdateWrapper);
    }

    /**
     * Paging query dataInfo
     *
     * @param queryBO Query parameter object
     * @return DataInfo page
     */
    public Page<DataInfoBO> findByPage(DataInfoQueryBO queryBO) {
        var lambdaQueryWrapper = Wrappers.lambdaQuery(DataInfo.class);
        lambdaQueryWrapper.eq(DataInfo::getDatasetId, queryBO.getDatasetId());
        lambdaQueryWrapper.eq(DataInfo::getIsDeleted, false);
        if (StrUtil.isNotBlank(queryBO.getName())) {
            lambdaQueryWrapper.like(DataInfo::getName, queryBO.getName());
        }
        if (ObjectUtil.isNotNull(queryBO.getAnnotationStatus())) {
            lambdaQueryWrapper.eq(DataInfo::getAnnotationStatus, queryBO.getAnnotationStatus());
        }
        if (ObjectUtil.isNotEmpty(queryBO.getCreateStartTime()) && ObjectUtil.isNotEmpty(queryBO.getCreateEndTime())) {
            lambdaQueryWrapper.ge(DataInfo::getCreatedAt, queryBO.getCreateStartTime()).le(DataInfo::getCreatedAt, queryBO.getCreateEndTime());
        }
        if (StrUtil.isNotBlank(queryBO.getSortField())) {
            lambdaQueryWrapper.last(" order by " + queryBO.getSortField().toLowerCase() + " " + queryBO.getAscOrDesc());
        }
        var dataInfoPage = dataInfoDAO.page(new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(queryBO.getPageNo(), queryBO.getPageSize()), lambdaQueryWrapper);
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
     * @param ids id collection
     * @return Collection of data objects
     */
    public List<DataInfoBO> listByIds(List<Long> ids) {
        var dataInfoBOList = DefaultConverter.convert(dataInfoDAO.listByIds(ids), DataInfoBO.class);
        if (CollectionUtil.isNotEmpty(dataInfoBOList)) {
            setDataInfoBOListFile(dataInfoBOList);
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
            return minioService.generatePresignedUrl(minioProp.getBucketName(), objectName);
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
    public List<DataInfoBO> insertBatch(List<DataInfoBO> dataInfoBOList) {
        List<DataInfo> infos = DefaultConverter.convert(dataInfoBOList, DataInfo.class);
        dataInfoDAO.getBaseMapper().insertBatch(infos);
        return DefaultConverter.convert(infos, DataInfoBO.class);
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
                    downloadAndDecompressionFile(dataInfoUploadBO, this::parseImageUploadFile);
                } else if (IMAGE.equals(dataset.getType()) && COMPRESSED_DATA_TYPE.contains(mimeType)) {
                    downloadAndDecompressionFile(dataInfoUploadBO, this::parseImageCompressedUploadFile);
                } else {
                    downloadAndDecompressionFile(dataInfoUploadBO, this::parsePointCloudUploadFile);
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
        executorService.execute(Objects.requireNonNull(TtlRunnable.get(() -> exportUseCase.asyncExportDataZip(fileName, serialNumber, dataInfoQueryBO))));
        return serialNumber;
    }

    public void parsePointCloudUploadFile(DataInfoUploadBO dataInfoUploadBO) {
        var errorBuilder = new StringBuilder();
        var datasetId = dataInfoUploadBO.getDatasetId();
        var userId = dataInfoUploadBO.getUserId();
        var datasetType = dataInfoUploadBO.getType();
        var pointCloudList = new ArrayList<File>();
        findPointCloudList(dataInfoUploadBO.getBaseSavePath(), pointCloudList);
        var rootPath = String.format("%s/%s/", userId, datasetId);
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
            var dataAnnotationObjectBOBuilder = DataAnnotationObjectBO.builder()
                    .datasetId(datasetId).createdBy(userId).createdAt(OffsetDateTime.now());
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
                            var fileNodeList = assembleContent(userId, dataFiles, rootPath);
                            log.info("Get data content,frameName:{},content:{} ", dataName, JSONUtil.toJsonStr(fileNodeList));
                            var dataInfoBO = dataInfoBOBuilder.name(dataName).content(fileNodeList).tempDataId(tempDataId).build();
                            dataInfoBOList.add(dataInfoBO);
                        }
                    });
                    if (CollectionUtil.isNotEmpty(dataInfoBOList)) {
                        var resDataInfoList = insertBatch(dataInfoBOList);
                        saveBatchDataResult(resDataInfoList, dataAnnotationObjectBOList);
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
        var fileUrl = DecompressionFileUtils.removeUrlParameter(dataInfoUploadBO.getFileUrl());
        var path = fileUrl.replace(minioProp.getEndpoint(), "").replace(minioProp.getBucketName() + "/", "");
        var fileBO = FileBO.builder().name(file.getName()).originalName(file.getName()).bucketName(minioProp.getBucketName())
                .size(file.length()).path(path).type(FileUtil.getMimeType(path)).build();
        var fileBOS = fileUseCase.saveBatchFile(userId, Collections.singletonList(fileBO));
        var fileNodeBO = DataInfoBO.FileNodeBO.builder().name(fileBO.getName())
                .fileId(CollectionUtil.getFirst(fileBOS).getId()).type(FILE).build();
        var dataInfoBO = dataInfoBOBuilder.name(getFileName(file))
                .content(Collections.singletonList(fileNodeBO)).build();
        dataInfoDAO.save(DefaultConverter.convert(dataInfoBO, DataInfo.class));
        var rootPath = String.format("%s/%s/", userId, datasetId);
        var newSavePath = tempPath + fileBO.getPath().replace(rootPath, "");
        FileUtil.copy(dataInfoUploadBO.getSavePath(), newSavePath, true);
        createUploadThumbnail(userId, fileBOS, rootPath);
        FileUtil.clean(newSavePath);
        var uploadRecordBO = UploadRecordBO.builder()
                .id(dataInfoUploadBO.getUploadRecordId()).totalDataNum(1L).parsedDataNum(1L).status(PARSE_COMPLETED).build();
        uploadRecordDAO.updateById(DefaultConverter.convert(uploadRecordBO, UploadRecord.class));
    }

    private void parseImageCompressedUploadFile(DataInfoUploadBO dataInfoUploadBO) {
        var userId = dataInfoUploadBO.getUserId();
        var datasetId = dataInfoUploadBO.getDatasetId();
        var files = FileUtil.loopFiles(Paths.get(dataInfoUploadBO.getBaseSavePath()), 2, filefilter);
        var rootPath = String.format("%s/%s/", userId, datasetId);
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
            var list = ListUtil.split(files, 10);
            CountDownLatch countDownLatch = new CountDownLatch(list.size());
            list.forEach(fl -> parseExecutorService.submit(Objects.requireNonNull(TtlRunnable.get(() -> {
                try {
                    var dataInfoBOList = new ArrayList<DataInfoBO>();
                    var fileBOS = uploadFileList(userId, rootPath, tempPath, fl);
                    createUploadThumbnail(userId, fileBOS, rootPath);
                    fileBOS.forEach(fileBO -> {
                        var tempDataId = ByteUtil.bytesToLong(SecureUtil.md5().digest(UUID.randomUUID().toString()));
                        var dataAnnotationObjectBO = dataAnnotationObjectBOBuilder.dataId(tempDataId).build();
                        var file = FileUtil.file(tempPath + fileBO.getPath().replace(rootPath, ""));
                        handleDataResult(file.getParentFile(), getFileName(file), dataAnnotationObjectBO, dataAnnotationObjectBOList, errorBuilder);
                        var fileNodeBO = DataInfoBO.FileNodeBO.builder().name(fileBO.getName())
                                .fileId(fileBO.getId()).type(FILE).build();
                        var dataInfoBO = dataInfoBOBuilder.name(getFileName(file)).content(Collections.singletonList(fileNodeBO)).tempDataId(tempDataId).build();
                        dataInfoBOList.add(dataInfoBO);
                    });
                    if (CollectionUtil.isNotEmpty(dataInfoBOList)) {
                        var resDataInfoList = insertBatch(dataInfoBOList);
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
        } else {
            var uploadRecordBO = uploadRecordBOBuilder.status(FAILED).errorMessage(COMPRESSED_PACKAGE_EMPTY.getMessage()).build();
            uploadRecordDAO.updateById(DefaultConverter.convert(uploadRecordBO, UploadRecord.class));
            log.error("Image compressed package is empty,dataset id:{},filePath:{}", datasetId, dataInfoUploadBO.getFileUrl());
        }
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
        var dataAnnotationRecord = dataAnnotationRecordDAO.getOne(lambdaQueryWrapper);
        var boo = true;
        if (ObjectUtil.isNull(dataAnnotationRecord)) {
            boo = false;
            dataAnnotationRecord = DataAnnotationRecord.builder()
                    .datasetId(dataPreAnnotationBO.getDatasetId()).serialNo(serialNo).build();
            dataAnnotationRecordDAO.save(dataAnnotationRecord);
        }
        var dataIds = dataPreAnnotationBO.getDataIds();
        var insertCount = batchInsertDataEdit(dataIds, dataAnnotationRecord.getId(), dataPreAnnotationBO);
        // Indicates that no new data is locked and there is no old lock record
        if (insertCount == 0 && !boo) {
            throw new UsecaseException(UsecaseCode.DATASET_DATA_EXIST_ANNOTATE);
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
    private Integer batchInsertDataEdit(List<Long> dataIds, Long dataAnnotationRecordId, DataPreAnnotationBO dataAnnotationRecord) {
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
                .modelVersion(dataAnnotationRecord.getModelVersion());
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
        var dataInfoBOList = listByIds(dataIds);
        var dataMap = dataInfoBOList.stream().collect(Collectors.toMap(DataInfoBO::getId, dataInfoBO -> dataInfoBO));
        for (var dataId : dataIds) {
            modelMessageBO.setDataId(dataId);
            modelMessageBO.setDataInfo(dataMap.get(dataId));
            modelMessageBO.setDatasetId(dataMap.get(dataId).getDatasetId());
            modelUseCase.sendModelMessageToMQ(modelMessageBO);
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
     * Download the file and unzip the file
     *
     * @param dataInfoUploadBO Upload data parameter
     * @param function         function
     */
    private <T extends DataInfoUploadBO> void downloadAndDecompressionFile(T dataInfoUploadBO, Consumer<T> function) throws IOException {
        var fileUrl = URLUtil.decode(dataInfoUploadBO.getFileUrl());
        var datasetId = dataInfoUploadBO.getDatasetId();
        var path = DecompressionFileUtils.removeUrlParameter(dataInfoUploadBO.getFileUrl());
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
        var resultFile = FileUtil.loopFiles(file).stream()
                .filter(fc -> fc.getName().toUpperCase().endsWith(JSON_SUFFIX) && getFileName(fc).equals(dataName)
                        && fc.getParentFile().getName().equalsIgnoreCase(RESULT)).findFirst();
        if (resultFile.isPresent()) {
            try {
                var resultJson = JSONUtil.readJSONObject(resultFile.get(), Charset.defaultCharset());
                var result = JSONUtil.toBean(resultJson, DataImportResultBO.class);
                if (CollectionUtil.isEmpty(result.getObjects())) {
                    log.error("Objects is empty，dataId:{},dataName:{}", dataAnnotationObjectBO.getDataId(), dataName);
                    errorBuilder.append(FileUtil.getPrefix(dataName) + ".json the objects in the result file cannot be empty;");
                    return;
                }
                result.getObjects().forEach(object -> {
                    var insertDataAnnotationObjectBO = DefaultConverter.convert(dataAnnotationObjectBO, DataAnnotationObjectBO.class);
                    object.setId(IdUtil.randomUUID());
                    object.setVersion(0);
                    Objects.requireNonNull(insertDataAnnotationObjectBO).setClassAttributes(JSONUtil.parseObj(object));
                    if (verifyDataResult(object, dataAnnotationObjectBO.getDataId(), dataName)) {
                        dataAnnotationObjectBOList.add(insertDataAnnotationObjectBO);
                    }
                });
            } catch (Exception e) {
                log.error("Handle result json error,userId:{},datasetId:{}", dataAnnotationObjectBO.getCreatedBy(), dataAnnotationObjectBO.getDatasetId(), e);
            }
        }
    }

    /**
     * Assemble the content of a single frame
     *
     * @param dataFiles Data composition file
     * @param rootPath  Root path
     * @return content
     */
    private List<DataInfoBO.FileNodeBO> assembleContent(Long userId, List<File> dataFiles, String rootPath) {
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
        var fileBOS = uploadFileList(userId, rootPath, tempPath, files);
        createUploadThumbnail(userId, fileBOS, rootPath);
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
            var path = rootPath + node.getAbsolutePath().replace(tempPath, "");
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
            dataAnnotationObjectBOList.forEach(d -> d.setDataId(dataIdMap.get(d.getDataId())));
            dataAnnotationObjectDAO.getBaseMapper().insertBatch(DefaultConverter.convert(dataAnnotationObjectBOList, DataAnnotationObject.class));
            dataAnnotationObjectBOList.clear();
        }
    }

    /**
     * Batch upload files
     *
     * @param rootPath Path prefix
     * @param files    File list
     * @return File information list
     */
    public List<FileBO> uploadFileList(Long userId, String rootPath, String tempPath, List<File> files) {
        var bucketName = minioProp.getBucketName();
        try {
            minioService.uploadFileList(bucketName, rootPath, tempPath, files);
        } catch (Exception e) {
            log.error("Batch upload file error,filesPath:{}", JSONUtil.parseArray(files.stream().map(File::getAbsolutePath).collect(Collectors.toList())), e);
        }

        var fileBOS = new ArrayList<FileBO>();
        files.forEach(file -> {
            var path = rootPath + file.getAbsolutePath().replace(tempPath, "");
            var mimeType = FileUtil.getMimeType(path);
            var fileBO = FileBO.builder().name(file.getName()).originalName(file.getName()).bucketName(bucketName)
                    .size(file.length()).path(path).type(mimeType).build();
            fileBOS.add(fileBO);
        });
        return fileUseCase.saveBatchFile(userId, fileBOS);
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
     * @return Data export collection
     */
    public List<DataExportBO> processData(List<DataInfoBO> dataList, DataInfoQueryBO queryBO) {
        if (CollectionUtil.isEmpty(dataList)) {
            return List.of();
        }
        var dataInfoExportBOList = new ArrayList<DataExportBO>();
        var dataIds = dataList.stream().map(DataInfoBO::getId).collect(Collectors.toList());
        var dataAnnotationList = dataAnnotationUseCase.findByDataIds(dataIds);
        Map<Long, List<DataAnnotationBO>> dataAnnotationMap = CollectionUtil.isNotEmpty(dataAnnotationList) ? dataAnnotationList.stream().collect(
                Collectors.groupingBy(DataAnnotationBO::getDataId)) : Map.of();
        var dataAnnotationObjectList = dataAnnotationObjectUseCase.findByDataIds(dataIds);
        Map<Long, List<DataAnnotationObjectBO>> dataAnnotationObjectMap = CollectionUtil.isNotEmpty(dataAnnotationObjectList) ?
                dataAnnotationObjectList.stream().collect(Collectors.groupingBy(DataAnnotationObjectBO::getDataId))
                : Map.of();
        dataList.forEach(dataInfoBO -> {
            var dataId = dataInfoBO.getId();
            var dataExportBaseBO = assembleExportDataContent(dataInfoBO, queryBO.getDatasetType());
            var annotationList = dataAnnotationMap.get(dataId);
            var objectList = dataAnnotationObjectMap.get(dataId);
            var dataResultExportBO = DataResultExportBO.builder().dataId(dataId).version(version).build();
            if (CollectionUtil.isNotEmpty(annotationList)) {
                var classificationAttributes = annotationList.stream().map(dataAnnotationBO -> dataAnnotationBO.getClassificationAttributes()).collect(Collectors.toList());
                dataResultExportBO.setClassificationValues(JSONUtil.parseArray(classificationAttributes));
            }
            if (CollectionUtil.isNotEmpty(objectList)) {
                var objects = objectList.stream().map(object -> object.getClassAttributes()).collect(Collectors.toList());
                dataResultExportBO.setObjects(DefaultConverter.convert(objects, DataResultObjectExportBO.class));
            }
            var dataInfoExportBO = DataExportBO.builder().data(dataExportBaseBO).result(dataResultExportBO).build();
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
        var images = new ArrayList<LidarFusionDataExportBO.LidarFusionImageBO>();
        for (DataInfoBO.FileNodeBO f : dataInfoBO.getContent()) {
            var relationFileBO = FILE.equals(f.getType()) ? f.getFile() : CollectionUtil.getFirst(f.getFiles()).getFile();
            if (f.getName().equals(StrUtil.toCamelCase(POINT_CLOUD))) {
                pointCloudUrl = relationFileBO.getUrl();
                pointCloudZipPath = relationFileBO.getZipPath();
            } else if (f.getName().equals(StrUtil.toCamelCase(CAMERA_CONFIG))) {
                cameraConfigUrl = relationFileBO.getUrl();
                cameraConfigZipPath = relationFileBO.getZipPath();
            } else {
                var url = relationFileBO.getUrl();
                var zipPath = relationFileBO.getZipPath();
                var lidarFusionImageBO = DefaultConverter.convert(relationFileBO.getExtraInfo(), LidarFusionDataExportBO.LidarFusionImageBO.class);
                lidarFusionImageBO = ObjectUtil.isNull(lidarFusionImageBO) ? new LidarFusionDataExportBO.LidarFusionImageBO() : lidarFusionImageBO;
                lidarFusionImageBO.setUrl(url);
                lidarFusionImageBO.setZipPath(zipPath);
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
                break;
            default:
                break;
        }
        return dataExportBaseBO;
    }

    /**
     * Assemble the content below point_content
     *
     * @param list File node list
     * @return File information collection
     */
    private List<Object> handlePointCloudContent(List<DataInfoBO.FileNodeBO> list) {
        var pointCloudList = new ArrayList<>();
        list.forEach(l -> {
            if (l.getType().equals(FILE)) {
                pointCloudList.add(l.getFile().getUrl());
            } else {
                var json = new JSONObject();
                json.set(l.getName(), handlePointCloudContent(l.getFiles()));
                pointCloudList.add(json);
            }
        });
        return pointCloudList;
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
            binaryPreSignUrlBO = minioService.generatePresignedUrl(pcdFileBO.getBucketName(), binaryPath);
            imagePreSignUrlBO = minioService.generatePresignedUrl(pcdFileBO.getBucketName(), imagePath);

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
                ObjectTypeEnum.TWO_D_BOX.getValue(), ObjectTypeEnum.THREE_D_BOX.getValue(), ObjectTypeEnum.THREE_D_SEGMENT_POINTS);
        if (!types.contains(dataAnnotationResultObjectBO.getType())) {
            log.error("Object type error，dataId:{},dataName:{}", dataId, dataName);
            boo = false;
        } else if (ObjectUtil.isNull(dataAnnotationResultObjectBO.getContour())) {
            log.error("Contour miss，dataId:{},dataName:{}", dataId, dataName);
            boo = false;
        }
        return boo;
    }
}
