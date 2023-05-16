package ai.basic.x1.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TextDataExportBO extends DataExportBaseBO {

    /**
     * Text url
     */
    private String textUrl;

    /**
     * The path in the compressed package
     */
    private String textZipPath;

}
