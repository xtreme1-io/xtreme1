package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.ExportRecordDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.ExportRecord;
import ai.basic.x1.adapter.port.minio.MinioProp;
import ai.basic.x1.adapter.port.minio.MinioService;
import ai.basic.x1.entity.BaseQueryBO;
import ai.basic.x1.entity.ExportRecordBO;
import ai.basic.x1.entity.FileBO;
import ai.basic.x1.entity.enums.ExportStatusEnum;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.Page;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.date.DatePattern;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONConfig;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Assert;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.function.Function;

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

    @Value("${file.tempPath:/tmp}")
    private String tempPath;

    @FunctionalInterface
    public interface Function2<A, B, R> {
        R apply(A a, B b);
    }

    /**
     * create export record
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

    /**
     * Asynchronous export files obtain the file path according to the return flow number number
     *
     * @param fileName     filename
     * @param firstContent first content
     * @param lastContent  last content
     * @param query        query condition
     * @param fun          query method
     * @param processData  data processor
     * @return 流水号
     */
    public <T, Q extends BaseQueryBO, T1> Long asyncExportJson(String fileName, Long serialNumber,
                                                               String firstContent, String lastContent,
                                                               Q query, Function<Q, Page<T>> fun,
                                                               Function2<List<T>, Q, List<T1>> processData) {
        var lambdaQueryWrapper = new LambdaQueryWrapper<ExportRecord>();
        lambdaQueryWrapper.in(ExportRecord::getSerialNumber, serialNumber);
        var exportRecord = exportRecordDAO.getOne(lambdaQueryWrapper);
        var fullPath = String.format("%s/%s/%s.json", tempPath, System.currentTimeMillis(), FileUtil.getPrefix(fileName));
        var file = FileUtil.newFile(fullPath);
        FileUtil.mkParentDirs(file);
        getDataAndUpload(exportRecord, file, firstContent, lastContent, query, fun, processData);
        return serialNumber;
    }

    private <T, Q extends BaseQueryBO, T1> void getDataAndUpload(ExportRecord record, File file, String firstContent,
                                                                 String lastContent, Q query, Function<Q, Page<T>> fun,
                                                                 Function2<List<T>, Q, List<T1>> processData) {
        var rootPath = String.format("%s/%s", record.getCreatedBy(), System.currentTimeMillis());
        var exportRecordBuilder = ExportRecord.builder()
                .id(record.getId())
                .updatedBy(record.getCreatedBy())
                .updatedAt(OffsetDateTime.now());
        try (var write = new OutputStreamWriter(new FileOutputStream(file), StandardCharsets.UTF_8)) {
            //往文件最开始位置写入内容
            if (StrUtil.isNotBlank(firstContent)) {
                write.write(firstContent);
                write.flush();
            }
            int i = 1;
            while (true) {
                query.setPageNo(i);
                var page = fun.apply(query);
                if (ObjectUtil.isNull(page) || CollectionUtil.isEmpty(page.getList())) {
                    //往文件结束位置写入内容
                    if (StrUtil.isNotBlank(lastContent)) {
                        write.write(lastContent);
                        write.flush();
                    }
                    var path = String.format("%s/%s", rootPath, file.getName());
                    try {
                        var fileBO = FileBO.builder().name(file.getName()).originalName(file.getName()).bucketName(minioProp.getBucketName())
                                .size(file.length()).path(path).type(FileUtil.getMimeType(path)).build();
                        var resFileBOS = fileUseCase.saveBatchFile(record.getCreatedBy(), Collections.singletonList(fileBO));
                        minioService.uploadFile(minioProp.getBucketName(), path, FileUtil.getInputStream(file), FileUtil.getMimeType(path), file.length());
                        var exportRecord = exportRecordBuilder
                                .fileId(CollectionUtil.getFirst(resFileBOS).getId())
                                .status(ExportStatusEnum.COMPLETED)
                                .generatedNum(page.getTotal())
                                .totalNum(page.getTotal())
                                .updatedAt(OffsetDateTime.now())
                                .build();
                        exportRecordDAO.saveOrUpdate(exportRecord);
                    } catch (Exception e) {
                        logger.error("Upload file error", e);
                        throw new UsecaseException("Upload file error!");
                    }
                    break;
                }
                var jsonConfig = JSONConfig.create().setDateFormat(DatePattern.NORM_DATETIME_PATTERN);
                var list = page.getList();
                var jsonString = JSONUtil.toJsonStr(null != processData ? processData.apply(list, query) : list, jsonConfig);
                //DefaultConverter
                write.write(jsonString.substring(1, jsonString.length() - 1));
                write.flush();
                var listSize = page.getList().size();
                var exportRecord = exportRecordBuilder
                        .generatedNum((page.getPageNo() - 1) * page.getPageSize() + listSize)
                        .totalNum(page.getTotal())
                        .updatedAt(OffsetDateTime.now())
                        .build();
                exportRecordDAO.saveOrUpdate(exportRecord);
                i++;
            }
        } catch (IOException e) {
            logger.error("export data error", e);
            var exportRecord = exportRecordBuilder
                    .status(ExportStatusEnum.FAILED)
                    .updatedAt(OffsetDateTime.now())
                    .build();
            exportRecordDAO.saveOrUpdate(exportRecord);
            throw new UsecaseException("export data error,message:" + e.getMessage() + "");
        }
    }

    /**
     * 根据流水号查询导出记录
     *
     * @param serialNumbers 流水号
     * @return 导出记录
     */
    public List<ExportRecordBO> findExportRecordBySerialNumbers(List<String> serialNumbers) {
        Assert.notEmpty(serialNumbers, "serial number cannot be null");
        return exportRecordUsecase.findBySerialNumbers(serialNumbers);
    }

}
