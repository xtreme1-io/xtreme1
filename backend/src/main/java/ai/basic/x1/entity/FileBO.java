package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.RelationEnum;
import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * @author: fyb
 * @date : 2022/2/7 15:46
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileBO {

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
     * Relation file id
     */
    private Long relationId;

    /**
     * Relation(LARGE_THUMBTHUMBNAIL, MEDIUM_THUMBTHUMBNAIL,SMALL_THUMBTHUMBNAIL,BINARY,BINARY_COMPRESSED)
     */
    private RelationEnum relation;

    /**
     * Hash value after path MD5
     */
    private Long pathHash;

    /**
     * Create time
     */
    private OffsetDateTime createdAt;

    /**
     * Creator id
     */
    private Long createdBy;

    /**
     * Update time
     */
    private OffsetDateTime updatedAt;

    /**
     * Modify person id
     */
    private Long updatedBy;

    /**
     * File  url
     */
    private String url;

    /**
     * File internal url
     */
    private String internalUrl;

    /**
     * File extension information
     */
    private JSONObject extraInfo;

}
