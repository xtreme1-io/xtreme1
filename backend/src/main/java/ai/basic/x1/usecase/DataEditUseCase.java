package ai.basic.x1.usecase;

import ai.basic.x1.adapter.api.context.RequestContextHolder;
import ai.basic.x1.adapter.port.dao.DataEditDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataEdit;
import ai.basic.x1.entity.DataEditBO;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.util.ObjectUtil;
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
        lambdaQueryWrapper.orderByAsc(DataEdit::getId);
        var dataEditList = dataEditDAO.list(lambdaQueryWrapper);
        return DefaultConverter.convert(dataEditList, DataEditBO.class);
    }

    public DataEdit checkLock(Set<Long> dataIds) {
        List<DataEdit> dataEdits = getLockedDataIdList(RequestContextHolder.getContext().getUserInfo().getId());
        if (CollectionUtil.isEmpty(dataEdits)) {
            throw new UsecaseException(UsecaseCode.DATASET__DATA__DATA_HAS_BEEN_UNLOCKED);
        }
        var lockedDataIdList = dataEdits.stream().map(DataEdit::getDataId).collect(Collectors.toSet());
        var lockedSceneIdList = dataEdits.stream().filter(dataEdit -> ObjectUtil.isNotNull(dataEdit.getSceneId()))
                .map(DataEdit::getSceneId).collect(Collectors.toSet());
        if (!lockedDataIdList.containsAll(dataIds) && !lockedSceneIdList.containsAll(dataIds)) {
            throw new UsecaseException(UsecaseCode.DATASET__DATA__DATA_HAS_BEEN_UNLOCKED);
        }
        return dataEdits.stream().findFirst().orElse(new DataEdit());
    }

    private List<DataEdit> getLockedDataIdList(Long userId) {
        var dataEditQueryWrapper = Wrappers.lambdaQuery(DataEdit.class)
                .eq(DataEdit::getCreatedBy, userId);
        List<DataEdit> dataEdits = dataEditDAO.list(dataEditQueryWrapper);
        return dataEdits;
    }

}
