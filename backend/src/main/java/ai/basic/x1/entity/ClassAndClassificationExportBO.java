package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.InputTypeEnum;
import ai.basic.x1.entity.enums.ToolTypeEnum;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author chenchao
 * @date 2022/12/9
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassAndClassificationExportBO {

    private List<Class> classes;

    private List<Classification> classifications;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Class{

        private Long id;

        private String name;

        private String color;

        private ToolTypeEnum toolType;

        /**
         * Type configuration properties
         */
        private JSONObject toolTypeOptions;

        private JSONArray attributes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Classification{

        private Long id;

        private String name;

        private Boolean isRequired;

        private InputTypeEnum inputType;

        /**
         * setting
         */
        private JSONObject attribute;
    }
}
