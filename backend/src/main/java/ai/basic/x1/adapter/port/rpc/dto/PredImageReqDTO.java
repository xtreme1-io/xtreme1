package ai.basic.x1.adapter.port.rpc.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author Zhujh
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredImageReqDTO {

    private List<ImageData> datas;

    private String params;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ImageData {

        @JsonProperty(value = "img_url", access = JsonProperty.Access.READ_ONLY)
        private String imgUrl;

        @JsonProperty(value = "image_id", access = JsonProperty.Access.READ_ONLY)
        private Long imageId;

    }

}
