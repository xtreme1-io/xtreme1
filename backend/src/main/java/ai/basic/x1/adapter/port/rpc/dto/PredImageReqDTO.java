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

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ImageData {

        private String url;

        private Long id;

    }

}
