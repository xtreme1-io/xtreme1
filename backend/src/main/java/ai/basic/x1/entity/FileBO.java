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
     * 文件存储的桶名称
     */
    private String bucketName;

    /**
     * 关联原始文件ID
     */
    private Long relationId;

    /**
     * 文件关系(LARGE_THUMBTHUMBNAIL:大缩略图, MEDIUM_THUMBTHUMBNAIL:中缩略图,
     * SMALL_THUMBTHUMBNAIL：小缩略图,BINARY:二进制,BINARY_COMPRESSED:二进制压缩文件;)
     */
    private RelationEnum relation;

    /**
     * path 的hash值
     */
    private Long pathHash;

    /**
     * 创建时间
     */
    private OffsetDateTime createdAt;

    /**
     * 创建人ID
     */
    private Long createdBy;

    /**
     * 更新时间
     */
    private OffsetDateTime updatedAt;

    /**
     * 更改人ID
     */
    private Long updatedBy;

    /**
     * 外网URL
     */
    private String url;

    /**
     * 文件扩展信息
     */
    private JSONObject extraInfo;

}
