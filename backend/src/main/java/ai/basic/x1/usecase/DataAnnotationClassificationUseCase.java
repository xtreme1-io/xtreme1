package ai.basic.x1.usecase;

import ai.basic.x1.adapter.api.context.RequestContextHolder;
import ai.basic.x1.adapter.port.dao.DataAnnotationClassificationDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataAnnotationClassification;
import ai.basic.x1.entity.DataAnnotationClassificationBO;
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
public class DataAnnotationClassificationUseCase {

    @Autowired
    private DataAnnotationClassificationDAO dataAnnotationClassificationDAO;

    @Autowired
    private DataClassificationOptionUseCase dataClassificationOptionUseCase;

    /**
     * query classifications annotation results
     *
     * @param dataIds data id list
     * @return annotate result list
     */
    public List<DataAnnotationClassificationBO> findByDataIds(Collection<Long> dataIds) {
        var lambdaQueryWrapper = Wrappers.lambdaQuery(DataAnnotationClassification.class);
        lambdaQueryWrapper.in(DataAnnotationClassification::getDataId, dataIds);
        return DefaultConverter.convert(dataAnnotationClassificationDAO.list(lambdaQueryWrapper), DataAnnotationClassificationBO.class);
    }

    /**
     * for one data and one classiofication, it can only have one record, so query all saved dataAnnotations,
     * use classification id to match, if they match, update, if not, insert
     *
     * @param dataAnnotationClassificationBOs records that need save
     */
    @Transactional(rollbackFor = Exception.class)
    public void save(List<DataAnnotationClassificationBO> dataAnnotationClassificationBOs) {
        if (ObjectUtil.isEmpty(dataAnnotationClassificationBOs)) {
            return;
        }
        Set<Long> dataIds = dataAnnotationClassificationBOs.stream().map(DataAnnotationClassificationBO::getDataId).collect(Collectors.toSet());
        List<DataAnnotationClassificationBO> oldInfos = findByDataIds(dataIds);
        dataAnnotationClassificationBOs.forEach(bo -> {
            bo.setCreatedAt(OffsetDateTime.now());
            bo.setCreatedBy(RequestContextHolder.getContext().getUserInfo().getId());
            for (DataAnnotationClassificationBO annotationBO : oldInfos) {
                if (ObjectUtil.equals(annotationBO.getDataId(), bo.getDataId())
                        && ObjectUtil.equals(annotationBO.getClassificationId(), bo.getClassificationId())) {
                    bo.setId(annotationBO.getId());
                    bo.setCreatedAt(annotationBO.getCreatedAt());
                    bo.setCreatedBy(annotationBO.getCreatedBy());
                }
            }
        });

        Set<Long> annotationIds = dataAnnotationClassificationBOs.stream()
                .map(DataAnnotationClassificationBO::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        dataAnnotationClassificationDAO.getBaseMapper().mysqlInsertOrUpdateBatch(DefaultConverter.convert(dataAnnotationClassificationBOs, DataAnnotationClassification.class));
        dataClassificationOptionUseCase.saveBatch(dataAnnotationClassificationBOs);

        Set<Long> oldIds = oldInfos.stream().map(DataAnnotationClassificationBO::getId).collect(Collectors.toSet());
        // Obtain the comparison between the original data and the new data,
        // and delete what is not in the new data. The function of this method is to obtain the difference set
        oldIds.removeIf(annotationIds::contains);
        dataAnnotationClassificationDAO.removeBatchByIds(oldIds);
    }
}
