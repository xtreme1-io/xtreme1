package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.ModelDatasetResultMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelDatasetResult;
import com.baomidou.mybatisplus.core.toolkit.Constants;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * @author fyb
 * @version 1.0
 * @date 2022/3/1
 */
@Component
public class ModelDatasetResultDAO extends AbstractDAO<ModelDatasetResultMapper, ModelDatasetResult> {
    @Autowired
    private ModelDatasetResultMapper modelDatasetResultMapper;

    public List<ModelDatasetResult> getModelResult(List<Long> dataIds, Long modelId, String modelVersion){
        return modelDatasetResultMapper.getModelDatasetResult(dataIds,modelId,modelVersion);
    }

    public int insertBatch(@Param(Constants.LIST) List<ModelDatasetResult> list) {
        return modelDatasetResultMapper.insertBatch(list);
    }
}
