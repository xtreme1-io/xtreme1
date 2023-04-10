package ai.basic.x1.adapter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;

/**
 * @author fyb
 * @date 2023-03-02
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelClassDTO {

   /**
    * Model name
    */
   @NotEmpty(message = "name cannot be null")
   private String  name;

   /**
    * Model class code
    */
   @NotEmpty(message = "code cannot be null")
   private String  code;

}