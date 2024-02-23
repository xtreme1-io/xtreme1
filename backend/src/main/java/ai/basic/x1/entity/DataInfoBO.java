package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.DataAnnotationStatusEnum;
import ai.basic.x1.entity.enums.DataStatusEnum;
import ai.basic.x1.entity.enums.ItemTypeEnum;
import ai.basic.x1.entity.enums.SplitTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * @author fyb
 * @date 2022/2/16 14:51
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataInfoBO {

    /**
     * Data id
     */
    private Long id;

    /**
     * Dataset id
     */
    private Long datasetId;

    /**
     * Dataset name
     */
    private String datasetName;

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
    private List<FileNodeBO> content;

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
     * Locked Person's Name
     */
    private String lockedBy;

    /**
     * Temporary data ID is used to associate the ID
     */
    private Long tempDataId;

    /**
     * Continuous frame name (use continuous frame name when exporting)
     */
    private String sceneName;

    private Long firstDataId;


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileNodeBO {

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
         * File information
         */
        private RelationFileBO file;

        /**
         * Sub file
         */
        private List<FileNodeBO> files;
    }
}
