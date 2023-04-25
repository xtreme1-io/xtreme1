package ai.basic.x1.entity;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Transient;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LidarFusionDataExportBO extends DataExportBaseBO {

    /**
     * Pcd url
     */
    private String pointCloudUrl;

    /**
     * The path in the compressed package
     */
    private String pointCloudZipPath;

    /**
     * camera ConfigUrl
     */
    private String cameraConfigUrl;

    /**
     *
     * The path in the camera parameter compression package
     */
    private String cameraConfigZipPath;

    /**
     * Images
     */
    private List<LidarFusionImageBO> cameraImages;

    @Data
    public static class LidarFusionImageBO {
        /**
         * Camera image url
         */
        private String url;

        /**
         *  The path in the compressed package
         */
        private String zipPath;

        /**
         * Camera image width
         */
        private Long width;

        /**
         * Camera image height
         */
        private Long height;

        /**
         * File relative path
         */
        private transient String filePath;
    }

}
