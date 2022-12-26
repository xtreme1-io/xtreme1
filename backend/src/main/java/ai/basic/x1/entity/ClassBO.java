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
 * @author chenchao
 * @date 2022-03-11
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassBO {


    private Long id;

    private Long ontologyId;

    private String name;

    private String color;

    /**
     * tool type:'POLYGON','BOUNDING_BOX','POLYLINE','KEY_POINT','SEGMENTATION','CUBOID'
     */
    private ToolTypeEnum toolType;

    private JSONObject toolTypeOptions;

    private JSONArray attributes;

    /**
     * Query value, create start time
     */
    private OffsetDateTime startTime;

    /**
     * Query value, create end time
     */
    private OffsetDateTime endTime;

    /**
     * collation
     */
    private String sortBy;

    /**
     * Whether to sort in ascending order
     */
    private String ascOrDesc;

    /**
     * the number of class
     */
    private Integer classNum;

    /**
     * Whether to reset the relationship with the class in the dataset
     */
    private Boolean isResetRelations;

    private List<DatasetClass> datasetClasses;

    private Long datasetClassNum;

    private OffsetDateTime createdAt;

    @Data
    @Builder
    public static class DatasetClass {
        private Long id;

        private String name;
    }

}