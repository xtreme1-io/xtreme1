package ai.basic.x1.entity;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author fyb
 * @date 2022/5/5 14:36
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresignedUrlBO {

    /**
     * Access url
     */
    private String accessUrl;

    /**
     * Pre-signed upload address
     */
    private String presignedUrl;


}
