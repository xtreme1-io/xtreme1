package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.OntologyMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.Ontology;
import org.springframework.stereotype.Component;

/**
 * @author chenchao
 * @date 2022/8/24
 */
@Component
public class OntologyDAO extends AbstractDAO<OntologyMapper, Ontology> {
}
