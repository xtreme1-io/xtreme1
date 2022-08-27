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
     * 访问地址
     */
    private String accessUrl;

    /**
     * 预签名put地址
     */
    private String presignedUrl;


}
