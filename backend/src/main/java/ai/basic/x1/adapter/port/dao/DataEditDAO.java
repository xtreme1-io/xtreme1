package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.DataEditMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataEdit;
import org.springframework.stereotype.Component;

@Component
public class DataEditDAO extends AbstractDAO<DataEditMapper, DataEdit> {
}
