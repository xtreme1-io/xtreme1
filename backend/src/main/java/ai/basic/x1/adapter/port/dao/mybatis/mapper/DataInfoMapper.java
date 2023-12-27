package ai.basic.x1.adapter.port.dao.mybatis.mapper;


import ai.basic.x1.adapter.port.dao.mybatis.extension.ExtendBaseMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataInfo;
import ai.basic.x1.adapter.port.dao.mybatis.model.Dataset;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetSixData;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetStatistics;
import ai.basic.x1.adapter.port.dao.mybatis.query.DataInfoQuery;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.toolkit.Constants;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.io.Serializable;
import java.util.List;

/**
 * @author fyb
 * @date 2022-02-16 10:19:06
 */
@Mapper
public interface DataInfoMapper extends ExtendBaseMapper<DataInfo> {

    /**
     * Get dataset statistics
     *
     * @param datasetIds datasetId collection
     * @return Dataset statistics
     */
    List<DatasetStatistics> getDatasetStatisticsByDatasetIds(@Param("datasetIds") List<Long> datasetIds);

    /**
     * Get data info
     *
     * @param ids                Data id
     * @param isQueryDeletedData Whether to query to delete data
     * @return Data info
     */
    List<DataInfo> listByIds(@Param("ids") List<Long> ids, @Param("isQueryDeletedData") Boolean isQueryDeletedData);

    /**
     * Get six data info
     *
     * @param datasetIds datasetId collection
     * @return
     */
    List<DatasetSixData> selectSixDataIdByDatasetIds(@Param("datasetIds") List<Long> datasetIds);

    /**
     * Get Model run data id
     *
     * @param queryWrapper Model run Filter data parameter
     * @param modelId      Model id
     * @param limit        data id count
     * @return data id
     */
    List<Long> findModelRunDataIds(@Param(Constants.WRAPPER) Wrapper<DataInfo> queryWrapper, @Param("modelId") Long modelId,
                                   @Param("isExcludeModelData") Boolean isExcludeModelData, @Param("limit") Long limit);

    /**
     * Get Model run data count
     *
     * @param queryWrapper Model run Filter data parameter
     * @param modelId      Model id
     * @return data count
     */
    Long findModelRunDataCount(@Param(Constants.WRAPPER) Wrapper<DataInfo> queryWrapper, @Param("modelId") Long modelId,
                               @Param("isExcludeModelData") Boolean isExcludeModelData);

    /**
     * Select data
     *
     * @param page         page
     * @param queryWrapper parameter
     * @return data page
     */
    Page<DataInfo> selectDataPage(Page<DataInfo> page, @Param(Constants.WRAPPER) Wrapper<DataInfo> queryWrapper, @Param("dataInfoQuery") DataInfoQuery dataInfoQuery);


    List<DataInfo> getExportData(@Param(Constants.WRAPPER) Wrapper<DataInfo> queryWrapper, @Param("dataInfoQuery") DataInfoQuery dataInfoQuery);

    /**
     * This method overrides the deleteById method of baseMapper
     *
     * @param id
     */
    @Override
    int deleteById(Serializable id);

    /**
     * Delete data based on dataset Id
     *
     * @param datasetId Dataset id
     */
    int deleteByDatasetId(@Param("datasetId") Long datasetId);


    /**
     * Query the first data ID of consecutive frames
     *
     * @param datasetId Dataset Id
     * @param sceneIds  Continuous frame ID
     * @return
     */
    List<Long> selectFirstDataIdBySceneIds(@Param("datasetId") Long datasetId, @Param("sceneIds") List<Long> sceneIds);
}
