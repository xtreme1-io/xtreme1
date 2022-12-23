package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.DataClassificationOptionDAO;
import ai.basic.x1.adapter.port.dao.DataInfoDAO;
import ai.basic.x1.adapter.port.dao.DatasetSimilarityJobDAO;
import ai.basic.x1.adapter.port.dao.DatasetSimilarityRecordDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.*;
import ai.basic.x1.adapter.port.minio.MinioProp;
import ai.basic.x1.adapter.port.minio.MinioService;
import ai.basic.x1.adapter.port.rpc.SimilarityHttpCaller;
import ai.basic.x1.adapter.port.rpc.dto.SimilarityFileDTO;
import ai.basic.x1.adapter.port.rpc.dto.SimilarityParamDTO;
import ai.basic.x1.entity.DataInfoBO;
import ai.basic.x1.entity.DataSimilarityBO;
import ai.basic.x1.entity.DatasetSimilarityBO;
import ai.basic.x1.entity.DatasetSimilarityRecordBO;
import ai.basic.x1.entity.enums.SimilarityStatusEnum;
import ai.basic.x1.entity.enums.SimilarityTypeEnum;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.Constants;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.lock.IDistributedLock;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.io.IoUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @author fyb
 * @date 2022-12-05 18:25:33
 */

@Slf4j
public class DatasetSimilarityRecordUseCase {

    @Autowired
    private DatasetSimilarityRecordDAO datasetSimilarityRecordDAO;
    @Autowired
    private DataInfoDAO dataInfoDAO;
    @Autowired
    private DataInfoUseCase dataInfoUseCase;
    @Autowired
    private DatasetSimilarityJobDAO datasetSimilarityJobDAO;
    @Autowired
    @Qualifier("similarityDistributedLock")
    private IDistributedLock similarityDistributedLock;

    @Autowired
    private SimilarityHttpCaller similarityHttpCaller;

    @Autowired
    private MinioService minioService;

    @Autowired
    private MinioProp minioProp;

    @Autowired
    private DataClassificationOptionDAO dataClassificationOptionDAO;

    @Transactional(rollbackFor = Throwable.class)
    public void generateDatasetSimilarityRecord(Long datasetId) {
        boolean lockResult = false;
        try {
            if (lockResult = similarityDistributedLock.tryLock(String.valueOf(datasetId))) {
                DatasetSimilarityRecord datasetSimilarityRecord = null;
                List<DatasetSimilarityRecord> datasetSimilarityRecords = datasetSimilarityRecordDAO.list(Wrappers.lambdaQuery(DatasetSimilarityRecord.class)
                        .eq(DatasetSimilarityRecord::getDatasetId, datasetId).orderByDesc(DatasetSimilarityRecord::getCreatedAt));
                if (CollUtil.isNotEmpty(datasetSimilarityRecords) && datasetSimilarityRecords.stream().filter(d -> SimilarityStatusEnum.SUBMITTED == d.getStatus()).count() > 0) {
                    return;
                }
                List<DataInfo> datasetDataInfoList = dataInfoDAO.list(Wrappers.lambdaQuery(DataInfo.class).select(DataInfo::getId).eq(DataInfo::getDatasetId, datasetId));
                List<Long> dataIds = CollUtil.isNotEmpty(datasetDataInfoList) ? datasetDataInfoList.stream().map(DataInfo::getId).collect(Collectors.toList()) : null;
                if (CollUtil.isEmpty(datasetSimilarityRecords)) {
                    if (CollUtil.isNotEmpty(dataIds)) {
                        datasetSimilarityRecord = DatasetSimilarityRecord.builder().datasetId(datasetId)
                                .serialNumber(IdUtil.fastSimpleUUID())
                                .status(SimilarityStatusEnum.SUBMITTED)
                                .type(SimilarityTypeEnum.FULL)
                                .dataInfo(SimilarityDataInfo.builder().fullDataIds(dataIds).build()).build();
                    }
                } else {
                    //increment
                    DatasetSimilarityRecord lastDatasetSimilarityRecord = CollUtil.getFirst(datasetSimilarityRecords);
                    if (lastDatasetSimilarityRecord.getStatus() == SimilarityStatusEnum.COMPLETED) {
                        //submit data
                        SimilarityDataInfo dataInfo = lastDatasetSimilarityRecord.getDataInfo();
                        List<Long> lastFullDataIds = dataInfo.getFullDataIds();
                        if (CollUtil.isNotEmpty(lastFullDataIds)) {
                            if (CollUtil.isNotEmpty(dataIds)) {
                                Map<Long, Long> newDatasetDataIdMap = dataIds.stream().collect(Collectors.toMap(k -> k, v -> v));
                                Map<Long, Long> lastFullDataIdMap = lastFullDataIds.stream().collect(Collectors.toMap(k -> k, v -> v));
                                //delete id
                                List<Long> deletedIds = new ArrayList<>();
                                for (Long dataId : lastFullDataIds) {
                                    if (ObjectUtil.isNull(newDatasetDataIdMap.get(dataId))) {
                                        deletedIds.add(dataId);
                                    }
                                }
                                //add id
                                List<Long> addIds = new ArrayList<>();
                                for (Long dataId : dataIds) {
                                    if (ObjectUtil.isNull(lastFullDataIdMap.get(dataId))) {
                                        addIds.add(dataId);
                                    }
                                }
                                if (!(CollUtil.isEmpty(addIds) && CollUtil.isEmpty(deletedIds))) {
                                    datasetSimilarityRecord = DatasetSimilarityRecord.builder().datasetId(datasetId)
                                            .serialNumber(IdUtil.fastSimpleUUID())
                                            .status(SimilarityStatusEnum.SUBMITTED)
                                            .type(SimilarityTypeEnum.INCREMENT)
                                            .dataInfo(SimilarityDataInfo.builder().fullDataIds(dataIds).addDataIds(addIds).deletedIds(deletedIds).build()).build();
                                }
                            } else {
                                datasetSimilarityRecordDAO.remove(Wrappers.lambdaQuery(DatasetSimilarityRecord.class).eq(DatasetSimilarityRecord::getDatasetId,datasetId));
                            }
                        }
                    }
                }
                if (ObjectUtil.isNotNull(datasetSimilarityRecord)) {
                    datasetSimilarityRecordDAO.save(datasetSimilarityRecord);
                    datasetSimilarityJobDAO.remove(Wrappers.lambdaQuery(DatasetSimilarityJob.class).eq(DatasetSimilarityJob::getDatasetId, datasetId));
                    SimilarityParamDTO similarityParamDTO = buildSimilarityParamDTO(datasetSimilarityRecord);
                    similarityHttpCaller.callSimilarity(similarityParamDTO);
                }
            }
        } catch (Throwable throwable) {
            log.error("generateDatasetSimilarityRecord error", throwable);
            throw new UsecaseException("generateDatasetSimilarityRecord error");
        } finally {
            if (lockResult) {
                similarityDistributedLock.unlock(String.valueOf(datasetId));
            }
        }
    }


    private SimilarityParamDTO buildSimilarityParamDTO(DatasetSimilarityRecord datasetSimilarityRecord) {
        return SimilarityParamDTO.builder()
                .datasetId(datasetSimilarityRecord.getDatasetId())
                .serialNumber(datasetSimilarityRecord.getSerialNumber())
                .filePath(uploadSimilarityFile(datasetSimilarityRecord))
                .type(datasetSimilarityRecord.getType().name())
                .build();
    }

    private String uploadSimilarityFile(DatasetSimilarityRecord datasetSimilarityRecord) {
        SimilarityFileDTO similarityFileDTO = null;
        if (SimilarityTypeEnum.FULL == datasetSimilarityRecord.getType()) {
            if (CollUtil.isNotEmpty(datasetSimilarityRecord.getDataInfo().getFullDataIds())) {
                List<List<Long>> dataIdList = CollUtil.split(datasetSimilarityRecord.getDataInfo().getFullDataIds(), 1000);
                List<SimilarityFileDTO.FileInfo> fileInfos = getFileInfo(dataIdList);
                if (CollUtil.isNotEmpty(fileInfos)) {
                    similarityFileDTO = SimilarityFileDTO.builder().addData(Arrays.asList()).deletedIds(Arrays.asList()).fullData(fileInfos).build();
                }
            }
        } else {
            SimilarityFileDTO.SimilarityFileDTOBuilder similarityFileDTOBuilder = SimilarityFileDTO.builder().fullData(Arrays.asList());
            if (CollUtil.isNotEmpty(datasetSimilarityRecord.getDataInfo().getAddDataIds())) {
                List<List<Long>> dataIdList = CollUtil.split(datasetSimilarityRecord.getDataInfo().getAddDataIds(), 1000);
                List<SimilarityFileDTO.FileInfo> fileInfos = getFileInfo(dataIdList);
                similarityFileDTOBuilder.addData(fileInfos);
            } else {
                similarityFileDTOBuilder.addData(Arrays.asList());
            }
            if (CollUtil.isNotEmpty(datasetSimilarityRecord.getDataInfo().getDeletedIds())) {
                similarityFileDTOBuilder.deletedIds(datasetSimilarityRecord.getDataInfo().getDeletedIds());
            } else {
                similarityFileDTOBuilder.deletedIds(Arrays.asList());
            }
            similarityFileDTO = similarityFileDTOBuilder.build();
        }
        String path = String.format(Constants.SIMILARITY_SUBMIT_FILE_PATH_FORMAT, datasetSimilarityRecord.getSerialNumber() + Constants.JSON_SUFFIX.toLowerCase());
        String json = JSONUtil.toJsonStr(similarityFileDTO);
        try {
            minioService.uploadFileWithoutUrl(minioProp.getBucketName(), path, IoUtil.toUtf8Stream(json), "application/json", StrUtil.byteLength(json, StandardCharsets.UTF_8));
            return path;
        } catch (Throwable throwable) {
            log.error("upload dataset similarityFile error", throwable);
            throw new UsecaseException("upload dataset similarityFile error");
        }
    }

    private List<SimilarityFileDTO.FileInfo> getFileInfo(List<List<Long>> dataIdList) {
        List<SimilarityFileDTO.FileInfo> fileInfos = new ArrayList<>();
        for (List<Long> dataIds : dataIdList) {
            List<DataInfoBO> dataInfoBOS = dataInfoUseCase.listByIds(dataIds, true);
            if (CollUtil.isNotEmpty(dataInfoBOS)) {
                for (DataInfoBO dataInfoBO : dataInfoBOS) {
                    fileInfos.add(SimilarityFileDTO.FileInfo.builder().id(dataInfoBO.getId()).path(CollectionUtil.getFirst(dataInfoBO.getContent()).getFile().getPath()).build());
                }
            }
        }
        return fileInfos;
    }

    public DatasetSimilarityRecordBO getDatasetSimilarityRecord(Long datasetId) {
        List<DatasetSimilarityRecord> list = datasetSimilarityRecordDAO.list(Wrappers.lambdaQuery(DatasetSimilarityRecord.class)
                .eq(DatasetSimilarityRecord::getDatasetId, datasetId).orderByDesc(DatasetSimilarityRecord::getCreatedAt).last(" LIMIT 2"));
        if (CollUtil.isNotEmpty(list)) {
            list.sort(Comparator.comparing(DatasetSimilarityRecord::getId));
            DatasetSimilarityRecord firstSimilarityRecord = CollUtil.getFirst(list);
            DatasetSimilarityRecord lastDatasetSimilarityRecord = CollUtil.getLast(list);
            if (list.size() == 1) {
                DatasetSimilarityRecordBO datasetSimilarityRecordBO = DefaultConverter.convert(firstSimilarityRecord, DatasetSimilarityRecordBO.class);
                datasetSimilarityRecordBO.setIsHistoryData(Boolean.FALSE);
                if (firstSimilarityRecord.getStatus() == SimilarityStatusEnum.COMPLETED) {
                    try {
                        String resultUrl = minioService.getUrl(minioProp.getBucketName(), String.format(Constants.SIMILARITY_RESULT_PATH_FORMAT, firstSimilarityRecord.getSerialNumber() + Constants.JSON_SUFFIX.toLowerCase()));
                        datasetSimilarityRecordBO.setResultUrl(resultUrl);
                    } catch (Throwable throwable) {
                        log.error("get result url error", throwable);
                    }
                }
                return datasetSimilarityRecordBO;
            } else {
                if (lastDatasetSimilarityRecord.getStatus() == SimilarityStatusEnum.SUBMITTED) {
                    DatasetSimilarityRecordBO datasetSimilarityRecordBO = DefaultConverter.convert(firstSimilarityRecord, DatasetSimilarityRecordBO.class);
                    datasetSimilarityRecordBO.setIsHistoryData(Boolean.TRUE);
                    try {
                        String resultUrl = minioService.getUrl(minioProp.getBucketName(), String.format(Constants.SIMILARITY_RESULT_PATH_FORMAT, firstSimilarityRecord.getSerialNumber() + Constants.JSON_SUFFIX.toLowerCase()));
                        datasetSimilarityRecordBO.setResultUrl(resultUrl);
                    } catch (Throwable throwable) {
                        log.error("get result url error", throwable);
                    }
                    return datasetSimilarityRecordBO;
                } else {
                    DatasetSimilarityRecordBO datasetSimilarityRecordBO = DefaultConverter.convert(lastDatasetSimilarityRecord, DatasetSimilarityRecordBO.class);
                    datasetSimilarityRecordBO.setIsHistoryData(Boolean.FALSE);
                    try {
                        String resultUrl = minioService.getUrl(minioProp.getBucketName(), String.format(Constants.SIMILARITY_RESULT_PATH_FORMAT, lastDatasetSimilarityRecord.getSerialNumber() + Constants.JSON_SUFFIX.toLowerCase()));
                        datasetSimilarityRecordBO.setResultUrl(resultUrl);
                    } catch (Throwable throwable) {
                        log.error("get result url error", throwable);
                    }

                    return datasetSimilarityRecordBO;
                }
            }
        }
        return null;
    }

    public DatasetSimilarityBO getDatasetSimilarityRecordByClassificationId(Long datasetId, Long classificationId) {
        List<DataClassificationOption> dataClassificationOptions = dataClassificationOptionDAO.statisticsDatasetDataClassification(datasetId, classificationId);
        DatasetSimilarityBO datasetSimilarityBO = buildDatasetSimilarityBO(dataClassificationOptions);
        return datasetSimilarityBO;
    }

    private DatasetSimilarityBO buildDatasetSimilarityBO(List<DataClassificationOption> dataClassificationOptions) {
        String noOptionStr = "No Options";
        String multiOptionStr = "Multiple Options";
        if (CollUtil.isNotEmpty(dataClassificationOptions)) {
            DatasetSimilarityBO datasetSimilarityBO = new DatasetSimilarityBO();
            List<String> options = new ArrayList<>();
            List<DataSimilarityBO> dataSimilarityBOS = new ArrayList<>();
            options.add(noOptionStr);
            for (DataClassificationOption dataClassificationOption : dataClassificationOptions) {
                dataSimilarityBOS.add(DataSimilarityBO.builder().attributeId(dataClassificationOption.getAttributeId())
                        .optionCount(dataClassificationOption.getOptionCount())
                        .optionName(dataClassificationOption.getOptionCount() == 1 ? dataClassificationOption.getOptionName() : multiOptionStr)
                        .id(dataClassificationOption.getDataId())
                        .optionPaths(dataClassificationOption.getOptionPaths()).build());
                if (!options.contains(dataClassificationOption.getOptionName()) && dataClassificationOption.getOptionCount() == 1) {
                    options.add(dataClassificationOption.getOptionName());
                }
            }
            options.add(multiOptionStr);
            datasetSimilarityBO.setDataSimilarityList(dataSimilarityBOS);
            datasetSimilarityBO.setOptions(options);
            return datasetSimilarityBO;
        }
        return null;

    }
}