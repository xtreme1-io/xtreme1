package ai.basic.x1.entity;

import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DataAnnotationResultObjectBO {

    /**
     * Object id
     */
    private String id;

    /**
     * type
     */
    private String type;

    /**
     * Version, initially 0, +1 every time it is changed
     */
    private Integer version;

    /**
     *
     * Tracking object id
     */
    private String trackId;

    /**
     * Track object name
     */
    private String trackName;

    /**
     * Class id
     */
    private Long classId;

    private String className;

    /**
     * Selected type attribute value
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
