package ai.basic.x1.adapter.port.dao.mybatis.model;

import ai.basic.x1.entity.enums.DataAnnotationObjectSourceTypeEnum;
import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;

/**
 * @author chenchao
 * @date 2022/8/26
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@TableName(autoResultMap = true)
public class DataAnnotationObject {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long datasetId;

    private Long dataId;

    private Long classId;

    @TableField(value = "class_attributes", typeHandler = JacksonTypeHandler.class)
    private JSONObject classAttributes;

    private Long sourceId;

    private DataAnnotationObjectSourceTypeEnum sourceType;

    @TableField(fill = FieldFill.INSERT)
    private OffsetDateTime createdAt;

    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private OffsetDateTime updatedAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updatedBy;

    @TableField(exist = false)
    private Integer objectCount;

    @TableField(exist = false)
    private String frontId;
}
