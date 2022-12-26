package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.DataClassificationOptionMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataClassificationOption;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * @author zhujh
 */
@Component
public class DataClassificationOptionDAO extends AbstractDAO<DataClassificationOptionMapper, DataClassificationOption> {
    @Autowired
    private DataClassificationOptionMapper dataClassificationOptionMapper;

    public List<DataClassificationOption> statisticsDatasetDataClassification(Long datasetId, Long classificationId) {
        return dataClassificationOptionMapper.statisticsDatasetDataClassification(datasetId, classificationId);
    }
}
