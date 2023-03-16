package ai.basic.x1.entity;

import cn.hutool.json.JSONObject;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * @author fyb
 * @date 2022-05-11 19:55:20
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelDataResultBO {

    /**
     * Model data result id
     */
    private Long id;

    /**
     * Model id
     */
    private Long modelId;

    /**
     * Model version
     */
    private String modelVersion;

    /**
     * Dataset id
     */
    private Long datasetId;

    /**
     * Data id
     */
    private Long dataId;

    /**
     * Model results filtering parameters
     */
    private String resultFilterParam;

    /**
     * Model result
     */
    private JSONObject modelResult;

    /**
     * Model serial number
     */
    private Long modelSerialNo;

    /**
     * Create time
     */
    private OffsetDateTime createdAt;

    /**
     * Creator id
     */
    private Long createdBy;

    /**
     * Update time
     */
    private OffsetDateTime updatedAt;

    /**
     * Modify person id
     */
    private Long updatedBy;


}