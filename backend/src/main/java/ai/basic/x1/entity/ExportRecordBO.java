package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.ExportStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * @author fyb
 * @date 2022-04-21 11:48:13
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExportRecordBO {

    /**
     * Export record id
     */
    private Long id;

    /**
     * Serial number
     */
    private Long serialNumber;

    /**
     * File id
     */
    private Long fileId;

    /**
     * File name
     */
    private String fileName;

    /**
     * Export status(UNSTARTED,GENERATING,COMPLETED,FAILED)
     */
    private ExportStatusEnum status;

    /**
     * Generated number
     */
    private Integer generatedNum;

    /**
     * Export total number
     */
    private Integer totalNum;

    /**
     * File path
     */
    private String filePath;

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

}