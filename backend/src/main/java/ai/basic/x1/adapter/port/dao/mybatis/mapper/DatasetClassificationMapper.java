package ai.basic.x1.adapter.port.dao.mybatis.mapper;

import ai.basic.x1.adapter.port.dao.mybatis.extension.ExtendBaseMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetClassification;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;

import java.util.List;

/**
 *
 * @author chenchao
 * @date 2022-03-11
 */
public interface DatasetClassificationMapper extends ExtendBaseMapper<DatasetClassification> {
    void saveOrUpdateBatch(List<DatasetClassification> list);
}
