package ai.basic.x1.entity;

import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@TableName(autoResultMap = true)
public class DataAnnotationObjectBO {

    private Long id;

    /**
     * 数据集ID
     */
    private Long datasetId;

    /**
     * 数据ID
     */
    private Long dataId;

    /**
     * 类型ID
     */
    private Long classId;


    /**
     * 对象标注属性
     */
    private JSONObject classAttributes;

    private OffsetDateTime createdAt;

    private Long createdBy;

    private String frontId;

}
