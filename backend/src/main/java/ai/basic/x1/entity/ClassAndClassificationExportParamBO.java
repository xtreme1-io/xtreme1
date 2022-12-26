package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.ClassAndClassificationSourceEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * @author chenchao
 * @date 2022/12/12
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ClassAndClassificationExportParamBO extends BaseQueryBO {

    private Long sourceId;

    private ClassAndClassificationSourceEnum sourceType;
}
