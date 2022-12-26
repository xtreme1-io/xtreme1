package ai.basic.x1.adapter.port.dao.mybatis.model;

import ai.basic.x1.adapter.port.dao.mybatis.typehandler.ModelClassTypeHandler;
import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * @author zhujh
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@TableName(autoResultMap = true)
public class DataClassificationOption {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long datasetId;

    private Long dataId;

    private Long classificationId;

    private String attributeId;

    private String optionName;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<String> optionPath;

    @TableField(fill = FieldFill.INSERT)
    private OffsetDateTime createdAt;

    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;

    @TableField(fill = FieldFill.UPDATE)
    private OffsetDateTime updatedAt;

    @TableField(fill = FieldFill.UPDATE)
    private Long updatedBy;

    @TableField(exist = false)
    private Long dataAmount;

    @TableField(exist = false, typeHandler = JacksonTypeHandler.class)
    private List<List<String>> optionPaths;

    @TableField(exist = false)
    private Integer optionCount;
}
