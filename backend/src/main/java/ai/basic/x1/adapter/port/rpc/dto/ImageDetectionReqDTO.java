package ai.basic.x1.adapter.port.rpc.dto;

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
public class ImageDetectionReqDTO {

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
