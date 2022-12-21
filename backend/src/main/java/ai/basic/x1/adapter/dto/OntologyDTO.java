package ai.basic.x1.adapter.dto;

import ai.basic.x1.entity.enums.DatasetTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

import javax.validation.constraints.NotNull;
import java.time.OffsetDateTime;

/**
 * @author chenchao
 * @date 2022/8/24
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OntologyDTO {

    private Long id;

    /**
     * ontology name
     */
    @NotNull(message = "name cannot be null")
    @Length(max = 256,message = "The length of name should be less than 256.")
    private String name;

    @NotNull(message = "type cannot be null")
    private DatasetTypeEnum type;

    /**
     * class number in this ontology
     */
    private Integer classNum;

    private OffsetDateTime createdAt;
}
