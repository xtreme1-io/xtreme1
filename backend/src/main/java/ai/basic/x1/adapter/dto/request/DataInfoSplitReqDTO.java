package ai.basic.x1.adapter.dto.request;

import ai.basic.x1.adapter.api.annotation.valid.ValidStringEnum;
import ai.basic.x1.entity.enums.DataAnnotationStatusEnum;
import ai.basic.x1.entity.enums.SplitTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;
import java.util.List;

/**
 * @author fyb
 * @date 2023/3/3 13:58
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataInfoSplitReqDTO {

    @NotEmpty(message = "dataIds cannot be null")
    private List<Long> dataIds;

    @ValidStringEnum(message = "splitType must be one of TRAINING,VALIDATION,TEST,NOT_SPLIT", enumClass = SplitTypeEnum.class)
    @NotEmpty(message = "splitType cannot be null")
    private String splitType;
}
