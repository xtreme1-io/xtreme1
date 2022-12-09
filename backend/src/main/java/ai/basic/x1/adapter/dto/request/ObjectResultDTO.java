package ai.basic.x1.adapter.dto.request;

import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * @author chenchao
 * @date 2022/8/26
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ObjectResultDTO {

    @NotNull
    private Long datasetId;

    @Valid
    @NotEmpty
    private List<DataInfo> dataInfos;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DataInfo{

        @NotNull(message = "dataId cannot null")
        private Long dataId;

        @Valid
        private List<DataAnnotationObject> objects;

        @Valid
        private List<DataAnnotation> dataAnnotations;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DataAnnotationObject {

        private Long id;

        /**
         * The unique id passed by the frontend when saving
         */
        private String frontId;

        private Long classId;

        private JSONObject classAttributes;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DataAnnotation {

        private Long id;

        @NotNull(message = "classificationId cannot null")
        private Long classificationId;

        private JSONObject classificationAttributes;
    }
}
