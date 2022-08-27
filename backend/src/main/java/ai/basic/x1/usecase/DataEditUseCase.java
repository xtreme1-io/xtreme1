package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.DataEditDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataEdit;
import cn.hutool.core.collection.CollectionUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author fyb
 * @date 2022/3/16 10:31
 */
public class DataEditUseCase {

    @Autowired
    private DataEditDAO dataEditDAO;

    /**
     * 获取数据锁定人员ID
     *
     * @param dataIds 数据集合
     * @return 锁定数据与人员MAP
     */
    public Map<Long, Long> getDataEditByDataIds(List<Long> dataIds) {
        var lambdaQueryWrapper = new LambdaQueryWrapper<DataEdit>();
        lambdaQueryWrapper.in(DataEdit::getDataId, dataIds);
        var dataEditList = dataEditDAO.list(lambdaQueryWrapper);
        if (CollectionUtil.isNotEmpty(dataEditList)) {
            return dataEditList.stream()
                    .collect(Collectors.toMap(DataEdit::getDataId, DataEdit::getCreatedBy, (k1, k2) -> k1));
        }
        return new HashMap<>();
    }

}
