package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.ClassAndClassificationSourceEnum;
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
 * @date 2022/12/12
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassAndClassificationImportBO {

    private Boolean isDuplicate;

    private ClassAndClassificationSourceEnum desType;

    private Long desId;

    private Integer classTotalSize;

    private Integer classificationTotalSize;

    private Integer validClassSize;

    private Integer validClassificationSize;

    private List<Class> classes;

    private List<Classification> classifications;

    private List<ClassIdentifier> duplicateClassName;

    private List<String> duplicateClassificationName;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Class{
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
    public static class ClassIdentifier{
        private String name;

        private ToolTypeEnum toolType;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Classification{

        private String name;

        private Boolean isRequired;

        private InputTypeEnum inputType;

        /**
         * setting
         */
        private JSONArray options;
    }
}
