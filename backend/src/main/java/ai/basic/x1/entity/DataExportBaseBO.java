package ai.basic.x1.entity;


import lombok.Data;

/**
 * @author fyb
 */
@Data
public class DataExportBaseBO {

    /**
     * Data id
     */
    private Long dataId;

    /**
     * Export version
     */
    private String version;

    /**
     * Data name
     */
    private String name;

    /**
     * Type
     */
    private String type;

}
