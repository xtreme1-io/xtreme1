package ai.basic.x1.entity;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ObjectBO {
    private String modelClass;
    private String objType;
    private BigDecimal confidence;
    private PointBO center3D;
    private PointBO rotation3D;
    private PointBO size3D;
}
