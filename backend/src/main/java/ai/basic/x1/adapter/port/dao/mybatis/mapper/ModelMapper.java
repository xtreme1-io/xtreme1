package ai.basic.x1.adapter.port.dao.mybatis.mapper;

import ai.basic.x1.adapter.port.dao.mybatis.model.Model;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

import java.io.Serializable;

/**
 * @author chenchao
 * @data 2022/8/26
 */
@Mapper
public interface ModelMapper extends BaseMapper<Model> {

    @Override
    int deleteById(Serializable id);
}
