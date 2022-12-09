package ai.basic.x1.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author: fyb
 * @date : 2022/11/14 10:46
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageExtraInfoBO {

    /**
     * Camera image width
     */
    private Integer width;

    /**
     * Camera image height
     */
    private Integer height;
}
