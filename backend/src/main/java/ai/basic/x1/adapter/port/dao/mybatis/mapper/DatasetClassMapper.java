package ai.basic.x1.adapter.port.dao.mybatis.mapper;

import ai.basic.x1.adapter.port.dao.mybatis.extension.ExtendBaseMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.ClassStatisticsUnit;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetClass;
import ai.basic.x1.adapter.port.dao.mybatis.model.ToolTypeStatisticsUnit;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * @author chenchao
 * @date 2022-03-11
 */
public interface DatasetClassMapper extends ExtendBaseMapper<DatasetClass> {

    List<ClassStatisticsUnit> statisticsObjectByClass(@Param("datasetId") Long datasetId);

    List<ToolTypeStatisticsUnit> statisticsObjectByToolType(@Param("datasetId") Long datasetId);

    void saveOrUpdateBatch(List<DatasetClass> list);

    List<DatasetClass> getDatasetClasses(Long datasetId,List<DatasetClass> list);

}
