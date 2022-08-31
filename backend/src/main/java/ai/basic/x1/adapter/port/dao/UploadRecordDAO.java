package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.UploadRecordMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.UploadRecord;
import org.springframework.stereotype.Component;

/**
 * @author fyb
 * @date 2022-08-30 11:48:13
 */
@Component
public class UploadRecordDAO extends AbstractDAO<UploadRecordMapper, UploadRecord> {
}
