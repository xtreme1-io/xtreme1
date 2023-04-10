package ai.basic.x1.adapter.port.rpc.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author andy
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointCloudDetectionReqDTO {

    private List<DataInfo> datas;

}
