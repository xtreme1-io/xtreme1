package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.ExportRecordDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.ExportRecord;
import ai.basic.x1.adapter.port.minio.MinioService;
import ai.basic.x1.entity.ExportRecordBO;
import ai.basic.x1.entity.FileBO;
import ai.basic.x1.entity.enums.ExportStatusEnum;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.util.ObjectUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * @author fyb
 * @date 2022/3/16 10:31
 */
public class ExportRecordUseCase {

    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Autowired
    private ExportRecordDAO exportRecordDAO;

    @Autowired
    private FileUseCase fileUseCase;

    @Autowired
    private MinioService minioService;

    public List<ExportRecordBO> findBySerialNumbers(List<String> serialNumbers) {
        var lambdaQueryWrapper = new LambdaQueryWrapper<ExportRecord>();
        lambdaQueryWrapper.in(ExportRecord::getSerialNumber, serialNumbers);
        var exportRecordList = exportRecordDAO.list(lambdaQueryWrapper);
        var exportRecordBOList = DefaultConverter.convert(exportRecordList, ExportRecordBO.class);
        if (CollectionUtil.isNotEmpty(exportRecordBOList)) {
            var fileIds = Objects.requireNonNull(exportRecordBOList).stream()
                    .filter(exportRecordBO -> ExportStatusEnum.COMPLETED.equals(exportRecordBO.getStatus()))
                    .map(ExportRecordBO::getFileId)
                    .collect(Collectors.toList());
            if (CollectionUtil.isNotEmpty(fileIds)) {
                var fileBOS = fileUseCase.findByIds(fileIds);
                var fileMap = fileBOS.stream().collect(Collectors.toMap(FileBO::getId, fileBO -> fileBO, (k1, k2) -> k1));
                exportRecordBOList.forEach(exportRecordBO -> {
                    var fileBO = fileMap.get(exportRecordBO.getFileId());
                    if (ObjectUtil.isNotNull(fileBO)) {
                        try {
                            exportRecordBO.setFilePath(minioService.getPresignedUrl(fileBO.getBucketName(), fileBO.getPath()));
                        } catch (Exception e) {
                            logger.error("Get url error", e);
                            throw new UsecaseException("Get url error");
                        }
                    }
                });
            }
        }
        return exportRecordBOList;
    }

    public void saveOrUpdate(ExportRecordBO exportRecordBO) {
        exportRecordDAO.saveOrUpdate(DefaultConverter.convert(exportRecordBO,ExportRecord.class));
    }

}
