package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.DatasetClassDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.ClassStatisticsUnit;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetClass;
import ai.basic.x1.entity.ClassStatisticsUnitBO;
import ai.basic.x1.entity.DatasetClassBO;
import ai.basic.x1.entity.ToolTypeStatisticsUnitBO;
import ai.basic.x1.entity.enums.SortByEnum;
import ai.basic.x1.entity.enums.SortEnum;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * @author chenchao
 * @date 2022/3/11
 */
public class DatasetClassUseCase {

    @Autowired
    private DatasetClassDAO datasetClassDao;

    /**
     * create or update DatasetClass
     *
     * @param datasetClassBO datasetClassBO
     */
    @Transactional(rollbackFor = Throwable.class)
    public void saveDatasetClass(DatasetClassBO datasetClassBO){
        Assert.notNull(datasetClassBO.getDatasetId(),()->"datasetId can not be null");
        Assert.notNull(datasetClassBO.getName(),()->"name can not be null");

        if (Objects.nonNull(datasetClassBO.getId())){
            if (findById(datasetClassBO.getId()) == null) {
                throw new UsecaseException(UsecaseCode.NOT_FOUND);
            }
        }
        if (nameExists(datasetClassBO)){
            throw new UsecaseException(UsecaseCode.NAME_DUPLICATED);
        }

        DatasetClass datasetClass = DefaultConverter.convert(datasetClassBO, DatasetClass.class);
        datasetClassDao.saveOrUpdate(datasetClass);
    }

    public boolean nameExists(DatasetClassBO bo) {
        LambdaQueryWrapper<DatasetClass> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.eq(DatasetClass::getName, bo.getName());
        lambdaQueryWrapper.eq(DatasetClass::getDatasetId,bo.getDatasetId());
        if (ObjectUtil.isNotEmpty(bo.getId())) {
            lambdaQueryWrapper.ne(DatasetClass::getId, bo.getId());
        }
        return datasetClassDao.getBaseMapper().exists(lambdaQueryWrapper);
    }

    /**
     * Paging query class information
     *
     * @param pageNo         current page number
     * @param pageSize       Display quantity per page
     * @param datasetClassBO condition
     * @return result
     */
    public Page<DatasetClassBO> findByPage(Integer pageNo, Integer pageSize, DatasetClassBO datasetClassBO) {
        LambdaQueryWrapper<DatasetClass> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.eq(DatasetClass::getDatasetId,datasetClassBO.getDatasetId())
                .eq(ObjectUtil.isNotNull(datasetClassBO.getToolType()), DatasetClass::getToolType, datasetClassBO.getToolType())
                .ge(ObjectUtil.isNotNull(datasetClassBO.getStartTime()), DatasetClass::getCreatedAt, datasetClassBO.getStartTime())
                .le(ObjectUtil.isNotNull(datasetClassBO.getEndTime()), DatasetClass::getCreatedAt, datasetClassBO.getEndTime())
                .like(StrUtil.isNotEmpty(datasetClassBO.getName()), DatasetClass::getName, datasetClassBO.getName());
        addOrderRule(lambdaQueryWrapper,datasetClassBO.getSortBy(),datasetClassBO.getAscOrDesc());
        Page<DatasetClassBO> datasetClassBOPage = DefaultConverter.convert(datasetClassDao.page(com.baomidou.mybatisplus.extension.plugins.pagination.Page.of(pageNo, pageSize), lambdaQueryWrapper), DatasetClassBO.class);
        return datasetClassBOPage;
    }

    public DatasetClassBO findById(Long id) {
        LambdaQueryWrapper<DatasetClass> datasetClassLambdaQueryWrapper = new LambdaQueryWrapper<>();
        datasetClassLambdaQueryWrapper.eq(DatasetClass::getId, id);
        DatasetClassBO datasetClassBO = DefaultConverter.convert(datasetClassDao.getOne(datasetClassLambdaQueryWrapper), DatasetClassBO.class);
        return datasetClassBO;
    }

    /**
     * delete class,logic delete
     *
     * @param id     id
     * @return true-false
     */
    public Boolean deleteClass(Long id) {
        return datasetClassDao.removeById(id);
    }

    public List<DatasetClassBO> findAll(Long datasetId) {
        LambdaQueryWrapper<DatasetClass> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.eq(DatasetClass::getDatasetId,datasetId);
        List<DatasetClass> list = datasetClassDao.list(lambdaQueryWrapper);
        return DefaultConverter.convert(list,DatasetClassBO.class);
    }

    private void addOrderRule(LambdaQueryWrapper<DatasetClass> classificationLambdaQueryWrapper, String sortBy,String ascOrDesc) {
        //Sort in ascending order by default
        boolean isAsc = StrUtil.isBlank(ascOrDesc)|| SortEnum.ASC.name().equals(ascOrDesc);
        if (StrUtil.isNotBlank(sortBy)) {
            classificationLambdaQueryWrapper.orderBy(SortByEnum.NAME.name().equals(sortBy),isAsc,DatasetClass::getName);
            classificationLambdaQueryWrapper.orderBy(SortByEnum.CREATE_TIME.name().equals(sortBy),isAsc,DatasetClass::getCreatedAt);
        }
    }

    public List<ClassStatisticsUnitBO> statisticObjectByClass(Long datasetId, int pageNo,
                                                          int pageSize) {
        var page = new com.baomidou.mybatisplus.extension.plugins.pagination.Page<ClassStatisticsUnit>(pageNo,
                pageSize);
        var pageResults = datasetClassDao.getBaseMapper().statisticsObjectByClass(page, datasetId);
        if (CollUtil.isEmpty(pageResults.getRecords())) {
            return List.of();
        }
        var classIds = pageResults.getRecords().stream().map(ClassStatisticsUnit::getClassId)
                .collect(Collectors.toList());
        Map<Long, DatasetClassBO> classMap = getClassMap(classIds);
        return pageResults.getRecords().stream().map(e -> {
            var cla = classMap.getOrDefault(e.getClassId(), new DatasetClassBO());
            return ClassStatisticsUnitBO.builder()
                    .toolType(cla.getToolType())
                    .name(cla.getName() == null ? "No class" : cla.getName())
                    .objectAmount(e.getObjectCount())
                    .color(cla.getColor() == null ? "#dedede" : cla.getColor())
                    .build();
        }).collect(Collectors.toList());
    }

    public List<ToolTypeStatisticsUnitBO> statisticsObjectByToolType(Long datasetId) {
        var toolTypeUnits = datasetClassDao.getBaseMapper()
                .statisticsObjectByToolType(datasetId);
        return DefaultConverter.convert(toolTypeUnits, ToolTypeStatisticsUnitBO.class);
    }

    private Map<Long, DatasetClassBO> getClassMap(List<Long> classIds) {
        return findByIds(classIds).stream().collect(Collectors.toMap(DatasetClassBO::getId, t -> t));
    }

    public List<DatasetClassBO> findByIds(List<Long> classIds) {
        if (CollUtil.isEmpty(classIds)) {
            return List.of();
        }
        return DefaultConverter.convert(datasetClassDao.listByIds(classIds), DatasetClassBO.class);
    }



}
