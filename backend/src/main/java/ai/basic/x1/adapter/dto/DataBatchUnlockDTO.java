package ai.basic.x1.adapter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * @author fyb
 * @date 2023/1/7 16:58
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataBatchUnlockDTO {

    /**
     * ID of the locked record that requires unlocking.
     */
    @NotNull(message = "lockRecordIds cannot be null")
    private List<Long> lockRecordIds;
}
