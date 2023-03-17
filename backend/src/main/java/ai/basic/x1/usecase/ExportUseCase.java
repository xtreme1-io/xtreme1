package ai.basic.x1.usecase;

import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.port.dao.ExportRecordDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.ExportRecord;
import ai.basic.x1.adapter.port.minio.MinioProp;
import ai.basic.x1.adapter.port.minio.MinioService;
import ai.basic.x1.entity.*;
import ai.basic.x1.entity.enums.DataFormatEnum;
import ai.basic.x1.entity.enums.ExportStatusEnum;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.util.Constants;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.date.DatePattern;
import cn.hutool.core.date.TemporalAccessorUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.core.util.ZipUtil;
import cn.hutool.json.JSONConfig;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Assert;
import kotlin.jvm.functions.Function3;
import kotlin.jvm.functions.Function4;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

/**
 * @author fyb
 */
@Slf4j
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

    @Value("${file.tempPath:/tmp/xtreme1/}")
    private String tempPath;

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


    public <T, Q extends BaseQueryBO> Long asyncExportDataZip(String fileName, Long serialNumber, Map<Long, String> classMap, Map<Long, String> resultMap,
                                                              Q query, Function<Q, Page<T>> fun, Function4<List<T>, Q, Map<Long, String>, Map<Long, String>, List<DataExportBO>> processData) {
        var lambdaQueryWrapper = new LambdaQueryWrapper<ExportRecord>();
        lambdaQueryWrapper.in(ExportRecord::getSerialNumber, serialNumber);
        var exportRecord = exportRecordDAO.getOne(lambdaQueryWrapper);
        var srcPath = String.format("%s%s", tempPath, FileUtil.getPrefix(fileName));
        FileUtil.mkdir(srcPath);
        getDataAndUpload(exportRecord, srcPath, classMap, resultMap, query, fun, processData);
        return serialNumber;
    }

    private <T, Q extends BaseQueryBO> void getDataAndUpload(ExportRecord record, String srcPath, Map<Long, String> classMap, Map<Long, String> resultMap, Q query,
                                                             Function<Q, Page<T>> fun, Function4<List<T>, Q, Map<Long, String>, Map<Long, String>, List<DataExportBO>> processData) {
        var rootPath = String.format("%s/%s", record.getCreatedBy(),
                TemporalAccessorUtil.format(OffsetDateTime.now(), DatePattern.PURE_DATETIME_PATTERN));
        var exportRecordBOBuilder = ExportRecordBO.builder()
                .id(record.getId())
                .updatedBy(record.getCreatedBy())
                .updatedAt(OffsetDateTime.now());
        int i = 0;
        while (true) {
            query.setPageNo(i);
            var page = fun.apply(query);
            if (CollectionUtil.isEmpty(page.getList())) {
                break;
            }
            writeFile(page.getList(), srcPath, classMap, resultMap, query, processData);
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
        var zipFile = ZipUtil.zip(srcPath, zipPath, true);
        var path = String.format("%s/%s", rootPath, FileUtil.getName(zipPath));
        FileUtil.del(srcPath);
        FileUtil.mkdir(srcPath);
        if (DataFormatEnum.COCO.equals(query.getDataFormat())) {
            var respPath = String.format("%s%s/resp.json",tempPath,IdUtil.fastSimpleUUID());
            FileUtil.mkParentDirs(respPath);
            convertExport(zipPath, srcPath, respPath);
            if (FileUtil.exist(respPath) && UsecaseCode.OK.equals(DefaultConverter.convert(JSONUtil.readJSONObject(FileUtil.file(respPath), Charset.defaultCharset()), ApiResult.class).getCode())) {
                zipFile = ZipUtil.zip(srcPath, zipPath, true);
            } else {
                var exportRecordBO = exportRecordBOBuilder
                        .status(ExportStatusEnum.FAILED)
                        .updatedAt(OffsetDateTime.now())
                        .build();
                exportRecordUsecase.saveOrUpdate(exportRecordBO);
            }
            FileUtil.del(respPath);
        }
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
        }finally {
            FileUtil.del(zipFile);
            FileUtil.del(srcPath);
        }

    }

    private void convertExport(String srcPath, String outPath, String respPath) {
        try {
            ProcessBuilder builder = new ProcessBuilder();
            String command = String.format("/Users/fyb/Library/Python/3.9/bin/convert_ctl -src %s -out %s -rps %s --format=coco", srcPath, outPath, respPath);
            builder.command("sh", "-c", command);
            Process process = builder.start();
            BufferedReader in = new BufferedReader(new InputStreamReader(process.getErrorStream()));
            String line = null;
            StringBuilder stringBuilder = new StringBuilder();
            while ((line = in.readLine()) != null) {
                stringBuilder.append(line);
            }
            if (StrUtil.isNotEmpty(stringBuilder.toString())) {
                log.error("convert export file error：{}", stringBuilder);
            }
            in.close();
            int exitCode = process.waitFor();
            assert exitCode == 0;
        } catch (Exception e) {
            log.error("convert export file error", e);
        }
    }

    private <T, Q extends BaseQueryBO> void writeFile(List<T> list, String zipPath, Map<Long, String> classMap, Map<Long, String> resultMap, Q query, Function4<List<T>, Q, Map<Long, String>, Map<Long, String>, List<DataExportBO>> processData) {
        var dataExportBOList = processData.invoke(list, query, classMap, resultMap);
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
