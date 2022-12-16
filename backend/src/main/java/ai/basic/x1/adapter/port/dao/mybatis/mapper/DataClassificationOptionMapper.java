package ai.basic.x1.adapter.port.dao.mybatis.mapper;

import ai.basic.x1.adapter.port.dao.mybatis.model.DataClassificationOption;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * @author zhujh
 */
public interface DataClassificationOptionMapper extends BaseMapper<DataClassificationOption> {

    int insertBatch(List<DataClassificationOption> list);

    List<DataClassificationOption> statisticsDataByOption(@Param("datasetId") Long datasetId,
                                                          @Param("existClassificationIds") List<Long> existClassificationIds);

    List<DataClassificationOption> statisticsDatasetDataClassification(@Param("datasetId") Long datasetId, @Param("classificationId") Long classificationId);
}
