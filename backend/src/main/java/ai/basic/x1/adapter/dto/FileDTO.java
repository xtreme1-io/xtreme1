package ai.basic.x1.adapter.dto;

import cn.hutool.json.JSONObject;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author fyb
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME,defaultImpl = FileDTO.class)
@JsonTypeName("file")
@JsonSubTypes({
        @JsonSubTypes.Type(value = ImageFileDTO.class, name = "imageFile"),
        @JsonSubTypes.Type(value = PcdFileDTO.class, name = "pcdFile")
})
public class FileDTO {
    private Long id;

    /**
     * 文件名称（上传后的新名称）
     */
    private String name;

    /**
     * 原名称
     */
    private String originalName;

    /**
     * 文件上传后的路径
     */
    private String path;

    /**
     * 文件类型MIME
     */
    private String type;

    /**
     * 文件大小
     */
    private Long size;

    /**
     * 区域
     */
    private String region;

    /**
     * 文件存储的桶名称
     */
    private String bucketName;

    /**
     * 外网URL
     */
    private String url;

    /**
     * 内网URL
     */
    private String internalUrl;

    /**
     * path MD5后 Hash值
     */
    private Long pathHash;

    /**
     * 文件扩展信息
     */
    private JSONObject extraInfo;

}
