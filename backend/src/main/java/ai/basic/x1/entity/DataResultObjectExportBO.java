package ai.basic.x1.entity;

import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DataResultObjectExportBO {

    /**
     * Object id
     */
    private String id;

    /**
     * Type
     */
    private String type;

    /**
     * Class id
     */
    private Long classId;

    /**
     * Class name
     */
    private String className;

    /**
     * Track id
     */
    private String trackId;

    /**
     * Track name
     */
    private String trackName;

    /**
     * Class values
     */
    private JSONArray classValues;

    /**
     * Profile information
     */
    private JSONObject contour;

    /**
     * Confidence of model recognition, only available for model recognition
     */
    private BigDecimal modelConfidence;

    /**
     * The category identified by the model is only available when the model is identified
     */
    private String modelClass;

}
