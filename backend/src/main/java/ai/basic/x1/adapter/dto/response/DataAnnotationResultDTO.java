package ai.basic.x1.adapter.dto.response;
import ai.basic.x1.adapter.dto.DataAnnotationClassificationDTO;
import ai.basic.x1.adapter.dto.DataAnnotationObjectDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author fyb
 * @date 2022-11-16
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataAnnotationResultDTO {

   /**
    * 数据ID
    */
   private Long  dataId;

   /**
    * Classification 属性取值
    */
   private List<DataAnnotationClassificationDTO> classificationValues;

   /**
    * Data 包含的 Object 列表
    */
   private List<DataAnnotationObjectDTO>  objects;


}