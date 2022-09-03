package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.DataInfoDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataInfo;
import ai.basic.x1.entity.enums.DataAnnotationStatusEnum;
import ai.basic.x1.entity.enums.DataStatusEnum;
import com.google.common.collect.Sets;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * @author chenchao
 * @date 2022/8/26
 */
public class DataFlowUseCase {

    @Autowired
    private DataInfoDAO dataInfoDAO;

    @Autowired
    private DataEditUseCase dataEditUseCase;

    @Transactional(rollbackFor = Exception.class)
    public void changeDataStatus(Long dataId, DataStatusEnum status){
        dataEditUseCase.checkLock(Sets.newHashSet(dataId));
        dataInfoDAO.updateById(DataInfo.builder().id(dataId).status(status).build());
    }

    @Transactional(rollbackFor = Exception.class)
    public void submit(Long dataId){
        dataEditUseCase.checkLock(Sets.newHashSet(dataId));
        DataStatusEnum status = Optional.ofNullable(dataInfoDAO.getById(dataId)).orElseThrow().getStatus();
        DataAnnotationStatusEnum annotationStatus = DataAnnotationStatusEnum.INVALID;
        if (DataStatusEnum.VALID.equals(status)){
            annotationStatus = DataAnnotationStatusEnum.ANNOTATED;
        }
        dataInfoDAO.updateById(DataInfo.builder().id(dataId).annotationStatus(annotationStatus).build());
    }

}
