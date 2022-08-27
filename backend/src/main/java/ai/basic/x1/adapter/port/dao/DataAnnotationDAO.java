package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.DataAnnotationMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataAnnotation;
import org.springframework.stereotype.Component;

/**
 * @author chenchao
 * @date 2022/8/26
 */
@Component
public class DataAnnotationDAO extends AbstractDAO<DataAnnotationMapper, DataAnnotation>{
}
