package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.ExportRecordDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.ExportRecord;
import ai.basic.x1.entity.ExportRecordBO;
import ai.basic.x1.entity.enums.ExportStatusEnum;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.collection.CollectionUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
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

    public List<ExportRecordBO> findBySerialNumbers(List<String> serialNumbers) {
        var lambdaQueryWrapper = new LambdaQueryWrapper<ExportRecord>();
        lambdaQueryWrapper.in(ExportRecord::getSerialNumber, serialNumbers);
        var exportRecordList = exportRecordDAO.list(lambdaQueryWrapper);
        var exportRecordBOList = DefaultConverter.convert(exportRecordList, ExportRecordBO.class);
        if (CollectionUtil.isNotEmpty(exportRecordBOList)) {
            var fileIds = exportRecordBOList.stream()
                    .filter(exportRecordBO -> ExportStatusEnum.COMPLETED.equals(exportRecordBO.getStatus()))
                    .map(ExportRecordBO::getFileId)
                    .collect(Collectors.toList());
            if (CollectionUtil.isNotEmpty(fileIds)) {
                /*var fileQueryDTO = FileQueryDTO.builder().ids(fileIds).build();
                var apiResult = storageService.list(fileQueryDTO);
                if (UsecaseCode.OK.equals(apiResult.getCode())) {
                    var fileMap = apiResult.getData().stream().collect(Collectors.toMap(FileDTO::getId, fileDTO -> fileDTO));
                    exportRecordBOList.forEach(exportRecordBO -> {
                        var fileDTO = fileMap.get(exportRecordBO.getFileId());
                        if(ObjectUtil.isNotNull(fileDTO)){
                            exportRecordBO.setFilePath(ossService.getPresignedUrl(fileDTO.getPath(),fileDTO.getBucketName()));
                        }
                    });
                } else {
                    logger.error("get file error,message:{}", apiResult.getMessage());
                    throw new UsecaseException(apiResult.getCode(), apiResult.getMessage());
                }*/
            }
        }
        return exportRecordBOList;
    }

}
