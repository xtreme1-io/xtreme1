package ai.basic.x1.adapter.dto;

import com.fasterxml.jackson.annotation.JsonTypeName;
import lombok.Data;

/**
 * @author Jagger Wang
 */
@Data
@JsonTypeName("imageFile")
public class ImageFileDTO extends FileDTO {

    /**
     * 大缩略图对象
     */
    private FileDTO largeThumbnail;

    /**
     * 中缩略图对象
     */
    private FileDTO mediumThumbnail;

    /**
     * 小缩略图对象
     */
    private FileDTO smallThumbnail;
}
