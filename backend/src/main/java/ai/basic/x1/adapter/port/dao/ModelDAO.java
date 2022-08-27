package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.ModelMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.Model;
import org.springframework.stereotype.Component;

/**
 * @author chenchao
 * @date 2022/8/26
 */
@Component
public class ModelDAO extends AbstractDAO<ModelMapper, Model>{
}
