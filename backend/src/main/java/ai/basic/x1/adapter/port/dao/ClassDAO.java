package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.ClassMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.Class;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * @author chenchao
 * @date 2022/8/24
 */
@Component
public class ClassDAO extends AbstractDAO<ClassMapper, Class> {

    public List<Class> classCountGroupByOntologyId(Map map) {
        return getBaseMapper().countGroupByOntologyId(map);
    }
}
