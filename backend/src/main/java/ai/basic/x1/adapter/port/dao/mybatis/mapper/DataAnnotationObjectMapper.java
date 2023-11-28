package ai.basic.x1.adapter.port.dao.mybatis.mapper;

import ai.basic.x1.adapter.port.dao.mybatis.extension.ExtendBaseMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataAnnotationObject;
import ai.basic.x1.adapter.port.dao.mybatis.query.ScenarioQuery;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * @author chenchao
 * @date 2022/8/26
 */
@Mapper
public interface DataAnnotationObjectMapper extends ExtendBaseMapper<DataAnnotationObject> {

   Page<DataAnnotationObject> findByScenarioPage(Page<DataAnnotationObject> page, @Param("scenarioQuery") ScenarioQuery scenarioQuery);

   List<DataAnnotationObject> listByScenario(@Param("scenarioQuery") ScenarioQuery scenarioQuery);

   Page<DataAnnotationObject> findDataIdByScenarioPage(Page<DataAnnotationObject> page, @Param("scenarioQuery") ScenarioQuery scenarioQuery);

   List<Long> findDataIdByScenario(@Param("scenarioQuery") ScenarioQuery scenarioQuery);
}
