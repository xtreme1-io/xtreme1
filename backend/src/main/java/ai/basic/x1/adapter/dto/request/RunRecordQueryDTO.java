package ai.basic.x1.adapter.dto.request;

import ai.basic.x1.adapter.api.annotation.valid.ValidStringEnum;
import ai.basic.x1.entity.enums.RunRecordTypeEnum;
import ai.basic.x1.entity.enums.RunStatusEnum;
import ai.basic.x1.entity.enums.SortEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RunRecordQueryDTO {

    @NotNull(message = "not allow null")
    private Long modelId;

    private List<Long> datasetIds;

    private String runNo;

    @ValidStringEnum(message = "runRecordType must be one of IMPORTED,RUNS", enumClass = RunRecordTypeEnum.class)
    private String runRecordType;

    @ValidStringEnum(message = "ascOrDesc must be one of STARTED,RUNNING,SUCCESS,SUCCESS_WITH_ERROR,FAILURE", enumClass = RunStatusEnum.class)
    private String status;

    @ValidStringEnum(message = "ascOrDesc must be one of ASC,DESC", enumClass = SortEnum.class)
    private String ascOrDesc;
}
