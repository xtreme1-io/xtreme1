package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.InputTypeEnum;
import cn.hutool.json.JSONArray;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;

/**
 * @author chenchao
 * @version 1.0
 * @date 2022/4/11
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetClassificationBO {

    private Long id;

    /**
     * The id of the inherited ontology
     */
    private Long ontologyId;

    /**
     * The id of the inherited classification in the ontology
     */
    private Long classificationId;

    private Long datasetId;

    private String name;

    private JSONArray options;

    /**
     * input type:'RADIO','MULTI_SELECTION','DROPDOWN','TEXT'
     */
    private InputTypeEnum inputType;

    private Boolean isDeleted;

    private Boolean isRequired;

    /**
     * Query value, create start time
     */
    private OffsetDateTime startTime;

    /**
     * Query value, create end time
     */
    private OffsetDateTime endTime;

    private String sortBy;

    private String ascOrDesc;
}
