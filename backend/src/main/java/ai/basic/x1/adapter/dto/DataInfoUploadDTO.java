package ai.basic.x1.adapter.dto;

import ai.basic.x1.adapter.api.annotation.valid.ValidStringEnum;
import ai.basic.x1.entity.enums.DataUploadSourceEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.URL;

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
    @URL(message = "invalid url")
    private String fileUrl;

    /**
     * Dataset id
     */
    @NotNull(message = "datasetId cannot be null")
    private Long datasetId;

    /**
     * Upload source LOCAL, URL
     */
    @ValidStringEnum(message = "source must be one of LOCAL, URL", enumClass = DataUploadSourceEnum.class)
    @NotNull(message = "source cannot be null")
    private String source;

}
