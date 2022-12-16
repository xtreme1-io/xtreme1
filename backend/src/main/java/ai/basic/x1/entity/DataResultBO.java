package ai.basic.x1.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataResultBO {

    /**
     * Format version
     */
    private String version;

    /**
     * Dataset id
     */
    private Long datasetId;

    /**
     * Dataset name
     */
    private String datasetName;

    /**
     * Export time
     */
    private String exportTime;

    /**
     * Data information
     */
    private List<DataExportBaseBO> data;

    /**
     * Result information
     */
    private List<DataResultExportBO> results;
}
