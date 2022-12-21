package ai.basic.x1.adapter.dto;

import ai.basic.x1.entity.enums.SortByEnum;
import ai.basic.x1.entity.enums.SortEnum;
import ai.basic.x1.entity.enums.ToolTypeEnum;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

import javax.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * @author chenchao
 * @date 2022/8/24
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassDTO {

    private Long id;

    @NotNull(message = "ontology id cannot be null")
    private Long ontologyId;

    @Length(max = 256, message = "The length of name should be less than 256.")
    private String name;

    private String color;

    /**
     * tool type:'POLYGON','BOUNDING_BOX','POLYLINE','KEY_POINT','SEGMENTATION','CUBOID'
     */
    @NotNull(message = "toolType cannot be null")
    private ToolTypeEnum toolType;

    private JSONObject toolTypeOptions;

    private JSONArray attributes;

    /**
     * Whether to reset the relationship with the class in the dataset
     */
    private Boolean isResetRelations;

    /**
     * Query value, create start time
     */
    private String startTime;

    /**
     * Query value, create end time
     */
    private String endTime;

    private SortByEnum sortBy;

    private SortEnum ascOrDesc;

    private List<DatasetClass> datasetClasses;

    private Long datasetClassNum;

    private OffsetDateTime createdAt;

    @Data
    public static class DatasetClass {
        private Long id;

        private String name;
    }

}
