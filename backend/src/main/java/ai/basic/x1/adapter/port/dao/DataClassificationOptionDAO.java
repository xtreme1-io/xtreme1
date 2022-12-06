package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.DataClassificationOptionMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataClassificationOption;
import org.springframework.stereotype.Component;

/**
 * @author zhujh
 */
@Component
public class DataClassificationOptionDAO extends AbstractDAO<DataClassificationOptionMapper, DataClassificationOption> {
}
