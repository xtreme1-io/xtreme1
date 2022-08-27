package ai.basic.x1.adapter.port.dao.mybatis.model;

import ai.basic.x1.entity.enums.DatasetTypeEnum;
import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * @author wangjiaping
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
     * 本体名称
     */
    private String name;

    /**
     * 数据集类型
     */
    private DatasetTypeEnum type;
    /**
     * 是否删除 1：是 0：否
     */
    private Boolean isDeleted;
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private OffsetDateTime createdAt;
    /**
     * 创建者
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;
    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private OffsetDateTime updatedAt;
    /**
     * 更新者
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updatedBy;

}