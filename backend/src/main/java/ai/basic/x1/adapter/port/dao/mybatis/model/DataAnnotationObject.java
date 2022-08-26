package ai.basic.x1.adapter.port.dao.mybatis.model;

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

    /**
     * 数据集ID
     */
    private Long datasetId;

    /**
     * 数据ID
     */
    private Long dataId;

    /**
     * 类型ID
     */
    private Long classId;

    /**
     * 对象标注属性
     */
    @TableField(value = "class_attributes", typeHandler = JacksonTypeHandler.class)
    private JSONObject classAttributes;

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

    @TableField(exist = false)
    private Integer objectCount;

    @TableField(exist = false)
    private String frontId;
}
