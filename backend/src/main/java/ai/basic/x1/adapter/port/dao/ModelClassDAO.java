package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.ModelClassMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelClass;
import org.springframework.stereotype.Component;

/**
 * @author fyb
 * @date 2023-03-02
 */
@Component
public class ModelClassDAO extends AbstractDAO<ModelClassMapper, ModelClass> {
}