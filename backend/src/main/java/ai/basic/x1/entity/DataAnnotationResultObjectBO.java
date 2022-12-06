package ai.basic.x1.entity;

import cn.hutool.json.JSONObject;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DataAnnotationResultObjectBO {

    /**
     * 框ID
     */
    private String id;

    /**
     * 类型
     */
    private String type;

    /**
     * 版本，初始为 0，每改一次 +1
     */
    private Integer version;

    /**
     * 追踪对象 ID
     */
    private String trackId;

    /**
     * 追踪对象名称
     */
    private String trackName;

    /**
     * 选中类型属性值
     */
    private JSONObject classValues;

    /**
     * 轮廓信息
     */
    private JSONObject contour;

    /**
     * 模型识别置信度，只有模型识别时才有
     */
    private BigDecimal modelConfidence;

    /**
     * 模型识别出来的类别，只有模型识别时才有
     */
    private String modelClass;

}
