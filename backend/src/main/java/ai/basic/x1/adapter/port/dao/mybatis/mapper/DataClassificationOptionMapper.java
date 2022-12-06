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

    int insertOrUpdateBatch(List<DataClassificationOption> list);

    Page<DataClassificationOption> selectByPage(Page<DataClassificationOption> page, @Param("datasetId") Long datasetId);

}
