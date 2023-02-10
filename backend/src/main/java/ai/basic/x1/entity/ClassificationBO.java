package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.InputTypeEnum;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;

/**
* @author chenchao
* @date 2022/4/2
*/
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ClassificationBO {

    private Long id;

    private Long ontologyId;

    private String name;

    private JSONObject attribute;

    /**
     * input type:'RADIO','MULTI_SELECTION','DROPDOWN','TEXT'
     */
    private InputTypeEnum inputType;

    private Boolean isRequired;

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

    private String ascOrDesc;

    private OffsetDateTime createdAt;

}
