package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.DatasetTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * @author fyb
 * @date 2022/4/8 16:17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetQueryBO {

    /**
     * 数据名称
     */
    private String name;

    /**
     * 创建开始时间
     */
    private OffsetDateTime createStartTime;

    /**
     * 创建结束时间
     */
    private OffsetDateTime createEndTime;

    /**
     * 排序字段
     */
    private String sortField;

    /**
     * 升序或者降序
     */
    private String ascOrDesc;

    /**
     * 数据类型
     */
    private DatasetTypeEnum type;

}
