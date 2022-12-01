package ai.basic.x1.adapter.port.rpc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointCloudFileInfo {
    private String pointCloudFile;
    private String uploadImagePath;
    private String uploadBinaryPcdPath;
}
