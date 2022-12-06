package ai.basic.x1.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
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
public class DataClassificationOptionBO {

    private Long id;

    private Long datasetId;

    private Long classificationId;

    private String optionName;

    private String attributeId;

    private List<String> optionPath;

    private Long dataAmount;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;

    private Long createdBy;

    private Long updatedBy;

}
