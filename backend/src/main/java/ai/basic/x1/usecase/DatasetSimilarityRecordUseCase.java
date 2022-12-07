package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.DataInfoDAO;
import ai.basic.x1.adapter.port.dao.DatasetSimilarityRecordDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataInfo;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetSimilarityRecord;
import ai.basic.x1.adapter.port.dao.mybatis.model.SimilarityDataInfo;
import ai.basic.x1.adapter.port.minio.MinioProp;
import ai.basic.x1.adapter.port.minio.MinioService;
import ai.basic.x1.adapter.port.rpc.SimilarityHttpCaller;
import ai.basic.x1.adapter.port.rpc.dto.SimilarityFileDTO;
import ai.basic.x1.adapter.port.rpc.dto.SimilarityParamDTO;
import ai.basic.x1.entity.DataInfoBO;
import ai.basic.x1.entity.DatasetSimilarityRecordBO;
import ai.basic.x1.entity.enums.SimilarityStatusEnum;
import ai.basic.x1.entity.enums.SimilarityTypeEnum;
import ai.basic.x1.usecase.exception.UsecaseCode;
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
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
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
    @Qualifier("similarityDistributedLock")
    private IDistributedLock similarityDistributedLock;

    @Autowired
    private SimilarityHttpCaller similarityHttpCaller;

    @Autowired
    private MinioService minioService;

    @Autowired
    private MinioProp minioProp;


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
                        datasetSimilarityRecordDAO.save(datasetSimilarityRecord);
                    }
                } else {
                    //increment
                    DatasetSimilarityRecord lastDatasetSimilarityRecord = CollUtil.getLast(datasetSimilarityRecords);
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
                                datasetSimilarityRecord = DatasetSimilarityRecord.builder().datasetId(datasetId)
                                        .serialNumber(IdUtil.fastSimpleUUID())
                                        .status(SimilarityStatusEnum.SUBMITTED)
                                        .type(SimilarityTypeEnum.INCREMENT)
                                        .dataInfo(SimilarityDataInfo.builder().fullDataIds(dataIds).addDataIds(addIds).deletedIds(deletedIds).build()).build();
                            } else {
                                //empty dataset
                                datasetSimilarityRecord = DatasetSimilarityRecord.builder().datasetId(datasetId)
                                        .serialNumber(IdUtil.fastSimpleUUID())
                                        .status(SimilarityStatusEnum.COMPLETED)
                                        .type(SimilarityTypeEnum.INCREMENT)
                                        .dataInfo(SimilarityDataInfo.builder().fullDataIds(null).addDataIds(null).deletedIds(lastFullDataIds).build()).build();
                            }
                        } else {
                            datasetSimilarityRecord = DatasetSimilarityRecord.builder().datasetId(datasetId)
                                    .serialNumber(IdUtil.fastSimpleUUID())
                                    .status(SimilarityStatusEnum.SUBMITTED)
                                    .type(SimilarityTypeEnum.INCREMENT)
                                    .dataInfo(SimilarityDataInfo.builder().fullDataIds(dataIds).addDataIds(dataIds).deletedIds(null).build()).build();
                        }
                        datasetSimilarityRecordDAO.save(datasetSimilarityRecord);
                    }
                }
                if (ObjectUtil.isNotNull(datasetSimilarityRecord)) {
                    SimilarityParamDTO similarityParamDTO = buildSimilarityParamDTO(datasetSimilarityRecord);
//                    similarityHttpCaller.callSimilarity(similarityParamDTO);
                }
            }
        } catch (Throwable throwable) {
            log.error("generateDatasetSimilarityRecord error", throwable);
        } finally {
            if (lockResult) {
                similarityDistributedLock.unlock(String.valueOf(datasetId));
            }
        }
    }

    @SneakyThrows
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
        String filePathTemp = "datasetSimilarity/commit/%s";
        String path = String.format(filePathTemp, datasetSimilarityRecord.getSerialNumber() + Constants.JSON_SUFFIX.toLowerCase());
        String json = JSONUtil.toJsonStr(similarityFileDTO);
        try {
            minioService.uploadFile(minioProp.getBucketName(), path, IoUtil.toUtf8Stream(json), "application/json", StrUtil.byteLength(json, StandardCharsets.UTF_8));
            return path;
        } catch (Throwable throwable) {
            log.error("upload dataset similarityFile error", throwable);
            throw new UsecaseException(UsecaseCode.UNKNOWN);
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
            String formatUrl = "datasetSimilarity/result/%s";
            DatasetSimilarityRecord firstSimilarityRecord = CollUtil.getFirst(list);
            if (firstSimilarityRecord.getStatus() == SimilarityStatusEnum.COMPLETED || list.size() == 1) {
                DatasetSimilarityRecordBO datasetSimilarityRecordBO = DefaultConverter.convert(firstSimilarityRecord, DatasetSimilarityRecordBO.class);
                datasetSimilarityRecordBO.setIsHistoryData(false);
                if (firstSimilarityRecord.getStatus() == SimilarityStatusEnum.COMPLETED) {
                    try {
                        String resultUrl = minioService.getUrl(minioProp.getBucketName(), String.format(formatUrl, firstSimilarityRecord.getSerialNumber() + Constants.JSON_SUFFIX.toLowerCase()));
                        datasetSimilarityRecordBO.setResultUrl(resultUrl);
                    } catch (Throwable throwable) {
                        log.error("get result url error", throwable);
                    }
                }
                return datasetSimilarityRecordBO;
            } else {
                DatasetSimilarityRecord lastDatasetSimilarityRecord = CollUtil.getLast(list);
                DatasetSimilarityRecordBO datasetSimilarityRecordBO = DefaultConverter.convert(lastDatasetSimilarityRecord, DatasetSimilarityRecordBO.class);
                datasetSimilarityRecordBO.setIsHistoryData(true);
                return datasetSimilarityRecordBO;
            }
        }
        return null;
    }
}