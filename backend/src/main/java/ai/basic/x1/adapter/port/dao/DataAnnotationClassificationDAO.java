package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.DataAnnotationClassificationMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataAnnotationClassification;
import org.springframework.stereotype.Component;

/**
 * @author chenchao
 * @date 2022/8/26
 */
@Component
public class DataAnnotationClassificationDAO extends AbstractDAO<DataAnnotationClassificationMapper, DataAnnotationClassification>{
}
