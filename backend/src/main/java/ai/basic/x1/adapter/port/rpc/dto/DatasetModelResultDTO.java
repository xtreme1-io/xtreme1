package ai.basic.x1.adapter.port.rpc.dto;

import ai.basic.x1.adapter.dto.RunRecordDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author fyb
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetModelResultDTO {


    private String modelName;

    private Long modelId;

    private List<RunRecordDTO> runRecords;

}


