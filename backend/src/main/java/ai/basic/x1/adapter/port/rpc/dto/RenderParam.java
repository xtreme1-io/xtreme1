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
public class RenderParam {
    private List<Long> colors;
    private List<Long> zRange;
    private Integer width;
    private Integer height;
    private Integer numStd;
}
