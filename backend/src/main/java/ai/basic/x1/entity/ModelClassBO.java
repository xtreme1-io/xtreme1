package ai.basic.x1.entity;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author fyb
 * @date 2023-03-02
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelClassBO {

   /**
    * 
    */
   private Long  id;

   /**
    * Model id
    */
   private Long  modelId;

   /**
    * Model name
    */
   private String  name;

   /**
    * Model class code
    */
   private String  code;

   /**
    * Create time
    */
   private OffsetDateTime createdAt;

   /**
    * Creator id
    */
   private Long  createdBy;

   /**
    * Update time
    */
   private OffsetDateTime  updatedAt;

   /**
    * Modify person id
    */
   private Long  updatedBy;


}