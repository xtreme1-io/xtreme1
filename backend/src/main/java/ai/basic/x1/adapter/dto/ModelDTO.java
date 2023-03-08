package ai.basic.x1.adapter.dto;

import ai.basic.x1.entity.enums.ModelCodeEnum;
import ai.basic.x1.entity.enums.ModelDatasetTypeEnum;
import ai.basic.x1.entity.enums.ModelTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author chenchao
 * @date 2022/8/26
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelDTO {


    private Long id;

    private String name;

    /**
     * model version
     */
    private String version;

    private String description;

    /**
     * Scenes
     */
    private String scenario;

    /**
     * recognizable thing(class)
     */
    private List<ModelClassDTO> classes;

    /**
     * Supported dataset types
     */
    private ModelDatasetTypeEnum datasetType;

    /**
     * Determine the uniqueness of the model
     */
    private ModelCodeEnum modelCode;

    /**
     * Model url
     */
    private String url;

    /**
     * Model type
     */
    private ModelTypeEnum modelType;
}
