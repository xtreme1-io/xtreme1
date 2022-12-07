package ai.basic.x1.adapter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * @author fyb
 * @date 2022-12-05
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetSimilarityDetailDTO {


   private Long  id;


   private Long  datasetId;


   private String  dataType;


   private String  dataIds;


   private LocalDateTime  createdAt;


   private Long  createdBy;


   private LocalDateTime  updatedAt;


   private Long  updatedBy;


}