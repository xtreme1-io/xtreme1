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
     * Lidar point cloud file list
     */
    private List<ExportDataLidarPointCloudFileBO> lidarPointClouds;

    /**
     * Lidar camera parameter file
     */
    private ExportDataCameraConfigFileBO cameraConfig;

    /**
     * images
     */
    private List<ExportDataImageFileBO> cameraImages;

}
