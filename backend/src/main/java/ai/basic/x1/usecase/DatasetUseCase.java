package ai.basic.x1.usecase;

import ai.basic.x1.adapter.api.config.DatasetInitialInfo;
import ai.basic.x1.adapter.api.context.RequestContextHolder;
import ai.basic.x1.adapter.api.context.UserInfo;
import ai.basic.x1.adapter.port.dao.*;
import ai.basic.x1.adapter.port.dao.mybatis.model.*;
import ai.basic.x1.entity.*;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DecompressionFileUtils;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import ai.basic.x1.util.lock.IDistributedLock;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.thread.ThreadUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.alibaba.ttl.TtlRunnable;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.stream.Collectors;

import static ai.basic.x1.entity.enums.DatasetTypeEnum.LIDAR_FUSION;
import static ai.basic.x1.util.Constants.PAGE_SIZE_100;

/**
 * @author fyb
 * @date 2022/2/16 15:03
 */
@Slf4j
public class DatasetUseCase {

    @Autowired
    private DatasetDAO datasetDAO;

    @Autowired
    @Qualifier("distributedLock")
    private IDistributedLock distributedLock;

    @Autowired
    private DatasetClassDAO datasetClassDAO;

    @Autowired
    private DatasetClassificationDAO datasetClassificationDAO;

    @Autowired
    private DataInfoUseCase dataInfoUseCase;

    @Autowired
    private UserUseCase userUseCase;

    @Autowired
    private DatasetInitialInfo datasetInitialInfo;

    @Autowired
    private DataAnnotationObjectUseCase dataAnnotationObjectUseCase;

    @Autowired
    private DataInfoDAO dataInfoDAO;

    @Autowired
    private DataAnnotationObjectDAO dataAnnotationObjectDAO;

    @Value("${file.tempPath:/tmp/xtreme1/}")
    private String tempPath;

    private static final ExecutorService executorService = ThreadUtil.newExecutor(1);

    @PostConstruct
    public void init() {
        var file = FileUtil.file(".", datasetInitialInfo.getFileName());
        if (file.isFile()) {
            executorService.execute(Objects.requireNonNull(TtlRunnable.get(() -> {
                var datasetName = datasetInitialInfo.getName();
                var datasetLambdaQueryWrapper = Wrappers.lambdaQuery(Dataset.class);
                datasetLambdaQueryWrapper.eq(Dataset::getName, datasetName);
                var dataset = datasetDAO.getOne(datasetLambdaQueryWrapper);
                if (ObjectUtil.isNull(dataset)) {
                    var userBO = userUseCase.findByUsername(datasetInitialInfo.getUserName());
                    var requestContext = RequestContextHolder.createEmptyContent();
                    requestContext.setUserInfo(UserInfo.builder().id(userBO.getId()).build());
                    RequestContextHolder.setContext(requestContext);
                    var datasetBO = DatasetBO.builder().name(datasetName).type(datasetInitialInfo.getType()).build();
                    dataset = DefaultConverter.convert(datasetBO, Dataset.class);
                    datasetDAO.save(dataset);
                    var datasetId = dataset.getId();
                    var baseSavePath = String.format("%s%s/", tempPath, UUID.randomUUID().toString().replace("-", ""));
                    var filePath = baseSavePath + FileUtil.getName(file);
                    FileUtil.copy(file.getAbsolutePath(), filePath, true);
                    try {
                        DecompressionFileUtils.decompress(filePath, baseSavePath);
                    } catch (IOException e) {
                        log.error("Decompression file error", e);
                    }
                    var dataInfoUploadBO = DataInfoUploadBO.builder().datasetId(datasetId).type(LIDAR_FUSION)
                            .userId(userBO.getId()).savePath(filePath).baseSavePath(baseSavePath).build();
                    dataInfoUseCase.parsePointCloudUploadFile(dataInfoUploadBO);
                    var datasetClassPropertiesList = datasetInitialInfo.getClasses();
                    var datasetClassBOList = DefaultConverter.convert(datasetClassPropertiesList, DatasetClassBO.class);
                    datasetClassBOList.forEach(datasetClassBO -> datasetClassBO.setDatasetId(datasetId));
                    datasetClassDAO.saveBatch(DefaultConverter.convert(datasetClassBOList, DatasetClass.class));
                }
            })));
        }
    }

    /**
     * Save dataset
     *
     * @param bo Dataset information
     */
    public DatasetBO create(DatasetBO bo) {
        var lockKey = String.format("%s/%s", "datasetName", bo.getName());
        var boo = distributedLock.tryLock(lockKey, 1000);
        if (!boo) {
            throw new UsecaseException(UsecaseCode.DATASET_NAME_DUPLICATED);
        }
        if (nameExists(bo.getName(), null)) {
            distributedLock.unlock(lockKey);
            throw new UsecaseException(UsecaseCode.DATASET_NAME_DUPLICATED);
        }
        var dataset = DefaultConverter.convert(bo, Dataset.class);
        datasetDAO.save(dataset);
        distributedLock.unlock(lockKey);
        return DefaultConverter.convert(dataset, DatasetBO.class);
    }

    /**
     * Dataset update
     *
     * @param id       Dataset id
     * @param updateBO Dataset update information
     */
    public void update(Long id, DatasetBO updateBO) {
        var lockKey = String.format("%s/%s", "datasetName", updateBO.getName());
        var boo = distributedLock.tryLock(lockKey, 1000);
        if (!boo) {
            throw new UsecaseException(UsecaseCode.DATASET_NAME_DUPLICATED);
        }
        var datasetBO = findById(id);
        if (datasetBO == null) {
            distributedLock.unlock(lockKey);
            throw new UsecaseException(UsecaseCode.NOT_FOUND);
        }
        if (nameExists(updateBO.getName(), id)) {
            distributedLock.unlock(lockKey);
            throw new UsecaseException(UsecaseCode.DATASET_NAME_DUPLICATED);
        }
        datasetBO.setName(updateBO.getName());
        datasetBO.setDescription(updateBO.getDescription());
        var lambdaUpdateWrapper = Wrappers.lambdaUpdate(Dataset.class);
        lambdaUpdateWrapper.eq(Dataset::getId, id);
        datasetDAO.update(DefaultConverter.convert(datasetBO, Dataset.class), lambdaUpdateWrapper);
        distributedLock.unlock(lockKey);
    }

    /**
     * Determine if the dataset name exists
     *
     * @param name Dataset name
     * @param id   Dataset id
     */
    private boolean nameExists(String name, Long id) {
        var datasetLambdaQueryWrapper = Wrappers.lambdaQuery(Dataset.class);
        datasetLambdaQueryWrapper.eq(Dataset::getName, name);
        if (ObjectUtil.isNotEmpty(id)) {
            datasetLambdaQueryWrapper.ne(Dataset::getId, id);
        }
        return datasetDAO.getBaseMapper().exists(datasetLambdaQueryWrapper);
    }

    /**
     * Delete dataset
     *
     * @param id Dataset id
     */
    public void delete(Long id) {
        var datasetLambdaUpdateWrapper = Wrappers.lambdaUpdate(Dataset.class);
        datasetLambdaUpdateWrapper.eq(Dataset::getId, id);
        datasetLambdaUpdateWrapper.set(Dataset::getIsDeleted, true);
        datasetDAO.update(datasetLambdaUpdateWrapper);
    }

    /**
     * Paging query dataset
     *
     * @param pageNo   Page number
     * @param pageSize Page size
     * @param queryBO  query parameters object
     * @return Dataset page
     */
    public Page<DatasetBO> findByPage(Integer pageNo, Integer pageSize, DatasetQueryBO queryBO) {
        var lambdaQueryWrapper = Wrappers.lambdaQuery(Dataset.class);
        lambdaQueryWrapper.eq(Dataset::getIsDeleted, false);
        if (StrUtil.isNotBlank(queryBO.getName())) {
            lambdaQueryWrapper.like(Dataset::getName, queryBO.getName());
        }

        if (ObjectUtil.isNotNull(queryBO.getType())) {
            lambdaQueryWrapper.eq(Dataset::getType, queryBO.getType());
        }

        if (ObjectUtil.isNotEmpty(queryBO.getCreateStartTime()) && ObjectUtil.isNotEmpty(queryBO.getCreateEndTime())) {
            lambdaQueryWrapper.ge(Dataset::getCreatedAt, queryBO.getCreateStartTime()).le(Dataset::getCreatedAt, queryBO.getCreateEndTime());
        }

        if (StrUtil.isNotBlank(queryBO.getSortField())) {
            lambdaQueryWrapper.last(" order by " + queryBO.getSortField().toLowerCase() + " " + queryBO.getAscOrDesc());
        }
        var datasetPage = datasetDAO.getBaseMapper().selectDatasetPage(new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(pageNo, pageSize), lambdaQueryWrapper);
        return DefaultConverter.convert(datasetPage, DatasetBO.class);
    }

    /**
     * Query details based on dataset id
     *
     * @param id Dataset id
     * @return Dataset detail
     */
    public DatasetBO findById(Long id) {
        return DefaultConverter.convert(datasetDAO.getById(id), DatasetBO.class);
    }

    /**
     * Query whether an Ontology exists in the dataset
     *
     * @param datasetId Dataset id
     * @return True means exists
     */
    public Boolean findOntologyIsExistByDatasetId(Long datasetId) {
        var datasetClassLambdaQueryWrapper = Wrappers.lambdaQuery(DatasetClass.class);
        datasetClassLambdaQueryWrapper.eq(DatasetClass::getDatasetId, datasetId);
        var datasetClassCount = datasetClassDAO.count(datasetClassLambdaQueryWrapper);

        var datasetClassificationLambdaQueryWrapper = Wrappers.lambdaQuery(DatasetClassification.class);
        datasetClassificationLambdaQueryWrapper.eq(DatasetClassification::getDatasetId, datasetId);
        var datasetClassificationCount = datasetClassificationDAO.count(datasetClassificationLambdaQueryWrapper);
        return datasetClassCount > 0 || datasetClassificationCount > 0;
    }

    @Transactional(rollbackFor = Exception.class)
    public void createByScenario(DatasetScenarioBO datasetScenarioBO) {
        var datasetBO = DatasetBO.builder().name(datasetScenarioBO.getDatasetName()).type(datasetScenarioBO.getDatasetType()).build();
        var newDatasetBO = create(datasetBO);
        var datasetId = newDatasetBO.getId();
        var newClassId = 1L;
        var scenarioQueryBO = DefaultConverter.convert(datasetScenarioBO, ScenarioQueryBO.class);
        scenarioQueryBO.setPageSize(PAGE_SIZE_100);
        var i = 1;
        while (true) {
            scenarioQueryBO.setPageNo(i);
            var page = dataAnnotationObjectUseCase.findDataIdByScenarioPage(scenarioQueryBO);
            if (CollectionUtil.isEmpty(page.getList())) {
                break;
            }
            var dataIds = page.getList().stream().map(DataAnnotationObjectBO::getDataId).collect(Collectors.toList());
            var dataInfoList = dataInfoDAO.getBaseMapper().listByIds(dataIds, false);
            dataInfoList.forEach(dataInfo -> {
                dataInfo.setDatasetId(datasetId);
                dataInfo.setTempDataId(dataInfo.getId());
                dataInfo.setCreatedBy(RequestContextHolder.getContext().getUserInfo().getId());
                dataInfo.setCreatedAt(OffsetDateTime.now());
                dataInfo.setUpdatedBy(null);
            });
            scenarioQueryBO.setDataIds(dataIds);
            dataInfoDAO.getBaseMapper().insertBatch(dataInfoList);
            var dataInfoMap = dataInfoList.stream().collect(Collectors.toMap(DataInfo::getTempDataId, DataInfo::getId));
            var dataAnnotationObjectBOList = dataAnnotationObjectUseCase.listByScenario(scenarioQueryBO);
            dataAnnotationObjectBOList.forEach(dataAnnotationObjectBO -> {
                dataAnnotationObjectBO.setDatasetId(datasetId);
                dataAnnotationObjectBO.setDataId(dataInfoMap.get(dataAnnotationObjectBO.getDataId()));
                var classId = dataAnnotationObjectBO.getClassId();
                if (ObjectUtil.isNotNull(classId)) {
                    dataAnnotationObjectBO.setClassId(newClassId);
                    var dataAnnotationResultObjectBO = DefaultConverter.convert(dataAnnotationObjectBO.getClassAttributes(), DataAnnotationResultObjectBO.class);
                    dataAnnotationResultObjectBO.setClassId(newClassId);
                    dataAnnotationObjectBO.setClassAttributes(JSONUtil.parseObj(dataAnnotationResultObjectBO));
                }
                dataAnnotationObjectBO.setCreatedBy(RequestContextHolder.getContext().getUserInfo().getId());
                dataAnnotationObjectBO.setCreatedAt(OffsetDateTime.now());
            });
            dataAnnotationObjectDAO.getBaseMapper().insertBatch(DefaultConverter.convert(dataAnnotationObjectBOList, DataAnnotationObject.class));
            i++;
        }
    }

}
