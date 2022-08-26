package ai.basic.x1.adapter.port.dao.mybatis.model;

import ai.basic.x1.adapter.port.dao.mybatis.typeHandler.ModelClassTypeHandler;
import ai.basic.x1.entity.enums.DatasetTypeEnum;
import ai.basic.x1.entity.enums.ModelCodeEnum;
import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * @author chenchao
 * @data 2022/8/26
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName(autoResultMap = true)
public class Model {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    /**
     * model version
     */
    private String version;

    private Boolean isDeleted;

    private String description;

    /**
     * Scenes
     */
    private String scenario;

    /**
     * recognizable thing(class)
     */
    @TableField(typeHandler = ModelClassTypeHandler.class)
    private List<ModelClass> classes;

    /**
     * Supported dataset types
     */
    private DatasetTypeEnum datasetType;

    /**
     * Determine the uniqueness of the model
     */
    private ModelCodeEnum modelCode;

    @TableField(fill = FieldFill.INSERT)
    private OffsetDateTime createdAt;

    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private OffsetDateTime updatedAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updatedBy;

}
