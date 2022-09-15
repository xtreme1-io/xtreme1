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
     * name
     */
    private String name;

    /**
     * code
     */
    private String code;

    /**
     * icon url
     */
    private String url;

    /**
     * sub class
     */
    private List<ModelClass> subClasses;
}
