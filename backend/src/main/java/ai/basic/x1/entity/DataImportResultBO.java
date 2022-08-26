package ai.basic.x1.entity;

import cn.hutool.json.JSONObject;
import lombok.Data;

import java.util.List;

@Data
public class DataImportResultBO {

    /**
     * 数据信息
     */
    private List<ResultBO> results;

    @Data
    public static class ResultBO {

        /**
         * 结果名称
         */
        private String resultName;

        /**
         * 标注结果
         */
        private List<JSONObject> objects;
    }
}
