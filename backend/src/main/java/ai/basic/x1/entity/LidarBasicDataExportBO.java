package ai.basic.x1.entity;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LidarBasicDataExportBO extends DataExportBaseBO{

    /**
     * Pcd url
     */
    private String pointCloudUrl;

    /**
     * The path in the compressed package
     */
    private String pointCloudZipPath;

}
