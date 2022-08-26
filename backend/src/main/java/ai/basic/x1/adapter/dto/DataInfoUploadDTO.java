package ai.basic.x1.adapter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

/**
 * @author fyb
 * @date 2022/2/28 9:38
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataInfoUploadDTO {

    /**
     * Upload file url
     */
    @NotEmpty(message = "fileUrl is not null")
    private String fileUrl;

    /**
     * Dataset id
     */
    @NotNull(message = "datasetId cannot be null")
    private Long datasetId;


}
