package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.DataUploadSourceEnum;
import ai.basic.x1.entity.enums.DatasetTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author fyb
 * @date 2022/4/9 15:18
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataInfoUploadBO {

    /**
     * Upload file url
     */
    private String fileUrl;

    /**
     * Dataset id
     */
    private Long datasetId;

    /**
     * Data upload source local or url
     */
    private DataUploadSourceEnum source;

    /**
     * User id
     */
    private Long userId;

    /**
     * Dataset type LIDAR_FUSION,LIDAR_BASIC,IMAGE
     */
    private DatasetTypeEnum type;

    /**
     * Save path
     */
    private String savePath;

    /**
     * Base save path
     */
    private String baseSavePath;

    /**
     * Upload record id
     */
    private Long uploadRecordId;

}
