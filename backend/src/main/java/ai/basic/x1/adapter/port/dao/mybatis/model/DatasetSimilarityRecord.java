package ai.basic.x1.adapter.port.dao.mybatis.model;

import ai.basic.x1.entity.enums.SimilarityStatusEnum;
import ai.basic.x1.entity.enums.SimilarityTypeEnum;
import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
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
@TableName(autoResultMap = true)
public class DatasetSimilarityRecord {

    @TableId(type = IdType.AUTO)
    private Long id;


    private Long datasetId;


    private String serialNumber;


    private SimilarityStatusEnum status;


    private SimilarityTypeEnum type;


    @TableField(value = "data_info", typeHandler = JacksonTypeHandler.class)
    private SimilarityDataInfo dataInfo;


    @TableField(fill = FieldFill.INSERT)
    private OffsetDateTime createdAt;

    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private OffsetDateTime updatedAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updatedBy;

}