package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.ToolTypeEnum;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * @author andy
 * @date 2022-03-11 12:54:35
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetClassBO {

    /**
     * id
     */
    private Long id;

    /**
     * The id of the inherited ontology
     */
    private Long ontologyId;

    /**
     * The id of the inherited classification in the ontology
     */
    private Long classId;

    /**
     * datasetId
     */
    private Long datasetId;

    private String name;

    private String color;

    private ToolTypeEnum toolType;

    private JSONObject toolTypeOptions;

    private JSONArray attributes;

    /**
     * number of class in one dataset
     */
    private Integer datasetClassNum;

    /**
     * query param
     */
    private String sortBy;


    private String ascOrDesc;

    /**
     * Query value, create start time
     */
    private OffsetDateTime startTime;

    /**
     * Query value, create end time
     */
    private OffsetDateTime endTime;

    private List<Long> classIds;

    private OffsetDateTime createdAt;


}