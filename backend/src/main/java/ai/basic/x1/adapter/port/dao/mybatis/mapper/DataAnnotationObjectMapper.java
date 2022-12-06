package ai.basic.x1.adapter.port.dao.mybatis.mapper;

import ai.basic.x1.adapter.port.dao.mybatis.extension.ExtendBaseMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataAnnotationObject;
import ai.basic.x1.adapter.port.dao.mybatis.query.ScenarioQuery;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * @author chenchao
 * @date 2022/8/26
 */
@Mapper
public interface DataAnnotationObjectMapper extends ExtendBaseMapper<DataAnnotationObject> {

   Page<DataAnnotationObject> findByScenarioPage(Page<DataAnnotationObject> page, @Param("scenarioQuery") ScenarioQuery scenarioQuery);
}
