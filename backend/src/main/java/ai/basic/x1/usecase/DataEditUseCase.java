package ai.basic.x1.usecase;

import ai.basic.x1.adapter.api.context.RequestContextHolder;
import ai.basic.x1.adapter.port.dao.DataEditDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataEdit;
import ai.basic.x1.entity.DataEditBO;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.collection.CollectionUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author fyb
 * @date 2022/3/16 10:31
 */
public class DataEditUseCase {

    @Autowired
    private DataEditDAO dataEditDAO;

    /**
     * get dataEdit creator
     *
     * @param dataIds dataIds
     * @return creator
     */
    public Map<Long, Long> getDataEditByDataIds(List<Long> dataIds) {
        var lambdaQueryWrapper = new LambdaQueryWrapper<DataEdit>();
        lambdaQueryWrapper.in(DataEdit::getDataId, dataIds);
        var dataEditList = dataEditDAO.list(lambdaQueryWrapper);
        if (CollectionUtil.isNotEmpty(dataEditList)) {
            return dataEditList.stream()
                    .collect(Collectors.toMap(DataEdit::getDataId, DataEdit::getCreatedBy, (k1, k2) -> k1));
        }
        return Map.of();
    }

    /**
     * get dataEdit by recordId
     *
     * @param recordId recordId
     * @param userId   userId
     * @return dataEditList
     */
    public List<DataEditBO> findDataEditByRecordId(Long recordId, Long userId) {
        var lambdaQueryWrapper = new LambdaQueryWrapper<DataEdit>();
        lambdaQueryWrapper.eq(DataEdit::getAnnotationRecordId, recordId);
        lambdaQueryWrapper.eq(DataEdit::getCreatedBy, userId);
        var dataEditList = dataEditDAO.list(lambdaQueryWrapper);
        return DefaultConverter.convert(dataEditList, DataEditBO.class);
    }

    public void checkLock(Set<Long> dataIds) {
        Set<Long> lockedDataIdList = getLockedDataIdList(RequestContextHolder.getContext().getUserInfo().getId());
        if (!lockedDataIdList.containsAll(dataIds)) {
            throw new UsecaseException(UsecaseCode.DATASET__DATA__DATA_HAS_BEEN_UNLOCKED);
        }
    }

    private Set<Long> getLockedDataIdList(Long userId) {
        var dataEditQueryWrapper = Wrappers.lambdaQuery(DataEdit.class)
                .eq(DataEdit::getCreatedBy, userId);
        List<DataEdit> dataEdits = dataEditDAO.list(dataEditQueryWrapper);
        return dataEdits.stream().map(DataEdit::getDataId).collect(Collectors.toSet());
    }

}
