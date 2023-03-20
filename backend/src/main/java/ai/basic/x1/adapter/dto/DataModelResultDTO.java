package ai.basic.x1.adapter.dto;

import ai.basic.x1.adapter.port.rpc.dto.DatasetModelResultDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataModelResultDTO {

    private String modelName;

    private Long modelId;

    private List<RunRecordDTO> runRecords;

}
