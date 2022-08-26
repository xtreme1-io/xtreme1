package ai.basic.x1.adapter.dto;


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
public class PresignedUrlDTO {

    /**
     * 访问地址
     */
    private String accessUrl;

    /**
     * 预签名上传地址
     */
    private String presignedUrl;

}
