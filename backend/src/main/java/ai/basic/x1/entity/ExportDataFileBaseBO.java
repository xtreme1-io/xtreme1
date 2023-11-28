package ai.basic.x1.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ExportDataFileBaseBO {

    /**
     * filename
     */
    private String filename;

    /**
     * url
     */
    private String url;

    /**
     * Path within compressed package
     */
    private String zipPath;

    /**
     * Internal address
     */
    private transient String internalUrl;

    /**
     * File relative path
     */
    private transient String filePath;

    /**
     * Device name, ignored when writing to json file
     */
    private transient String deviceName;
}
