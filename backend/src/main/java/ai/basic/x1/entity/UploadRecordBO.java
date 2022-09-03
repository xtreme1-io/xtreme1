package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.UploadStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * @author fyb
 * @date 2022-08-30 15:14:37
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadRecordBO {

    /**
     * Upload record id
     */
    private Long id;

    /**
     * Serial number
     */
    private Long serialNumber;

    /**
     * File url
     */
    private String fileUrl;

    /**
     * File name
     */
    private String fileName;

    /**
     * Error information
     */
    private String errorMessage;

    /**
     * Total file size
     */
    private Long totalFileSize;

    /**
     * Downloaded file size
     */
    private Long downloadedFileSize;

    /**
     * The total number of data
     */
    private Long totalDataNum;

    /**
     * Number of parsed data
     */
    private Long parsedDataNum;

    /**
     * Upload status
     */
    private UploadStatusEnum status;

    /**
     * Create time
     */
    private OffsetDateTime createdAt;

    /**
     * Creator ID
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

}