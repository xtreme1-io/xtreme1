package ai.basic.x1.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * 
 *
 * @author fyb
 * @date 2022-05-07 16:31:31
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataEditBO {

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

   /**
    * 创建者
    */
   private Long  createdBy;

   /**
    * 创建时间
    */
   private OffsetDateTime createdAt;


}