package ai.basic.x1.adapter.port.dao.mybatis.mapper;


import ai.basic.x1.adapter.port.dao.mybatis.extension.ExtendBaseMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataInfo;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetStatistics;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 *
 * @author fyb
 * @date 2022-02-16 10:19:06
 */
@Mapper
public interface DataInfoMapper extends ExtendBaseMapper<DataInfo> {

    /**
     * Get dataset statistics
     * @param datasetIds datasetId collection
     * @return Dataset statistics
     */
    List<DatasetStatistics> getDatasetStatisticsByDatasetIds(@Param("datasetIds") List<Long> datasetIds);

    /**
     * Get data info
     * @param ids Data id
     * @param isQueryDeletedData Whether to query to delete data
     * @return Data info
     */
    List<DataInfo> listByIds(@Param("ids") List<Long> ids, @Param("isQueryDeletedData") Boolean isQueryDeletedData);

}
