package ai.basic.x1.adapter.dto;

import com.fasterxml.jackson.annotation.JsonTypeName;
import lombok.Data;

/**
 * @author fyb
 */
@Data
@JsonTypeName("imageFile")
public class ImageFileDTO extends FileDTO {

    /**
     * Large thumbnail file object
     */
    private FileDTO largeThumbnail;

    /**
     * Medium thumbnail file object
     */
    private FileDTO mediumThumbnail;

    /**
     * Small thumbnail file object
     */
    private FileDTO smallThumbnail;
}
