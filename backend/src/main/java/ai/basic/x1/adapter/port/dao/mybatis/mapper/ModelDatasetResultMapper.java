package ai.basic.x1.adapter.port.dao.mybatis.mapper;

import ai.basic.x1.adapter.port.dao.mybatis.extension.ExtendBaseMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelDatasetResult;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface ModelDatasetResultMapper extends ExtendBaseMapper<ModelDatasetResult> {

    List<ModelDatasetResult> getModelDatasetResult(@Param("dataIds") List<Long> dataId,
                                            @Param("modelId") Long modelId,
                                            @Param("modelVersion") String modelVersion);
}
