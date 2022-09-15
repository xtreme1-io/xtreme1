package ai.basic.x1.adapter.port.dao.mybatis.model;

import ai.basic.x1.entity.enums.ExportStatusEnum;
import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * @author fyb
 * @date 2022-04-21 11:48:13
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName(autoResultMap = true)
public class ExportRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * Serial number
     */
    private Long serialNumber;

    /**
     * File id
     */
    private Long fileId;

    /**
     * File name
     */
    private String fileName;

    /**
     * Export status(UNSTARTED,GENERATING,COMPLETED,FAILED)
     */
    private ExportStatusEnum status;

    /**
     * Generated number
     */
    private Integer generatedNum;

    /**
     * Export total number
     */
    private Integer totalNum;


    /**
     * Create time
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