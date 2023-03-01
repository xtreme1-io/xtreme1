package ai.basic.x1.adapter.port.dao.mybatis.model;

import ai.basic.x1.entity.enums.InputTypeEnum;
import cn.hutool.json.JSONArray;
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
 * @date 2022-04-02
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@TableName(autoResultMap = true)
public class DatasetClassification{

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long datasetId;

    private String name;

    private Boolean isRequired;

    private InputTypeEnum inputType;

    @TableField(value = "attribute",typeHandler = JacksonTypeHandler.class)
    private JSONObject attribute;

    /**
     * create time
     */
    @TableField(fill = FieldFill.INSERT)
    private OffsetDateTime createdAt;

    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;

    /**
     * update time
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private OffsetDateTime updatedAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updatedBy;


}