package ai.basic.x1.adapter.port.dao.mybatis.model;

import ai.basic.x1.entity.enums.DataAnnotationStatusEnum;
import ai.basic.x1.entity.enums.DataStatusEnum;
import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * @author fyb
 * @date 2022-02-16
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName(value = "data", autoResultMap = true)
public class DataInfo implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 数据集ID
     */
    private Long datasetId;

    /**
     * 数据名称
     */
    private String name;

    /**
     * 内容（文件夹路径、版本信息）
     */
    @TableField(value = "content", typeHandler = JacksonTypeHandler.class)
    private List<FileNode> content;


    /**
     * 数据状态 INVALID,VALID
     */
    private DataStatusEnum status;

    /**
     * 数据标注状态 ANNOTATED, NOT_ANNOTATED, INVALID
     */
    private DataAnnotationStatusEnum annotationStatus;

    /**
     * 是否删除 1：是 0：否
     */
    private Boolean isDeleted;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private OffsetDateTime createdAt;

    /**
     * 创建人ID
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private OffsetDateTime updatedAt;

    /**
     * 更改人ID
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updatedBy;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileNode {

        /**
         * 名称
         */
        private String name;

        /**
         * 文件ID
         */
        private Long fileId;

        /**
         * 类型
         */
        private String type;

        /**
         * 子文件
         */
        private List<FileNode> files;

    }

}
