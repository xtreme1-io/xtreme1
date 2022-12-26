package ai.basic.x1.adapter.port.dao.mybatis.mapper;

import ai.basic.x1.adapter.port.dao.mybatis.extension.ExtendBaseMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.Classification;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;

import java.util.List;


/**
 * @author  andy
 * @date 2022-04-02 15:49:34
 */
public interface ClassificationMapper extends ExtendBaseMapper<Classification> {
    void saveOrUpdateBatch(List<Classification> classifications);
}
