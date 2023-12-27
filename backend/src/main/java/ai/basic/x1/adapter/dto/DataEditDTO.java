package ai.basic.x1.adapter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 
 *
 * @author fyb
 * @date 2022-05-010 16:31:31
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataEditDTO {

   /**
    * ID
    */
   private Long  id;

   /**
    * Data annotation record id
    */
   private Long  annotationRecordId;

   /**
    * Scene id
    */
   private Long sceneId;

   /**
    * Data id
    */
   private Long  dataId;

   /**
    * Dataset id
    */
   private Long  datasetId;

   /**
    * Model id
    */
   private Long  modelId;

   /**
    * Model version
    */
   private String  modelVersion;

}