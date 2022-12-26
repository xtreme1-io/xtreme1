package ai.basic.x1.adapter.port.dao.mybatis.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;

/**
 * @author chenchao
 * @date 2022/12/2
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@TableName(autoResultMap = true)
public class DatasetClassOntology {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long datasetClassId;

    private Long ontologyId;

    private Long classId;

    @TableField(fill = FieldFill.INSERT)
    private OffsetDateTime createdAt;

    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private OffsetDateTime updatedAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updatedBy;

    @TableField(exist = false)
    private Long datasetClassNum;
}
