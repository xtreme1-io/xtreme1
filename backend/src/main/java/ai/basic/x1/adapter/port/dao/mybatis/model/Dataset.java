package ai.basic.x1.adapter.port.dao.mybatis.model;

import ai.basic.x1.entity.enums.DatasetTypeEnum;
import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * @author fyb
 * @date 2022-02-16
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName(autoResultMap = true)
public class Dataset implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 数据集名称
     */
    private String name;

    /**
     * 数据类型 LIDAR_FUSION,LIDAR_BASIC,IMAGE
     */
    private DatasetTypeEnum type;

    /**
     * 描述
     */
    private String description;

    /**
     * 是否删除 1：是 0：否
     */
    private Boolean isDeleted;
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private OffsetDateTime createdAt;

    /**
     * 创建人ID
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private OffsetDateTime updatedAt;

    /**
     * 更改人ID
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updatedBy;

    /**
     * 文件Id
     */
    @TableField(exist = false)
    private List<DataInfo> datas;
}
