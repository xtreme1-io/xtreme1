package ai.basic.x1.adapter.port.dao.mybatis.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author chenchao
 * @date 2022/8/26
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelClass {
    /**
     * 名称
     */
    private String name;

    /**
     * 和算法交互的code
     */
    private String code;

    /**
     * icon的url
     */
    private String url;

    /**
     * 子类别
     */
    private List<ModelClass> subClasses;
}
