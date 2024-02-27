package ai.basic.x1.adapter.dto;

import ai.basic.x1.entity.enums.DataAnnotationStatusEnum;
import ai.basic.x1.entity.enums.DataStatusEnum;
import ai.basic.x1.entity.enums.ItemTypeEnum;
import ai.basic.x1.entity.enums.SplitTypeEnum;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.util.ObjectUtil;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author fyb
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataInfoDTO {

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
    private List<FileNodeDTO> content;

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
     * Locked Person's Name
     */
    private String lockedBy;

    private Long firstDataId;


    @Data
    @JsonInclude(value = JsonInclude.Include.NON_NULL)
    public static class FileNodeDTO {
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
        private FileDTO file;

        /**
         * Sub file
         */
        private List<FileNodeDTO> files;

        /**
         * Folder Type (Identifies what type of file is below)
         */
        private String directoryType;

        public String getDirectoryType() {
            if (CollectionUtil.isNotEmpty(files)) {
                var file = CollectionUtil.getFirst(files).getFile();
                return ObjectUtil.isNotNull(file) ? file.getType() : null;
            }
            return directoryType;
        }

    }
}
