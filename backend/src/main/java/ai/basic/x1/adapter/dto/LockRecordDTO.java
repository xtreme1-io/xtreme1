package ai.basic.x1.adapter.dto;

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
public class LockRecordDTO {

    /**
     * 锁定记录ID
     */
    private Long recordId;

    /**
     * 锁定数据数量
     */
    private Long lockedNum;
}
