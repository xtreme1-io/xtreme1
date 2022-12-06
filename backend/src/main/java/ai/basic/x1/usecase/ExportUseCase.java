package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.ExportRecordDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.ExportRecord;
import ai.basic.x1.adapter.port.minio.MinioProp;
import ai.basic.x1.adapter.port.minio.MinioService;
import ai.basic.x1.entity.DataInfoBO;
import ai.basic.x1.entity.DataInfoQueryBO;
import ai.basic.x1.entity.ExportRecordBO;
import ai.basic.x1.entity.FileBO;
import ai.basic.x1.entity.enums.ExportStatusEnum;
import ai.basic.x1.util.Constants;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.date.DatePattern;
import cn.hutool.core.date.TemporalAccessorUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.ZipUtil;
import cn.hutool.json.JSONConfig;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Assert;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;

/**
 * @author fyb
 */
public class ExportUseCase {


    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Autowired
    private ExportRecordUseCase exportRecordUsecase;

    @Autowired
    private ExportRecordDAO exportRecordDAO;

    @Autowired
    private MinioService minioService;

    @Autowired
    private MinioProp minioProp;

    @Autowired
    private FileUseCase fileUseCase;

    @Autowired
    private DataInfoUseCase dataInfoUseCase;

    @Value("${file.tempPath:/tmp}")
    private String tempPath;

    @FunctionalInterface
    public interface Function2<A, B, R> {
        /**
         * Applies this function to the given argument.
         *
         * @param a the function argument
         * @param b the function argument
         * @return the function result
         */
        R apply(A a, B b);
    }

    /**
     * Create export record
     *
     * @return serial number
     */
    public Long createExportRecord(String fileName) {
        var serialNumber = IdUtil.getSnowflakeNextId();
        var exportRecord = ExportRecord.builder()
                .serialNumber(serialNumber)
                .fileName(fileName)
                .status(ExportStatusEnum.GENERATING).build();
        exportRecordDAO.saveOrUpdate(exportRecord);
        return serialNumber;
    }

    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public Long asyncExportDataZip(String fileName, Long serialNumber, DataInfoQueryBO query) {
        var lambdaQueryWrapper = new LambdaQueryWrapper<ExportRecord>();
        lambdaQueryWrapper.in(ExportRecord::getSerialNumber, serialNumber);
        var exportRecord = exportRecordDAO.getOne(lambdaQueryWrapper);
        var srcPath = String.format("%s%s", tempPath, FileUtil.getPrefix(fileName));
        FileUtil.mkdir(srcPath);
        getDataAndUpload(exportRecord, srcPath, query);
        return serialNumber;
    }

    private void getDataAndUpload(ExportRecord record, String srcPath, DataInfoQueryBO query) {
        var rootPath = String.format("%s/%s", record.getCreatedBy(),
                TemporalAccessorUtil.format(OffsetDateTime.now(), DatePattern.PURE_DATETIME_PATTERN));
        var exportRecordBOBuilder = ExportRecordBO.builder()
                .id(record.getId())
                .updatedBy(record.getCreatedBy())
                .updatedAt(OffsetDateTime.now());
        int i = 0;
        while (true) {
            query.setPageNo(i);
            var page = dataInfoUseCase.findByPage(query);
            if (CollectionUtil.isEmpty(page.getList())) {
                break;
            }
            writeFile(page.getList(), srcPath, query);
            var listSize = page.getList().size();
            var exportRecordBO = exportRecordBOBuilder
                    .generatedNum((page.getPageNo() - 1) * page.getPageSize() + listSize)
                    .totalNum(page.getTotal())
                    .updatedAt(OffsetDateTime.now())
                    .build();
            exportRecordUsecase.saveOrUpdate(exportRecordBO);
            i++;
        }
        var zipPath = srcPath + ".zip";
        var zipFile = ZipUtil.zip(srcPath, zipPath + ".zip", true);
        var path = String.format("%s/%s", rootPath, FileUtil.getName(zipPath));
        var fileBO = FileBO.builder().name(FileUtil.getName(zipPath)).originalName(FileUtil.getName(zipPath)).bucketName(minioProp.getBucketName())
                .size(zipFile.length()).path(path).type(FileUtil.getMimeType(path)).build();
        try {
            minioService.uploadFile(minioProp.getBucketName(), path, FileUtil.getInputStream(zipFile), FileUtil.getMimeType(path), zipFile.length());
            var resFileBOS = fileUseCase.saveBatchFile(record.getCreatedBy(), Collections.singletonList(fileBO));
            var exportRecordBO = exportRecordBOBuilder
                    .fileId(CollectionUtil.getFirst(resFileBOS).getId())
                    .status(ExportStatusEnum.COMPLETED)
                    .updatedAt(OffsetDateTime.now())
                    .build();
            exportRecordUsecase.saveOrUpdate(exportRecordBO);
        } catch (Exception e) {
            var exportRecordBO = exportRecordBOBuilder
                    .status(ExportStatusEnum.FAILED)
                    .updatedAt(OffsetDateTime.now())
                    .build();
            exportRecordUsecase.saveOrUpdate(exportRecordBO);
            logger.error("Upload file error", e);
        }

    }

    private void writeFile(List<DataInfoBO> list, String zipPath, DataInfoQueryBO query) {
        var dataExportBOList = dataInfoUseCase.processData(list, query);
        var jsonConfig = JSONConfig.create().setIgnoreNullValue(false);
        dataExportBOList.forEach(dataExportBO -> {
            var dataExportBaseBO = dataExportBO.getData();
            var dataPath = String.format("%s/%s/%s-%s%s", zipPath, Constants.DATA, dataExportBaseBO.getName(), dataExportBaseBO.getId(), ".json");
            FileUtil.writeString(JSONUtil.toJsonStr(dataExportBaseBO, jsonConfig), dataPath, StandardCharsets.UTF_8);
            if (ObjectUtil.isNotNull(dataExportBO.getResult())) {
                var resultPath = String.format("%s/%s/%s-%s%s", zipPath, Constants.RESULT,
                        dataExportBaseBO.getName(), dataExportBaseBO.getId(), ".json");
                FileUtil.writeString(JSONUtil.toJsonStr(dataExportBO.getResult(), jsonConfig), resultPath, StandardCharsets.UTF_8);
            }
        });
    }

    /**
     * get export record by serial numbers
     *
     * @param serialNumbers serial numbers
     * @return export records
     */
    public List<ExportRecordBO> findExportRecordBySerialNumbers(List<String> serialNumbers) {
        Assert.notEmpty(serialNumbers, "serial number cannot be null");
        return exportRecordUsecase.findBySerialNumbers(serialNumbers);
    }

}
