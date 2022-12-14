package ai.basic.x1.adapter.port.dao.mybatis.mapper;

import ai.basic.x1.adapter.port.dao.mybatis.extension.ExtendBaseMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.Class;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetClass;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;

import java.util.List;
import java.util.Map;

/**
 * @author chenchao
 * @date 2022-04-02
 */
public interface ClassMapper extends ExtendBaseMapper<Class> {

    /**
     * Gets the number of class in an ontology
     * @param map condition
     * @return ontologyId and classNum list
     */
    List<Class> countGroupByOntologyId(Map map);

    void saveOrUpdateBatch(List<Class> list);

    List<Class> getClasses(Long ontologyId,List<Class> list);
}
