package ai.basic.x1.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author fyb
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataExportBO {

    /**
     * Data information
     */
    private DataExportBaseBO data;

    /**
     * Data result information
     */
    private DataResultExportBO result;

}
