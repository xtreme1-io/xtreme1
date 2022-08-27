package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.DatasetClassificationMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetClassification;
import org.springframework.stereotype.Component;

/**
 * @author fyb
 */
@Component
public class DatasetClassificationDAO extends AbstractDAO<DatasetClassificationMapper, DatasetClassification> {
}