package ai.basic.x1.adapter.port.dao.mybatis.model;

import ai.basic.x1.entity.enums.UploadStatusEnum;
import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * @author fyb
 * @date 2022-08-30 15:14:37
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName(autoResultMap = true)
public class UploadRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * Serial number
     */
    private Long serialNumber;
    /**
     * File url
     */
    private String fileUrl;
    /**
     * File name
     */
    private String fileName;
    /**
     * Error information
     */
    private String errorMessage;
    /**
     * Total file size
     */
    private Long totalFileSize;
    /**
     * Downloaded file size
     */
    private Long downloadedFileSize;
    /**
     * The total number of data
     */
    private Long totalDataNum;
    /**
     * Number of parsed data
     */
    private Long parsedDataNum;
    /**
     * Upload status
     */
    private UploadStatusEnum status;
    /**
     * Creation time
     */
    @TableField(fill = FieldFill.INSERT)
    private OffsetDateTime createdAt;
    /**
     * Creator id
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;
    /**
     * Update time
     */
    @TableField(fill = FieldFill.UPDATE)
    private OffsetDateTime updatedAt;
    /**
     * Modify person id
     */
    @TableField(fill = FieldFill.UPDATE)
    private Long updatedBy;

}