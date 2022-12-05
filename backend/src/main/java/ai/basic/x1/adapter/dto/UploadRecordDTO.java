package ai.basic.x1.adapter.dto;

import ai.basic.x1.entity.enums.UploadStatusEnum;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author fyb
 * @date 2022-08-30 15:14:37
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadRecordDTO {

    /**
     * ID
     */
    private Long id;

    /**
     * Serial number
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long serialNumber;

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

}