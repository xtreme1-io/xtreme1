package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.DatasetSimilarityRecordMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetSimilarityRecord;
import org.springframework.stereotype.Component;

/**
 * @author fyb
 * @date 2022-12-05
 */
@Component
public class DatasetSimilarityRecordDAO extends AbstractDAO<DatasetSimilarityRecordMapper, DatasetSimilarityRecord> {
}