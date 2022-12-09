package ai.basic.x1.usecase;


import ai.basic.x1.adapter.port.dao.ClassificationDAO;
import ai.basic.x1.adapter.port.dao.DatasetClassificationDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.*;
import ai.basic.x1.adapter.port.dao.mybatis.model.Class;
import ai.basic.x1.entity.DatasetClassBO;
import ai.basic.x1.entity.DatasetClassificationBO;
import ai.basic.x1.entity.enums.SortByEnum;
import ai.basic.x1.entity.enums.SortEnum;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.util.List;

/**
 * @author fyb
 * @date 2022/3/11 14:09
 */
public class DatasetClassificationUseCase {

    @Autowired
    private DatasetClassificationDAO datasetClassificationDAO;

    @Autowired
    private ClassificationDAO classificationDAO;

    @Transactional(rollbackFor = Throwable.class)
    public void saveDatasetClassification(DatasetClassificationBO datasetClassificationBO) {
        Assert.notNull(datasetClassificationBO.getDatasetId(),()->"datasetId can not be null");
        Assert.notNull(datasetClassificationBO.getName(),()->"name can not be null");

        DatasetClassification datasetClassification = DefaultConverter.convert(datasetClassificationBO, DatasetClassification.class);
        try {
            datasetClassificationDAO.saveOrUpdate(datasetClassification);
        } catch (DuplicateKeyException e) {
            throw new UsecaseException(UsecaseCode.NAME_DUPLICATED);
        }
    }

    public boolean validateName(Long id, Long datasetId, String name) {
        LambdaQueryWrapper<DatasetClassification> lambdaQueryWrapper = new LambdaQueryWrapper<DatasetClassification>()
                .eq(DatasetClassification::getName, name)
                .eq(DatasetClassification::getDatasetId, datasetId);
        if (ObjectUtil.isNotEmpty(id)) {
            lambdaQueryWrapper.ne(DatasetClassification::getId, id);
        }
        return datasetClassificationDAO.getBaseMapper().exists(lambdaQueryWrapper);
    }

    /**
     * Paging query class information
     *
     * @param pageNo         current page number
     * @param pageSize       Display quantity per page
     * @param datasetClassificationBO condition
     * @return result
     */
    public Page<DatasetClassificationBO> findByPage(Integer pageNo, Integer pageSize, DatasetClassificationBO datasetClassificationBO) {
        LambdaQueryWrapper<DatasetClassification> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.eq(DatasetClassification::getDatasetId,datasetClassificationBO.getDatasetId())
                .eq(ObjectUtil.isNotNull(datasetClassificationBO.getInputType()),DatasetClassification::getInputType, datasetClassificationBO.getInputType())
                .ge(ObjectUtil.isNotNull(datasetClassificationBO.getStartTime()),DatasetClassification::getCreatedAt, datasetClassificationBO.getStartTime())
                .le(ObjectUtil.isNotNull(datasetClassificationBO.getEndTime()),DatasetClassification::getCreatedAt, datasetClassificationBO.getEndTime())
                .like(StrUtil.isNotEmpty(datasetClassificationBO.getName()),DatasetClassification::getName, datasetClassificationBO.getName());
        addOrderRule(lambdaQueryWrapper,datasetClassificationBO.getSortBy(),datasetClassificationBO.getAscOrDesc());
        Page<DatasetClassificationBO> datasetClassificationBOPage = DefaultConverter.convert(datasetClassificationDAO.page(com.baomidou.mybatisplus.extension.plugins.pagination.Page.of(pageNo, pageSize), lambdaQueryWrapper)
                , DatasetClassificationBO.class);
        return datasetClassificationBOPage;
    }

    public DatasetClassificationBO findById(Long id) {
        DatasetClassification datasetClassification = datasetClassificationDAO.getById(id);
        DatasetClassificationBO datasetClassificationBO = DefaultConverter.convert(datasetClassification, DatasetClassificationBO.class);
        return datasetClassificationBO;
    }

    /**
     * delete classification,logic delete
     *
     * @param id id
     */
    @Transactional(rollbackFor = Throwable.class)
    public void deleteClassification(Long id) {
        datasetClassificationDAO.removeById(id);
    }

    public List<DatasetClassificationBO> findAll(Long datasetId) {
        LambdaQueryWrapper<DatasetClassification> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.eq(DatasetClassification::getDatasetId,datasetId);
        List<DatasetClassification> list = datasetClassificationDAO.list(lambdaQueryWrapper);
        return DefaultConverter.convert(list, DatasetClassificationBO.class);
    }

    private void addOrderRule(LambdaQueryWrapper<DatasetClassification> classificationLambdaQueryWrapper, String sortBy,String ascOrDesc) {
        //Sort in ascending order by default
        boolean isAsc = StrUtil.isBlank(ascOrDesc)|| SortEnum.ASC.name().equals(ascOrDesc);
        if (StrUtil.isNotBlank(sortBy)) {
            classificationLambdaQueryWrapper.orderBy(SortByEnum.NAME.name().equals(sortBy),isAsc,DatasetClassification::getName);
            classificationLambdaQueryWrapper.orderBy(SortByEnum.CREATE_TIME.name().equals(sortBy),isAsc,DatasetClassification::getCreatedAt);
        }
    }

    public void copyFromOntologyCenter(DatasetClassificationBO datasetClassificationBO) {
        Long datasetId = datasetClassificationBO.getDatasetId();
        List<Classification> classifications = classificationDAO.listByIds(datasetClassificationBO.getClassificationIds());
        List<DatasetClassification> datasetClassifications = DefaultConverter.convert(classifications, DatasetClassification.class);
        datasetClassifications.forEach(entity -> entity.setDatasetId(datasetId));
        datasetClassificationDAO.getBaseMapper().saveOrUpdateBatch(datasetClassifications);
    }

    public void deleteClassifications(List<Long> datasetClassificationIds) {
        datasetClassificationDAO.getBaseMapper().deleteBatchIds(datasetClassificationIds);
    }

    public void saveToOntologyCenter(Long ontologyId, List<Long> datasetClassificationIds) {
        List<DatasetClassificationBO> datasetClassBOs = DefaultConverter.convert(datasetClassificationDAO.listByIds(datasetClassificationIds), DatasetClassificationBO.class);
        List<Classification> classifications = DefaultConverter.convert(datasetClassBOs, Classification.class);
        classifications.forEach(entity -> entity.setOntologyId(ontologyId));
        classificationDAO.getBaseMapper().saveOrUpdateBatch(classifications);
    }
}
