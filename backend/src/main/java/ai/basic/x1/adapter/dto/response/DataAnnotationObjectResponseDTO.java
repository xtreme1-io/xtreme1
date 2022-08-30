package ai.basic.x1.adapter.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author chenchao
 * @date 2022/8/26
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataAnnotationObjectResponseDTO {

    private Long id;

    private Long dataId;

    private String frontId;
}
