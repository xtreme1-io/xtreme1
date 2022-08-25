package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.ExportRecordMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.ExportRecord;
import org.springframework.stereotype.Component;

/**
 * @author fyb
 * @date 2022-04-21 11:48:13
 */
@Component
public class ExportRecordDAO extends AbstractDAO<ExportRecordMapper, ExportRecord> {
}
