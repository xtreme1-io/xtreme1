package ai.basic.x1.adapter.port.dao.mybatis.model;

import ai.basic.x1.entity.enums.DatasetTypeEnum;
import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * @author andy
 * @date 2022-04-02 15:49:34
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName(autoResultMap = true)
public class Ontology {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * name
     */
    private String name;

    /**
     * type
     */
    private DatasetTypeEnum type;

    /**
     * create time
     */
    @TableField(fill = FieldFill.INSERT)
    private OffsetDateTime createdAt;
    /**
     * creator
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;
    /**
     * update time
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private OffsetDateTime updatedAt;
    /**
     * updater
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updatedBy;

}