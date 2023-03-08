package ai.basic.x1.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author fyb
 * @date 2022-05-9 19:48:13
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LockRecordBO {

    /**
     * Lock record id
     */
    private Long recordId;

    /**
     * Locked data number
     */
    private Long lockedNum;

    /**
     * Locked username
     */
    private String lockedBy;
}
