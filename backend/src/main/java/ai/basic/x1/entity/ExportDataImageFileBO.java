package ai.basic.x1.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ExportDataImageFileBO extends ExportDataFileBaseBO{

    /**
     * Camera image width
     */
    private Long width;

    /**
     * Camera image height
     */
    private Long height;
}
