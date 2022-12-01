package ai.basic.x1.adapter.port.rpc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointCloudCRReqDTO {
    private List<PointCloudFileInfo> data;
    private Integer type;
    private RenderParam renderParam;
    private ConvertParam convertParam;
}
