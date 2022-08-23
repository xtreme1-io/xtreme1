package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.ExportRecordDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.ExportRecord;
import ai.basic.x1.entity.BaseQueryBO;
import ai.basic.x1.entity.ExportRecordBO;
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
import java.util.List;
import java.util.function.Function;

public class ExportUseCase {

    @Value("${file.tempPath:/temp/}")
    private String tempPath;

    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Autowired
    private ExportRecordUseCase exportRecordUsecase;

    @Autowired
    private ExportRecordDAO exportRecordDAO;

    @FunctionalInterface
    public interface Function2<A, B, R> {
        R apply(A a, B b);
    }

    /**
     * 创建导出记录
     *
     * @return 流水号
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
     * 异步导出文件 根据返回流水号获取文件路径
     *
     * @param fileName     文件名称
     * @param firstContent 文件最开始写入内容
     * @param lastContent  文件最后写入内容
     * @param query        查询条件
     * @param fun          查询数据函数
     * @param processData  需要对查询回来的数据进行处理
     * @return 流水号
     */
    public <T, Q extends BaseQueryBO, T1> Long asyncExportJson(String fileName, Long serialNumber,
                                                               String firstContent, String lastContent,
                                                               Q query, Function<Q, Page<T>> fun,
                                                               Function2<List<T>, Q, List<T1>> processData) {
        var lambdaQueryWrapper = new LambdaQueryWrapper<ExportRecord>();
        lambdaQueryWrapper.in(ExportRecord::getSerialNumber, serialNumber);
        var exportRecord = exportRecordDAO.getOne(lambdaQueryWrapper);
        var fullPath = String.format("%s%s/%s.json", tempPath, System.currentTimeMillis(), FileUtil.getPrefix(fileName));
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
                    /*ossService.uploadFile(path, file, datasetBucketName);
                    var fileDTOs = new ArrayList<FileDTO>();
                    var mimeType = MimeUtil.getMimeTypes(file).stream().findFirst().orElse("").toString();
                    var fileDTO = FileDTO.builder().name(file.getName()).originalName(file.getName()).region(region).bucketName(datasetBucketName)
                            .size(file.length()).path(path).type(mimeType).build();
                    fileDTOs.add(fileDTO);
                    var apiResult = storageService.saveBatchFile(fileDTOs);
                    if (UsecaseCode.OK.equals(apiResult.getCode())) {
                        var exportRecord = exportRecordBuilder
                                .fileId(CollectionUtil.getFirst(apiResult.getData()).getId())
                                .status(ExportEnum.COMPLETED)
                                .generatedNum(page.getTotal())
                                .totalNum(page.getTotal())
                                .updatedAt(OffsetDateTime.now())
                                .build();
                        exportRecordDAO.saveOrUpdate(exportRecord);
                    } else {
                        logger.error("upload file error,message:{}", apiResult.getMessage());
                        throw new UsecaseException("upload file error");
                    }*/
                    break;
                }
                var jsonConfig = JSONConfig.create().setDateFormat(DatePattern.NORM_DATETIME_PATTERN).setOrder(true);
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
