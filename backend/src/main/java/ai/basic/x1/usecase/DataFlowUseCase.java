package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.DataInfoDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataEdit;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataInfo;
import ai.basic.x1.entity.enums.DataAnnotationStatusEnum;
import ai.basic.x1.entity.enums.DataStatusEnum;
import cn.hutool.core.util.ObjectUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.google.common.collect.Sets;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * @author chenchao, chanYoung
 * @date 2024/4/15
 */
public class DataFlowUseCase {

    @Autowired
    private DataInfoDAO dataInfoDAO;

    @Autowired
    private DataEditUseCase dataEditUseCase;

    @Transactional(rollbackFor = Exception.class)
    public void changeDataStatus(Long dataId, DataStatusEnum status) {
        var dataEdit = dataEditUseCase.checkLock(Sets.newHashSet(dataId));
        dataInfoDAO.updateById(DataInfo.builder().id(dataId).status(status).build());
        var sceneId = dataEdit.getSceneId();
        if (ObjectUtil.isNotNull(sceneId) && DataStatusEnum.INVALID.equals(status)) {
            dataInfoDAO.updateById(DataInfo.builder().id(sceneId).status(status).build());
        } else if (ObjectUtil.isNotNull(sceneId) && DataStatusEnum.VALID.equals(status)) {
            var lambdaQueryWrapper = Wrappers.lambdaQuery(DataInfo.class);
            lambdaQueryWrapper.eq(DataInfo::getDatasetId, dataEdit.getDatasetId());
            lambdaQueryWrapper.eq(DataInfo::getParentId, sceneId);
            lambdaQueryWrapper.eq(DataInfo::getStatus, DataStatusEnum.INVALID);
            if (dataInfoDAO.count() == 0) {
                dataInfoDAO.updateById(DataInfo.builder().id(sceneId).status(status).build());
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void submit(Long itemId) {
        var dataEdit = dataEditUseCase.checkLock(Sets.newHashSet(itemId));
        DataStatusEnum status = Optional.ofNullable(dataInfoDAO.getById(itemId)).orElseThrow().getStatus();
        DataAnnotationStatusEnum annotationStatus = DataAnnotationStatusEnum.INVALID;
        if (DataStatusEnum.VALID.equals(status)) {
            annotationStatus = DataAnnotationStatusEnum.ANNOTATED;
        }
        dataInfoDAO.updateById(DataInfo.builder().id(itemId).status(status).annotationStatus(annotationStatus).build());
        var sceneId = dataEdit.getSceneId();
        if (ObjectUtil.isNotNull(sceneId)) {
            var lambdaQueryWrapper = Wrappers.lambdaQuery(DataInfo.class);
            lambdaQueryWrapper.eq(DataInfo::getDatasetId, dataEdit.getDatasetId());
            lambdaQueryWrapper.eq(DataInfo::getParentId, sceneId);
            lambdaQueryWrapper.eq(DataInfo::getStatus, DataStatusEnum.INVALID);
            if (dataInfoDAO.count(lambdaQueryWrapper) == 0) {
                dataInfoDAO.updateById(DataInfo.builder().id(sceneId).status(DataStatusEnum.VALID).annotationStatus(DataAnnotationStatusEnum.ANNOTATED).build());
                var dataInfoLambdaUpdateWrapper = Wrappers.lambdaUpdate(DataInfo.class)
                        .eq(DataInfo::getDatasetId, dataEdit.getDatasetId())
                        .eq(DataInfo::getParentId, sceneId);
                dataInfoLambdaUpdateWrapper.set(DataInfo::getAnnotationStatus, DataAnnotationStatusEnum.ANNOTATED);
                dataInfoDAO.update(dataInfoLambdaUpdateWrapper);
            } else {
                dataInfoDAO.updateById(DataInfo.builder().id(sceneId).status(DataStatusEnum.INVALID).annotationStatus(DataAnnotationStatusEnum.INVALID).build());
                var dataInfoLambdaUpdateWrapper = Wrappers.lambdaUpdate(DataInfo.class)
                        .eq(DataInfo::getDatasetId, dataEdit.getDatasetId())
                        .eq(DataInfo::getParentId, sceneId)
                        .eq(DataInfo::getStatus, DataStatusEnum.VALID);
                dataInfoLambdaUpdateWrapper.set(DataInfo::getAnnotationStatus, DataAnnotationStatusEnum.ANNOTATED);
                dataInfoDAO.update(dataInfoLambdaUpdateWrapper);

                var dataInfoLambdaUpdateWrapper2 = Wrappers.lambdaUpdate(DataInfo.class)
                        .eq(DataInfo::getDatasetId, dataEdit.getDatasetId())
                        .eq(DataInfo::getParentId, sceneId)
                        .eq(DataInfo::getStatus, DataStatusEnum.INVALID);
                dataInfoLambdaUpdateWrapper2.set(DataInfo::getAnnotationStatus, DataAnnotationStatusEnum.INVALID);
                dataInfoDAO.update(dataInfoLambdaUpdateWrapper2);
            }
        }
    }

}
