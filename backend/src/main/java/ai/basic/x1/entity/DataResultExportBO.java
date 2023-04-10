package ai.basic.x1.entity;


import cn.hutool.json.JSONArray;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataResultExportBO {

    /**
     * version
     */
    private String version;

    /**
     * Data id
     */
    private Long dataId;

    /**
     * Source name
     */
    private String sourceName;

    /**
     * Classification values
     */
    private JSONArray classificationValues;

    /**
     * Object list
     */
    private List<DataResultObjectExportBO> objects;

}
