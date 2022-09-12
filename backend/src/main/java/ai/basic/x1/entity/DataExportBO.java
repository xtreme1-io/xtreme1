package ai.basic.x1.entity;

import cn.hutool.json.JSON;
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
public class DataExportBO {

    /**
     * name
     */
    private String name;

    /**
     * Data information
     */
    private JSON data;

    @Data
    public static class Result {

        /**
         * Classifications
         */
        private List<JSON> classifications;

        /**
         * Annotation results
         */
        private List<JSONObject> objects;
    }
}
