package ai.basic.x1.adapter.port.dao.mybatis.mapper;

import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetClass;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetClassOntology;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;

import java.util.List;

/**
 * @author chenchao
 * @date 2022/12/2
 */
public interface DatasetClassOntologyMapper  extends BaseMapper<DatasetClassOntology> {

    /**
     * insert, If there is a duplicate key, update it
     * @param list entity
     */
    void saveOrUpdateBatch(List<DatasetClassOntology> list);
}
