package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.ItemTypeEnum;
import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * @author fyb
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataPreAnnotationBO {

    private Long datasetId;

    private ItemTypeEnum operateItemType;

    private List<Long> dataIds;

    private Long modelId;

    private String modelVersion;

    private String modelCode;

    private JSONObject resultFilterParam;

    private Boolean isFilterData;

}
