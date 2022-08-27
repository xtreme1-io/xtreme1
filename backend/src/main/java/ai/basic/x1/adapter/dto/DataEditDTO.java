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
    * 主键id
    */
   private Long  id;

   /**
    * 标注记录表
    */
   private Long  annotationRecordId;

   /**
    * 数据id
    */
   private Long  dataId;

   /**
    * 数据集id
    */
   private Long  datasetId;

   /**
    * 模型id
    */
   private Long  modelId;

   /**
    * 模型版本
    */
   private String  modelVersion;

}