package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.ClassificationMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.Classification;
import org.springframework.stereotype.Component;

/**
 * @author andy
 * @date 2022/3/16 18:35
 */
@Component
public class ClassificationDAO extends AbstractDAO<ClassificationMapper, Classification> {
}
