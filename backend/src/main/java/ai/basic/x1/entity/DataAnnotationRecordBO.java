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
    * 数据集id
    */
   private Long datasetId;

   /**
    * 流水号
    */
   private Long serialNo;

   /**
    * 被锁定的数据
    */
   private List<DataEditBO> datas;

}