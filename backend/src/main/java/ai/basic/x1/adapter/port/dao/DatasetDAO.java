package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.DatasetMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.Dataset;
import org.springframework.stereotype.Component;

/**
 * @author fyb
 * @date 2022/2/16 14:13
 */
@Component
public class DatasetDAO extends AbstractDAO<DatasetMapper, Dataset> {
}
