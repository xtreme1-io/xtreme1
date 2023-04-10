package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.ModelRunRecordMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelRunRecord;
import org.springframework.stereotype.Component;

/**
 * @author fyb
 * @version 1.0
 */
@Component
public class ModelRunRecordDAO extends AbstractDAO<ModelRunRecordMapper, ModelRunRecord> {
}
