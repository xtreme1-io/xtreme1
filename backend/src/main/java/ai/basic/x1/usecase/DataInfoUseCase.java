package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.DataAnnotationObjectDAO;
import ai.basic.x1.adapter.port.dao.DataEditDAO;
import ai.basic.x1.adapter.port.dao.DataInfoDAO;
import ai.basic.x1.adapter.port.dao.DatasetDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataAnnotationObject;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataEdit;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataInfo;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetStatistics;
import ai.basic.x1.adapter.port.minio.MinioProp;
import ai.basic.x1.adapter.port.minio.MinioService;
import ai.basic.x1.entity.*;
import ai.basic.x1.entity.enums.DataAnnotationStatusEnum;
import ai.basic.x1.entity.enums.DataStatusEnum;
import ai.basic.x1.entity.enums.DatasetTypeEnum;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DecompressionFileUtils;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.collection.ListUtil;
import cn.hutool.core.date.DatePattern;
import cn.hutool.core.date.TemporalAccessorUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.lang.UUID;
import cn.hutool.core.util.ByteUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.core.util.URLUtil;
import cn.hutool.crypto.SecureUtil;
import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONConfig;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.google.common.collect.Sets;
import lombok.extern.slf4j.Slf4j;
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
import java.util.function.Consumer;
import java.util.stream.Collectors;

import static ai.basic.x1.entity.enums.DatasetTypeEnum.*;
import static ai.basic.x1.usecase.exception.UsecaseCode.DATASET_NOT_FOUND;
import static ai.basic.x1.usecase.exception.UsecaseCode.FILE_URL_ERROR;
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
    private DataAnnotationObjectDAO dataAnnotationObjectDAO;

    @Value("${file.tempPath:/tmp/x1/}")
    private String tempPath;

    @Value("${export.data.version}")
    private String version;

    /**
     * 过滤掉文件后缀不是image的文件，当返回为false时则丢弃文件
     */
    private final FileFilter filefilter = file -> {
        //if the file extension is image return true, else false
        return IMAGE_DATA_TYPE.contains(FileUtil.getMimeType(file.getAbsolutePath()));
    };

    /**
     * 批量删除
     *
     * @param ids 数据id集合
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
     * 分页查询dataInfo
     *
     * @param queryBO 查询参数对象
     * @return dataInfo page
     */
    public Page<DataInfoBO> findByPage(DataInfoQueryBO queryBO) {
        var lambdaQueryWrapper = Wrappers.lambdaQuery(DataInfo.class);
        lambdaQueryWrapper.eq(DataInfo::getDatasetId, queryBO.getDatasetId());
        lambdaQueryWrapper.eq(DataInfo::getIsDeleted, false);
        if (StrUtil.isNotBlank(queryBO.getName())) {
            lambdaQueryWrapper.like(DataInfo::getName, queryBO.getName());
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
     * 获取文件信息根据datasetId进行分组
     *
     * @param dataInfoBOList 数据集合
     * @return dataset与数据集合Map
     */
    public Map<Long, List<DataInfoBO>> getDataInfoListFileMap(List<DataInfoBO> dataInfoBOList) {
        if (CollectionUtil.isNotEmpty(dataInfoBOList)) {
            setDataInfoBOListFile(dataInfoBOList);
            return dataInfoBOList.stream().collect(
                    Collectors.groupingBy(DataInfoBO::getDatasetId));
        }
        return new HashMap<>();
    }

    /**
     * 根据id查询详情
     *
     * @param id 数据id
     * @return 数据对象
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
     * 根据id集合查询数据对象list
     *
     * @param ids id集合
     * @return 数据对象集合
     */
    public List<DataInfoBO> listByIds(List<Long> ids) {
        var dataInfoBOList = DefaultConverter.convert(dataInfoDAO.listByIds(ids), DataInfoBO.class);
        if (CollectionUtil.isNotEmpty(dataInfoBOList)) {
            setDataInfoBOListFile(dataInfoBOList);
        }
        return dataInfoBOList;
    }


    /**
     * 根据数据集id集合查询数据集统计
     *
     * @param datasetIds 数据集id集合
     * @return 数据集统计数据
     */
    public Map<Long, DatasetStatisticsBO> getDatasetStatisticsByDatasetIds(List<Long> datasetIds) {
        var datasetStatisticsList = dataInfoDAO.getBaseMapper().getDatasetStatisticsByDatasetIds(datasetIds);
        return datasetStatisticsList.stream()
                .collect(Collectors.toMap(DatasetStatistics::getDatasetId, datasetStatistics -> DefaultConverter.convert(datasetStatistics, DatasetStatisticsBO.class), (k1, k2) -> k1));
    }

    /**
     * generate pre-signed url
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
     * 批量插入
     *
     * @param dataInfoBOList 数据详情集合
     */
    public List<DataInfoBO> insertBatch(List<DataInfoBO> dataInfoBOList) {
        List<DataInfo> infos = DefaultConverter.convert(dataInfoBOList, DataInfo.class);
        dataInfoDAO.getBaseMapper().insertBatch(infos);
        return DefaultConverter.convert(infos, DataInfoBO.class);
    }

    /**
     * 往dataset中上传数据
     *
     * @param dataInfoUploadBO 上传数据对象 包含文件信息集合
     */
    @Transactional(rollbackFor = RuntimeException.class)
    public void upload(DataInfoUploadBO dataInfoUploadBO) throws IOException {
        boolean boo = DecompressionFileUtils.validateUrl(dataInfoUploadBO.getFileUrl());
        if (!boo) {
            throw new UsecaseException(FILE_URL_ERROR);
        }
        var dataset = datasetDAO.getById(dataInfoUploadBO.getDatasetId());
        if (ObjectUtil.isNull(dataset)) {
            throw new UsecaseException(DATASET_NOT_FOUND);
        }
        dataInfoUploadBO.setType(dataset.getType());
        if (IMAGE.equals(dataset.getType())) {
            downloadAndDecompressionFile(dataInfoUploadBO, this::parseImageUploadFile);
        } else {
            downloadAndDecompressionFile(dataInfoUploadBO, this::parsePointCloudUploadFile);
        }
    }

    /**
     * 导出data数据
     *
     * @param dataInfoQueryBO 查询参数
     * @return 流水号
     */
    public Long export(DataInfoQueryBO dataInfoQueryBO) {
        var dataset = datasetDAO.getById(dataInfoQueryBO.getDatasetId());
        var fileName = String.format("%s-%s.json", dataset.getName(), TemporalAccessorUtil.format(OffsetDateTime.now(), DatePattern.PURE_DATETIME_PATTERN));
        var serialNumber = exportUseCase.createExportRecord(fileName);
        dataInfoQueryBO.setPageNo(PAGE_NO);
        dataInfoQueryBO.setPageSize(PAGE_SIZE);
        dataInfoQueryBO.setDatasetType(dataset.getType());
        var exportTime = TemporalAccessorUtil.format(OffsetDateTime.now(), DatePattern.UTC_MS_PATTERN);
        var dataExportBaseBO = DataExportBaseBO.builder()
                .datasetName(dataset.getName())
                .exportTime(exportTime)
                .version(version)
                .contents(List.of()).build();
        var exportStr = JSONUtil.toJsonStr(dataExportBaseBO, JSONConfig.create());
        var firstCoent = exportStr.substring(0, exportStr.length() - 2);
        var lastContent = exportStr.substring(exportStr.length() - 2);
        exportUseCase.asyncExportJson(fileName, serialNumber,
                firstCoent, lastContent, dataInfoQueryBO,
                this::findByPage,
                this::processData);
        return serialNumber;
    }

    private void parsePointCloudUploadFile(DataInfoUploadBO dataInfoUploadBO) {
        var datasetId = dataInfoUploadBO.getDatasetId();
        var userId = dataInfoUploadBO.getUserId();
        var datasetType = dataInfoUploadBO.getType();
        var pointCloudList = new ArrayList<File>();
        findPointCloudList(tempPath, pointCloudList);
        var rootPath = String.format("%s/%s/", userId, datasetId);
        log.info("Get point_cloud datasetId:{},size:{}", datasetId, pointCloudList.size());
        if (CollectionUtil.isEmpty(pointCloudList)) {
            throw new UsecaseException("The format of the compressed package is incorrect. It must contain point_cloud");
        }
        pointCloudList.forEach(pointCloudFile -> {
            var isError = this.validDirectoryFormat(pointCloudFile.getParentFile(), datasetType);
            if (isError) {
                return;
            }
            var dataNameList = getDataNames(pointCloudFile.getParentFile(), datasetType);
            if (CollectionUtil.isEmpty(dataNameList)) {
                log.error("The file in {} folder is empty", pointCloudFile.getParentFile().getName());
                return;
            }
            log.info("Get data name,pointCloudParentName:{},dataName:{} ", pointCloudFile.getParentFile().getName(), JSONUtil.toJsonStr(dataNameList));
            var dataInfoBOList = new ArrayList<DataInfoBO>();
            var dataAnnotationObjectBOList = new ArrayList<DataAnnotationObjectBO>();
            var dataInfoBOBuilder = DataInfoBO.builder().datasetId(datasetId).status(DataStatusEnum.VALID)
                    .annotationStatus(DataAnnotationStatusEnum.NOT_ANNOTATED)
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .createdBy(userId)
                    .isDeleted(false);
            var dataAnnotationObjectBOBuilder = DataAnnotationObjectBO.builder()
                    .datasetId(datasetId).createdBy(userId).createdAt(OffsetDateTime.now());
            for (var dataName : dataNameList) {
                var dataFiles = getDataFiles(pointCloudFile.getParentFile(), dataName, datasetType);
                if (CollectionUtil.isNotEmpty(dataFiles)) {
                    var tempDataId = ByteUtil.bytesToLong(SecureUtil.md5().digest(UUID.randomUUID().toString()));
                    var dataAnnotationObjectBO = dataAnnotationObjectBOBuilder.dataId(tempDataId).build();
                    handleDataResult(pointCloudFile.getParentFile(), dataName, dataAnnotationObjectBO, dataAnnotationObjectBOList);
                    var fileNodeList = assembleContent(userId, dataFiles, rootPath, tempPath);
                    log.info("get data content,frameName:{},content:{} ", dataName, JSONUtil.toJsonStr(fileNodeList));
                    var dataInfoBO = dataInfoBOBuilder.name(dataName).content(fileNodeList).tempDataId(tempDataId).build();
                    dataInfoBOList.add(dataInfoBO);
                    if (dataInfoBOList.size() == BATCH_SIZE) {
                        var dataInfoBOS = insertBatch(dataInfoBOList);
                        saveBatchDataResult(dataInfoBOS, dataAnnotationObjectBOList);
                        dataInfoBOList.clear();
                    }
                }
            }
            if (CollectionUtil.isNotEmpty(dataInfoBOList)) {
                var insertRs = insertBatch(dataInfoBOList);
                saveBatchDataResult(insertRs, dataAnnotationObjectBOList);
            }
        });
    }

    private void parseImageUploadFile(DataInfoUploadBO dataInfoUploadBO) {
        var userId = dataInfoUploadBO.getUserId();
        var datasetId = dataInfoUploadBO.getDatasetId();
        var files = FileUtil.loopFiles(Paths.get(tempPath), 2, filefilter);
        var rootPath = String.format("%s/%s/", userId, datasetId);
        var dataAnnotationObjectBOBuilder = DataAnnotationObjectBO.builder()
                .datasetId(datasetId).createdBy(userId).createdAt(OffsetDateTime.now());
        var dataInfoBOList = new ArrayList<DataInfoBO>();
        var dataAnnotationObjectBOList = new ArrayList<DataAnnotationObjectBO>();
        var dataInfoBOBuilder = DataInfoBO.builder().datasetId(datasetId).status(DataStatusEnum.VALID)
                .annotationStatus(DataAnnotationStatusEnum.NOT_ANNOTATED)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .createdBy(userId)
                .isDeleted(false);
        if (CollectionUtil.isNotEmpty(files)) {
            //50为一段
            var list = ListUtil.split(files, 50);
            list.forEach(fl -> {
                var fileBOS = uploadFileList(userId, rootPath, tempPath, fl);
                fileBOS.forEach(fileBO -> {
                    var tempDataId = ByteUtil.bytesToLong(SecureUtil.md5().digest(UUID.randomUUID().toString()));
                    var dataAnnotationObjectBO = dataAnnotationObjectBOBuilder.dataId(tempDataId).build();
                    var file = FileUtil.file(tempPath + fileBO.getPath().replace(rootPath, ""));
                    handleDataResult(file.getParentFile(), fileBO.getName(), dataAnnotationObjectBO, dataAnnotationObjectBOList);
                    var fileNodeBO = DataInfoBO.FileNodeBO.builder().name(fileBO.getName())
                            .fileId(fileBO.getId()).type(FILE).build();
                    var dataInfoBO = dataInfoBOBuilder.name(getFileName(file)).content(Collections.singletonList(fileNodeBO)).tempDataId(tempDataId).build();
                    dataInfoBOList.add(dataInfoBO);
                });
                if (CollectionUtil.isNotEmpty(dataInfoBOList)) {
                    var resDataInfoList = insertBatch(dataInfoBOList);
                    saveBatchDataResult(resDataInfoList, dataAnnotationObjectBOList);
                }
            });
        } else {
            log.error("Image compressed package is empty,dataset id:{},filePath:{}", datasetId, dataInfoUploadBO.getFileUrl());
        }
    }

    public <T extends DataInfoUploadBO> void downloadAndDecompressionFile(T dataInfoUploadBO, Consumer<T> function) throws IOException {
        var fileUrl = URLUtil.decode(dataInfoUploadBO.getFileUrl());
        var datasetId = dataInfoUploadBO.getDatasetId();
        var path = fileUrl;
        if (path.contains("?")) {
            path = path.substring(0, path.indexOf("?"));
        }
        tempPath = String.format("%s%s/", tempPath, UUID.randomUUID().toString().replace("-", ""));
        var savePath = tempPath + FileUtil.getName(path);
        FileUtil.mkParentDirs(savePath);
        //将压缩包下载到本地
        log.info("get compressed package start fileUrl:{},savePath:{}", fileUrl, savePath);
        HttpUtil.downloadFileFromUrl(fileUrl, savePath);
        log.info("get compressed package end fileUrl:{},savePath:{}", fileUrl, savePath);

        //解压文件
        log.info("start decompression,datasetId:{},filePath:{}", datasetId, savePath);
        DecompressionFileUtils.decompress(savePath, tempPath);
        function.accept(dataInfoUploadBO);
    }

    /**
     * 获取文件信息，并往data list设置文件信息
     *
     * @param dataInfoBOList 数据集合
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
     * 往content中设置文件信息
     *
     * @param fileNodeBOList data文件信息
     * @param fileMap        文件map
     */
    private void setFile(List<DataInfoBO.FileNodeBO> fileNodeBOList, Map<Long, FileBO> fileMap) {
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
     * 根据数据id查询文件信息
     *
     * @param fileIds 文件id集合
     * @return 文件对象map
     */
    private Map<Long, FileBO> findFileByFileIds(List<Long> fileIds) {
        var relationFileBOList = fileUseCase.findByIds(fileIds);
        return CollectionUtil.isNotEmpty(relationFileBOList) ?
                relationFileBOList.stream().collect(Collectors.toMap(FileBO::getId, fileBO -> fileBO, (k1, k2) -> k1)) : new HashMap<>();

    }

    /**
     * 从content中循环获取文件ID
     *
     * @param fileNodeBOList 数据集合
     * @return 文件ID集合
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
     * 查找所有点云的文件夹
     *
     * @param path path
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
     * 根据固定的文件夹获取文件夹下的文件夹或者文件的名称 用于判断该压缩包中有多少贞数据
     *
     * @param file           file
     * @param pointCloudList point_cloud文件夹集合
     */
    private void getPointCloudFile(File file, List<File> pointCloudList) {
        var fileName = file.getName();
        if (POINT_CLOUD.equals(fileName)) {
            pointCloudList.add(file);
        }
    }

    /**
     * 验证文件格式。
     * 如果 type 是 LIDAR_FUSION 类型, 文件目录必须包含：image、point_cloud、camera_config.
     * 如果 type 是 LIDAR_BASIC 类型, 文件目录必须包含：point_cloud
     *
     * @param pointCloudParentFile point_cloud目录的父目录
     * @param type                 上传类型
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
            log.error("压缩文件格式缺失: " + missDirs);
        }
        return !allMatchDirFormat;
    }

    /**
     * Get the name collection of data
     *
     * @param pointCloudParentFile point_cloud parent file
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
     * 获取文件名称 去掉后缀
     *
     * @param file 文件或者文件夹
     * @return 文件名称
     */
    private String getFileName(File file) {
        var fileName = file.getName();
        if (FileUtil.isFile(file)) {
            fileName = fileName.substring(0, fileName.lastIndexOf("."));
        }
        return fileName;
    }

    /**
     * 查找某一个data的文件
     *
     * @param file file
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
     * 处理 data 对应的标注结果
     *
     * @param file                       图片为data父级，点云文件为point_cloud
     * @param dataName                   数据名称
     * @param dataAnnotationObjectBO     数据标注
     * @param dataAnnotationObjectBOList 数据标注结果数据集
     */
    public void handleDataResult(File file, String dataName, DataAnnotationObjectBO dataAnnotationObjectBO, List<DataAnnotationObjectBO> dataAnnotationObjectBOList) {
        var resultFile = FileUtil.loopFiles(file).stream()
                .filter(fc -> fc.getName().toUpperCase().endsWith(JSON_SUFFIX) && getFileName(fc).equals(dataName)
                        && fc.getParentFile().getName().equalsIgnoreCase(RESULT)).findFirst();
        if (resultFile.isPresent()) {
            try {
                var resultJson = JSONUtil.readJSONObject(resultFile.get(), Charset.defaultCharset());
                var result = JSONUtil.toBean(resultJson, DataImportResultBO.class);
                result.getResults().forEach(resultBO -> resultBO.getObjects().forEach(object -> {
                    var insertDataAnnotationObjectBO = DefaultConverter.convert(dataAnnotationObjectBO, DataAnnotationObjectBO.class);
                    Objects.requireNonNull(insertDataAnnotationObjectBO).setClassAttributes(object);
                    dataAnnotationObjectBOList.add(insertDataAnnotationObjectBO);
                }));
            } catch (Exception e) {
                log.error("Handle result json error,userId:{},datasetId:{}", dataAnnotationObjectBO.getCreatedBy(), dataAnnotationObjectBO.getDatasetId(), e);
            }
        }
    }

    /**
     * 组装单帧的content
     *
     * @param dataFiles 单帧组成文件
     * @param rootPath  根路径
     * @return 单帧content
     */
    private List<DataInfoBO.FileNodeBO> assembleContent(Long userId, List<File> dataFiles, String rootPath, String tempPath) {
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
        var fileIdMap = fileBOS.stream().collect(Collectors.toMap(FileBO::getPathHash, FileBO::getId));
        replaceFileId(nodeList, fileIdMap);
        nodeList.sort(Comparator.comparing(DataInfoBO.FileNodeBO::getName));
        return nodeList;
    }

    public List<DataInfoBO.FileNodeBO> getDirList(File node, String rootPath, List<File> files) {
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

    public DataInfoBO.FileNodeBO getNode(File node, String rootPath, List<File> files) {
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
     * 将content中的fileId替换为真实的fileId
     *
     * @param nodeList  nodeList
     * @param fileIdMap 文件ID Map
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
     * 保存数据结果
     *
     * @param dataInfoBOList             已经保存的数据集合
     * @param dataAnnotationObjectBOList 需要保存的数据结果集合
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
     * 上传文件list
     *
     * @param rootPath 路径前缀
     * @param files    文件列表
     * @return 上传后的文件对象集合
     */
    public List<FileBO> uploadFileList(Long userId, String rootPath, String tempPath, List<File> files) {
        var bucketName = minioProp.getBucketName();
        try {
            minioService.uploadFileList(bucketName, rootPath, tempPath, files);
        } catch (Exception e) {
            log.error("batch upload file error,filesPath:{}", JSONUtil.parseArray(files.stream().map(File::getAbsolutePath).collect(Collectors.toList())), e);
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
     * 根据上传压缩包类型验证文件名称是否正确
     *
     * @param f    压缩包中文件
     * @param type 上传类型
     * @return 文件名称是否正确
     */
    private boolean validateFileNameByType(File f, DatasetTypeEnum type) {
        var fileName = f.getName();
        var boo = false;
        if (type.equals(LIDAR_FUSION)) {
            boo = f.isDirectory() && (fileName.startsWith(POINT_CLOUD_IMG) || fileName.equals(POINT_CLOUD) || fileName.equals(CAMERA_CONFIG));
        } else if (type.equals(DatasetTypeEnum.LIDAR_BASIC)) {
            boo = f.isDirectory() && fileName.equals(POINT_CLOUD);
        }
        return boo;
    }

    /**
     * 验证文件格式是否正确
     *
     * @param file 文件对象
     * @return 文件格式是否正确
     */
    private boolean validateFileFormat(File file) {
        var boo = false;
        var mimeType = FileUtil.getMimeType(file.getAbsolutePath());
        var fileName = file.getName();
        if (DATA_TYPE.contains(mimeType) || fileName.toUpperCase().endsWith(PCD_SUFFIX) ||
                fileName.toUpperCase().endsWith(JSON_SUFFIX)) {
            boo = true;
        } else {
            log.error("this format file is not supported,filePath:{}", file.getAbsolutePath());
        }
        return boo;
    }

    private List<DataExportBO> processData(List<DataInfoBO> dataList, DataInfoQueryBO queryBO) {
        if (CollectionUtil.isEmpty(dataList)) {
            return List.of();
        }
        var dataInfoExportBOList = new ArrayList<DataExportBO>();
        var dataIds = dataList.stream().map(DataInfoBO::getId).collect(Collectors.toList());
        var dataAnnotationList = dataAnnotationUseCase.findByDataIds(dataIds);
        var dataAnnotationMap = CollectionUtil.isNotEmpty(dataAnnotationList) ? dataAnnotationList.stream().collect(
                Collectors.groupingBy(DataAnnotationBO::getDataId)) : new HashMap<Long, List<DataAnnotationBO>>();
        var dataAnnotationObjectList = dataAnnotationObjectUseCase.findByDataIds(dataIds);
        var dataAnnotationObjectMap = CollectionUtil.isNotEmpty(dataAnnotationObjectList) ?
                dataAnnotationObjectList.stream().collect(Collectors.groupingBy(DataAnnotationObjectBO::getDataId))
                : new HashMap<Long, List<DataAnnotationObjectBO>>();
        dataList.forEach(dataInfoBO -> {
            var dataId = dataInfoBO.getId();
            var map = assembleExportDataContent(dataInfoBO.getContent(), queryBO.getDatasetType());
            var result = new DataExportBO.Result();
            var annotationList = dataAnnotationMap.get(dataId);
            var objectList = dataAnnotationObjectMap.get(dataId);
            if (CollectionUtil.isNotEmpty(annotationList)) {
                result.setClassifications(annotationList.stream().map(dataAnnotationBO ->
                        JSONUtil.parse(dataAnnotationBO.getClassificationAttributes())).collect(Collectors.toList()));
            }
            if (CollectionUtil.isNotEmpty(objectList)) {
                result.setObjects(objectList.stream().map(DataAnnotationObjectBO::getClassAttributes).collect(Collectors.toList()));
            }
            map.put(RESULT, result);
            var dataInfoExportBO = DataExportBO.builder().name(dataInfoBO.getName()).data(JSONUtil.parseObj(map)).build();
            dataInfoExportBOList.add(dataInfoExportBO);
        });
        return dataInfoExportBOList;
    }

    /**
     * 组装导出data数据
     *
     * @param content data下内容
     * @return content map
     */
    private Map<String, Object> assembleExportDataContent(List<DataInfoBO.FileNodeBO> content, DatasetTypeEnum datasetType) {
        var map = new TreeMap<String, Object>(Comparator.naturalOrder());
        for (DataInfoBO.FileNodeBO f : content) {
            if (f.getName().equals(POINT_CLOUD)) {
                map.put(f.getName(), handlePointCloudContent(f.getFiles()));
            } else {
                var type = f.getType();
                var url = FILE.equals(type) ? f.getFile().getUrl() : CollectionUtil.getFirst(f.getFiles()).getFile().getUrl();
                if (IMAGE.equals(datasetType)) {
                    map.put(IMAGE.name().toLowerCase(), url);
                } else {
                    map.put(f.getName(), url);
                }
            }
        }
        return map;
    }

    /**
     * 组装point_content下面的内容，可能为文件夹
     *
     * @param list 文件节点集合
     * @return 文件信息集合
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

}
