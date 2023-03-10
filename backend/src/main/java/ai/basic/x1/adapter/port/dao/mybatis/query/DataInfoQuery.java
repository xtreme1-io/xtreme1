package ai.basic.x1.adapter.port.dao.mybatis.query;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataInfoQuery {


    /**
     * Sort field
     */
    private String sortField;

    /**
     * Ascending or descending order
     */
    private String ascOrDesc;

    /**
     * Model run record id
     */
    private Long runRecordId;

    /**
     * Min data confidence
     */
    private BigDecimal minDataConfidence;

    /**
     * Max data confidence
     */
    private BigDecimal maxDataConfidence;

}
