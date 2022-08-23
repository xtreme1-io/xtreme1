package ai.basic.x1.adapter.port.dao.mybatis.model;

import ai.basic.x1.entity.enums.RelationEnum;
import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
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
     * 关联原始文件ID
     */
    private Long relationId;

    /**
     * 文件关系(LARGE_THUMBTHUMBNAIL:大缩略图, MEDIUM_THUMBTHUMBNAIL:中缩略图,
     * SMALL_THUMBTHUMBNAIL：小缩略图,BINARY:二进制,BINARY_COMPRESSED:二进制压缩文件;)
     */
    private RelationEnum relation;

    /**
     * path hash后的值
     */
    private Long pathHash;

    /**
     * 扩展信息字段
     */
    @TableField(value = "extra_info", typeHandler = JacksonTypeHandler.class)
    private JSONObject extraInfo;

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

}
