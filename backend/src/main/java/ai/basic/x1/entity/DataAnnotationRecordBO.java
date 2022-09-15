package ai.basic.x1.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 
 *
 * @author fyb
 * @date 2022-05-07 16:30:56
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataAnnotationRecordBO {

   /**
    * Dataset id
    */
   private Long datasetId;

   /**
    * Serial number
    */
   private Long serialNo;

   /**
    * Locked data
    */
   private List<DataEditBO> datas;

}