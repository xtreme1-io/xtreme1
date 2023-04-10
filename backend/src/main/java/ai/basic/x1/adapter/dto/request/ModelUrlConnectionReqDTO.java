package ai.basic.x1.adapter.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelUrlConnectionReqDTO {

    @NotNull(message = "modelId cannot be null")
    private Long modelId;

    @NotEmpty(message = "url cannot be null")
    private String url;
}
