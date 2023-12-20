package ai.basic.x1.adapter.port.dao.mybatis.model;

import ai.basic.x1.entity.enums.DataAnnotationStatusEnum;
import ai.basic.x1.entity.enums.DataStatusEnum;
import ai.basic.x1.entity.enums.ItemTypeEnum;
import ai.basic.x1.entity.enums.SplitTypeEnum;
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
     * Dataset id
     */
    private Long datasetId;

    /**
     * Data name
     */
    private String name;

    /**
     * Sort data name
     */
    private String orderName;

    /**
     * Content (folder path, version information)
     */
    @TableField(value = "content", typeHandler = JacksonTypeHandler.class)
    private List<FileNode> content;

    /**
     * Type (indicates continuous frames, non-consecutive frames)
     */
    private ItemTypeEnum type;

    /**
     * Parent ID (Scene ID)
     */
    private Long parentId;

    /**
     * Data status INVALID,VALID
     */
    private DataStatusEnum status;

    /**
     * Data annotation status ANNOTATED, NOT_ANNOTATED, INVALID
     */
    private DataAnnotationStatusEnum annotationStatus;

    /**
     * Data split type ANNOTATED, NOT_ANNOTATED, INVALID
     */
    private SplitTypeEnum splitType;

    /**
     * Is deleted
     */
    private Boolean isDeleted;

    /**
     * Delete unique flag, 0 when writing, set as primary key id after tombstone
     */
    private Long delUniqueKey;

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

    /**
     * Temporary data ID is used to associate the ID
     */
    @TableField(exist = false)
    private Long tempDataId;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileNode {

        /**
         * File name
         */
        private String name;

        /**
         * File id
         */
        private Long fileId;

        /**
         * File type(directory,file)
         */
        private String type;

        /**
         * Sub file
         */
        private List<FileNode> files;

    }

}
