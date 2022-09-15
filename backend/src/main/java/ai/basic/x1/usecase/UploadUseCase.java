package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.UploadRecordDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.UploadRecord;
import ai.basic.x1.entity.UploadRecordBO;
import ai.basic.x1.entity.enums.UploadStatusEnum;
import ai.basic.x1.util.DecompressionFileUtils;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

/**
 * @author fyb
 */
public class UploadUseCase {

    @Autowired
    private UploadRecordDAO uploadRecordDAO;

    public UploadRecordBO createUploadRecord(String fileUrl) {
        var serialNumber = IdUtil.getSnowflakeNextId();
        var fileName = FileUtil.getName(DecompressionFileUtils.removeUrlParameter(fileUrl));
        var uploadRecord = UploadRecord.builder()
                .serialNumber(serialNumber)
                .fileUrl(fileUrl)
                .fileName(fileName)
                .status(UploadStatusEnum.UNSTARTED).build();
        uploadRecordDAO.save(uploadRecord);
        return DefaultConverter.convert(uploadRecord, UploadRecordBO.class);
    }

    /**
     * Modify upload record status and error information based on ID
     *
     * @param id           upload record ID
     * @param uploadStatus upload status
     * @param errorMessage error information
     */
    public void updateUploadRecordStatus(Long id, UploadStatusEnum uploadStatus, String errorMessage) {
        var uploadRecord = UploadRecord.builder()
                .id(id)
                .status(uploadStatus)
                .errorMessage(errorMessage).build();
        uploadRecordDAO.updateById(uploadRecord);
    }

    /**
     * Query import records according to serial number
     *
     * @param serialNumbers Serial number
     * @return Import record collection
     */
    public List<UploadRecordBO> findBySerialNumbers(List<String> serialNumbers) {
        var lambdaQueryWrapper = new LambdaQueryWrapper<UploadRecord>();
        lambdaQueryWrapper.in(UploadRecord::getSerialNumber, serialNumbers);
        var uploadRecordList = uploadRecordDAO.list(lambdaQueryWrapper);
        return DefaultConverter.convert(uploadRecordList, UploadRecordBO.class);
    }
}
