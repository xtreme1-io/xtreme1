package ai.basic.x1.entity;

import cn.hutool.json.JSON;
import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataExportBO {

    /**
     * 名称
     */
    private String name;

    /**
     * 数据信息
     */
    private JSON data;

    @Data
    public static class Result {

        /**
         * 类别
         */
        private List<JSON> classifications;

        /**
         * 标注结果
         */
        private List<JSONObject> objects;
    }
}
