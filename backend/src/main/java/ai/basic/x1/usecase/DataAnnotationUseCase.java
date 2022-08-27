package ai.basic.x1.usecase;

import ai.basic.x1.adapter.api.context.RequestContextHolder;
import ai.basic.x1.adapter.port.dao.DataAnnotationDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataAnnotation;
import ai.basic.x1.entity.DataAnnotationBO;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.util.ObjectUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author chenchao
 * @date 2022/8/26
 */
public class DataAnnotationUseCase {

    @Autowired
    private DataAnnotationDAO dataAnnotationDAO;

//
//    @Autowired
//    private DataEditDAO dataEditDAO;

    /**
     * 查询classifications标注结果
     *
     * @param dataIds 数据ID集合
     * @return 数据标注集合
     */
    public List<DataAnnotationBO> findByDataIds(Collection<Long> dataIds) {
        var lambdaQueryWrapper = Wrappers.lambdaQuery(DataAnnotation.class);
        lambdaQueryWrapper.in(DataAnnotation::getDataId, dataIds);
        return DefaultConverter.convert(dataAnnotationDAO.list(lambdaQueryWrapper), DataAnnotationBO.class);
    }

    /**
     * 查询出所有保存的dataAnnotation，用classificationid去匹配，如果匹配上了就更新，没有就插入
     *
     * @param dataAnnotationBOs 输入的数据
     */
    @Transactional(rollbackFor = Exception.class)
    public void saveDataAnnotation(List<DataAnnotationBO> dataAnnotationBOs) {

//        checkPermission(dataAnnotationBOs);

        if (ObjectUtil.isEmpty(dataAnnotationBOs)) {
            return;
        }
        Set<Long> dataIds = dataAnnotationBOs.stream().map(DataAnnotationBO::getDataId).collect(Collectors.toSet());
        List<DataAnnotationBO> oldInfos = findByDataIds(dataIds);

        dataAnnotationBOs.forEach(bo -> {
            bo.setCreatedAt(OffsetDateTime.now());
            bo.setCreatedBy(RequestContextHolder.getContext().getUserInfo().getId());
            for (DataAnnotationBO annotationBO : oldInfos) {
                if (ObjectUtil.equals(annotationBO.getDataId(), bo.getDataId())
                        && ObjectUtil.equals(annotationBO.getClassificationId(), bo.getClassificationId())) {
                    bo.setId(annotationBO.getId());
                    bo.setCreatedAt(annotationBO.getCreatedAt());
                    bo.setCreatedBy(annotationBO.getCreatedBy());
                }
            }
        });

        Set<Long> annotationIds = dataAnnotationBOs.stream()
                .map(DataAnnotationBO::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        dataAnnotationDAO.getBaseMapper().mysqlInsertOrUpdateBatch(DefaultConverter.convert(dataAnnotationBOs, DataAnnotation.class));

        Set<Long> oldIds = oldInfos.stream().map(DataAnnotationBO::getId).collect(Collectors.toSet());
        //获得原数据和新数据对比，新数据中没有的就删除，该方法的作用是获取差集
        oldIds.removeIf(annotationIds::contains);
        dataAnnotationDAO.removeBatchByIds(oldIds);
    }

//    private void checkPermission(List<DataAnnotationBO> dataAnnotationBOs) {
//        Set<Long> lockedDataIdList = getLockedDataIdList(RequestContextHolder.getContext().getUserInfo().getId());
//        Set<Long> dataIds = dataAnnotationBOs.stream().map(DataAnnotationBO::getDataId).collect(Collectors.toSet());
//        if (!lockedDataIdList.containsAll(dataIds)) {
//            throw new UsecaseException(UsecaseCode.DATASET__DATA__DATA_HAS_BEEN_UNLOCKED);
//        }
//    }

//    public Set<Long> getLockedDataIdList(@NotNull Long userId){
//        var dataEditQueryWrapper = Wrappers.lambdaQuery(DataEdit.class)
//                .eq(DataEdit::getCreatedBy, userId);
//        List<DataEdit> dataEdits = dataEditDAO.list(dataEditQueryWrapper);
//        return dataEdits.stream().map(DataEdit::getDataId).collect(Collectors.toSet());
//    }
}
