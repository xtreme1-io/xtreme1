package ai.basic.x1.adapter.port.dao.mybatis.mapper;

import ai.basic.x1.adapter.port.dao.mybatis.model.Dataset;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelRunRecord;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface ModelRunRecordMapper extends BaseMapper<ModelRunRecord> {

    Page<ModelRunRecord> selectListWithDatasetNotDeleted(Page<ModelRunRecord> page,@Param("ew") LambdaQueryWrapper lambdaQueryWrapper);

    List<ModelRunRecord> countGroupByModelId(@Param("ew") LambdaQueryWrapper lambdaQueryWrapper);


    List<Dataset> findModelRunFilterDatasetName(@Param("datasetName") String datasetName);

}
