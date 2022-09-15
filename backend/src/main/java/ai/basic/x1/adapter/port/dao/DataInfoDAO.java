package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.DataInfoMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataInfo;
import org.springframework.stereotype.Component;

/**
 * @author fyb
 * @date 2022/2/21 11:59
 */
@Component
public class DataInfoDAO extends AbstractDAO<DataInfoMapper, DataInfo> {

}
