package ai.basic.x1.entity.enums;

import ai.basic.x1.adapter.api.annotation.valid.ValidStringEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RunRecordQueryBO {

    private Long modelId;

    private String runNo;

    private List<Long> datasetIds;

    private RunRecordTypeEnum runRecordType;

    private RunStatusEnum status;

    private SortEnum ascOrDesc;
}
