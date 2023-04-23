package ai.basic.x1.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Transient;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageDataExportBO extends DataExportBaseBO {

    /**
     * Image url
     */
    private String imageUrl;

    /**
     * The path in the compressed package
     */
    private String imageZipPath;

    /**
     * Camera image width
     */
    private Long width;

    /**
     * Camera image height
     */
    private Long height;

    /**
     * File relative path
     */
    private transient String filePath;

}
