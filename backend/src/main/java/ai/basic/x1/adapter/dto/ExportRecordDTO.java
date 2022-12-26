package ai.basic.x1.adapter.dto;

import ai.basic.x1.entity.enums.ExportStatusEnum;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author fyb
 * @date 2022-04-21 11:48:13
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExportRecordDTO {

    /**
     * Export record id
     */
    private Long id;

    /**
     * Serial number
     */
    @JsonSerialize(using = ToStringSerializer.class)
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
}
