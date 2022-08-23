package ai.basic.x1.adapter.port.dao.mybatis.mapper;


import ai.basic.x1.adapter.port.dao.mybatis.model.DataInfo;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetStatistics;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * mapper类
 *
 * @author fyb
 * @date 2022-02-16 10:19:06
 */
@Mapper
public interface DataInfoMapper extends BaseMapper<DataInfo> {

    List<DatasetStatistics> getDatasetStatisticsByDatasetIds(@Param("datasetIds") List<Long> datasetIds);

}
