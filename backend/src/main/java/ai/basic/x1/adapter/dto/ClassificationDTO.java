package ai.basic.x1.adapter.dto;

import ai.basic.x1.entity.enums.InputTypeEnum;
import ai.basic.x1.entity.enums.SortByEnum;
import ai.basic.x1.entity.enums.SortEnum;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import javax.validation.constraints.NotNull;
import java.time.OffsetDateTime;

/**
* @author chenchao
* @date 2022/4/2
*/
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ClassificationDTO {

    private Long id;

    @NotNull(message = "ontology id cannot be null")
    private Long ontologyId;

    private String name;

    private JSONObject attribute;

    private JSONArray options;

    /**
     * input type:'RADIO','MULTI_SELECTION','DROPDOWN','TEXT'
     */
    private InputTypeEnum inputType;

    private Boolean isRequired;


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

    private OffsetDateTime createdAt;
}
