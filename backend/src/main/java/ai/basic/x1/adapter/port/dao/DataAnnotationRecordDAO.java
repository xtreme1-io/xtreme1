package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.DataAnnotationRecordMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataAnnotationRecord;
import org.springframework.stereotype.Component;

/**
 * @author fyb
 */
@Component
public class DataAnnotationRecordDAO extends AbstractDAO<DataAnnotationRecordMapper, DataAnnotationRecord> {
}
