package ai.basic.x1.entity;

import ai.basic.x1.adapter.port.dao.mybatis.model.SimilarityDataInfo;
import ai.basic.x1.entity.enums.SimilarityStatusEnum;
import ai.basic.x1.entity.enums.SimilarityTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

/**
 * @author fyb
 * @date 2022-12-05
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetSimilarityRecordBO {


    private Long id;


    private Long datasetId;


    private String serialNumber;


    private SimilarityStatusEnum status;


    private SimilarityTypeEnum type;


    private SimilarityDataInfo dataInfo;


    private OffsetDateTime createdAt;


    private Long createdBy;


    private OffsetDateTime updatedAt;


    private Long updatedBy;

    private Boolean isHistoryData;

    private String resultUrl;
}