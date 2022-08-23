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
     * 流水号
     */
    private Long serialNumber;

    /**
     * 文件ID
     */
    private Long fileId;

    /**
     * 文件名称
     */
    private String fileName;

    /**
     * 状态(UNSTARTED:未开始,GENERATING:生成中,COMPLETED:已完成,FAILED:失败)
     */
    private ExportStatusEnum status;

    /**
     * 已生成数量
     */
    private Integer generatedNum;

    /**
     * 总数
     */
    private Integer totalNum;


    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private OffsetDateTime createdAt;

    /**
     * 创建人ID
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private OffsetDateTime updatedAt;

    /**
     * 更改人ID
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updatedBy;
}