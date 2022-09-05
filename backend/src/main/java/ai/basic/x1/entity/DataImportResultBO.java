package ai.basic.x1.entity;

import cn.hutool.json.JSONObject;
import lombok.Data;

import java.util.List;

@Data
public class DataImportResultBO {

    /**
     * Data result information
     */
    private ResultBO result;

    @Data
    public static class ResultBO {

        /**
         * Result name
         */
        private String resultName;

        /**
         * Annotation results
         */
        private List<JSONObject> objects;
    }
}
