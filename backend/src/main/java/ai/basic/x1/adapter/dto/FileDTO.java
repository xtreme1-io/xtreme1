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

    /**
     * File id
     */
    private Long id;

    /**
     * File name
     */
    private String name;

    /**
     * File original name
     */
    private String originalName;

    /**
     * File upload path
     */
    private String path;

    /**
     *  The path in the compressed package
     */
    private String zipPath;

    /**
     * File type
     */
    private String type;

    /**
     * File size
     */
    private Long size;

    /**
     * Bucket name
     */
    private String bucketName;

    /**
     * File  url
     */
    private String url;

    /**
     * Hash value after path MD5
     */
    private Long pathHash;

    /**
     * File extension information
     */
    private JSONObject extraInfo;

}
