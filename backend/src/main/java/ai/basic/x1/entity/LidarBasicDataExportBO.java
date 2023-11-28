package ai.basic.x1.entity;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LidarBasicDataExportBO extends DataExportBaseBO{

    /**
     * Lidar point cloud file list
     */
    private List<ExportDataLidarPointCloudFileBO> lidarPointClouds;

}
