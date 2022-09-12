package ai.basic.x1.entity;


import cn.hutool.json.JSONObject;
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
public class DataExportBaseBO {

    /**
     * Export version
     */
    private String version;

    /**
     * Dataset name
     */
    private String datasetName;

    /**
     * Export time
     */
    private String exportTime;

    /**
     * Export content
     */
    private List<JSONObject> contents;
}
