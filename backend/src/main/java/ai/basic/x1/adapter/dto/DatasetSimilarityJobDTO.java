package ai.basic.x1.adapter.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author fyb
 * @date 2022-12-07
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetSimilarityJobDTO {

   /**
    * 
    */
   private Long  id;

   /**
    * 
    */
   private Long  datasetId;

   /**
    * 
    */
   private String  status;

   /**
    * 
    */
   private String  serialNumber;

   /**
    * 
    */
   private LocalDateTime  createdAt;

   /**
    * 
    */
   private Long  createdBy;

   /**
    * 
    */
   private LocalDateTime  updatedAt;

   /**
    * 
    */
   private Long  updatedBy;


}