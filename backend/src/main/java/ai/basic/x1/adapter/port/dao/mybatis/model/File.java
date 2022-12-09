package ai.basic.x1.adapter.port.dao.mybatis.model;

import ai.basic.x1.entity.enums.RelationEnum;
import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.OffsetDateTime;

/**
 * @author fanyinbo
 * @date 2022-02-07
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName(autoResultMap = true)
public class File implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
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
     * File extension information
     */
    @TableField(value = "extra_info", typeHandler = JacksonTypeHandler.class)
    private JSONObject extraInfo;

    /**
     * Create time
     */
    @TableField(fill = FieldFill.INSERT)
    private OffsetDateTime createdAt;

    /**
     * Creator id
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;

    /**
     * Update time
     */
    @TableField(fill = FieldFill.UPDATE)
    private OffsetDateTime updatedAt;

    /**
     * Modify person id
     */
    @TableField(fill = FieldFill.UPDATE)
    private Long updatedBy;

}
