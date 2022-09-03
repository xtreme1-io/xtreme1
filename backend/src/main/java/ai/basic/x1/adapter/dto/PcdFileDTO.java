package ai.basic.x1.adapter.dto;

import com.fasterxml.jackson.annotation.JsonTypeName;
import lombok.Data;

/**
 * @author Jagger Wang
 */
@Data
@JsonTypeName("pcdFile")
public class PcdFileDTO extends FileDTO {

    /**
     * Pcd binary file object
     */
    private FileDTO binary;

    /**
     * Pcd binary compressed file object
     */
    private FileDTO binaryCompressed;

    /**
     * Pcd render image file object
     */
    private FileDTO renderImage;
}
