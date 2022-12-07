package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.ClassDAO;
import ai.basic.x1.adapter.port.dao.DataAnnotationObjectDAO;
import ai.basic.x1.adapter.port.dao.DatasetClassDAO;
import ai.basic.x1.adapter.port.dao.DatasetClassOntologyDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.Class;
import ai.basic.x1.adapter.port.dao.mybatis.model.ClassStatisticsUnit;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataAnnotationObject;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetClass;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetClassOntology;
import ai.basic.x1.adapter.port.dao.mybatis.model.ToolTypeStatisticsUnit;
import ai.basic.x1.entity.ClassStatisticsUnitBO;
import ai.basic.x1.entity.DatasetClassBO;
import ai.basic.x1.entity.ToolTypeStatisticsUnitBO;
import ai.basic.x1.entity.enums.SortByEnum;
import ai.basic.x1.entity.enums.SortEnum;
import ai.basic.x1.entity.enums.ToolTypeEnum;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.google.common.collect.Lists;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static java.util.stream.Collectors.*;

/**
 * @author chenchao
 * @date 2022/3/11
 */
public class DatasetClassUseCase {

    @Autowired
    private DatasetClassDAO datasetClassDao;

    @Autowired
    private DatasetClassOntologyDAO datasetClassOntologyDAO;

    @Autowired
    private DataAnnotationObjectDAO dataAnnotationObjectDAO;

    @Autowired
    private ClassDAO classDAO;

    /**
     * create or update DatasetClass
     *
     * @param datasetClassBO datasetClassBO
     */
    @Transactional(rollbackFor = Throwable.class)
    public void saveDatasetClass(DatasetClassBO datasetClassBO) {
        Assert.notNull(datasetClassBO.getDatasetId(), () -> "datasetId can not be null");
        Assert.notNull(datasetClassBO.getName(), () -> "name can not be null");

        DatasetClass datasetClass = DefaultConverter.convert(datasetClassBO, DatasetClass.class);
        try {
            datasetClassDao.saveOrUpdate(datasetClass);
        } catch (DuplicateKeyException e) {
            throw new UsecaseException(UsecaseCode.NAME_DUPLICATED);
        }
        if (ObjectUtil.isNotNull(datasetClassBO.getOntologyId()) && ObjectUtil.isNotNull(datasetClassBO.getClassId())) {
            var datasetClassOntology = DatasetClassOntology.builder()
                    .datasetClassId(datasetClass.getId())
                    .ontologyId(datasetClassBO.getOntologyId())
                    .classId(datasetClassBO.getClassId())
                    .build();
            datasetClassOntologyDAO.getBaseMapper().saveOrUpdateBatch(Lists.newArrayList(datasetClassOntology));
        } else if (ObjectUtil.isNull(datasetClassBO.getOntologyId()) && ObjectUtil.isNull(datasetClassBO.getClassId())) {
            removeDatasetClassOntology(datasetClass.getId());
        }
    }

    private void removeDatasetClassOntology(Long datasetClassId) {
        var wrapper = new LambdaQueryWrapper<DatasetClassOntology>().eq(DatasetClassOntology::getDatasetClassId, datasetClassId);
        datasetClassOntologyDAO.remove(wrapper);
    }

    /**
     * The name cannot be repeated under the same dataset and tool type
     *
     * @param id        dataset class id
     * @param datasetId dataset id
     * @param name      dataset class name
     * @return if exists return true
     */
    public boolean validateName(Long id, Long datasetId, String name, ToolTypeEnum toolType) {
        LambdaQueryWrapper<DatasetClass> lambdaQueryWrapper = new LambdaQueryWrapper<DatasetClass>()
                .eq(DatasetClass::getName, name)
                .eq(DatasetClass::getDatasetId, datasetId)
                .eq(DatasetClass::getToolType, toolType);
        if (ObjectUtil.isNotEmpty(id)) {
            lambdaQueryWrapper.ne(DatasetClass::getId, id);
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
        lambdaQueryWrapper.eq(DatasetClass::getDatasetId, datasetClassBO.getDatasetId())
                .eq(ObjectUtil.isNotNull(datasetClassBO.getToolType()), DatasetClass::getToolType, datasetClassBO.getToolType())
                .ge(ObjectUtil.isNotNull(datasetClassBO.getStartTime()), DatasetClass::getCreatedAt, datasetClassBO.getStartTime())
                .le(ObjectUtil.isNotNull(datasetClassBO.getEndTime()), DatasetClass::getCreatedAt, datasetClassBO.getEndTime())
                .like(StrUtil.isNotEmpty(datasetClassBO.getName()), DatasetClass::getName, datasetClassBO.getName());
        addOrderRule(lambdaQueryWrapper, datasetClassBO.getSortBy(), datasetClassBO.getAscOrDesc());
        return DefaultConverter.convert(datasetClassDao.page(com.baomidou.mybatisplus.extension.plugins.pagination.Page.of(pageNo, pageSize), lambdaQueryWrapper), DatasetClassBO.class);
    }

    public DatasetClassBO findById(Long id) {
        LambdaQueryWrapper<DatasetClass> datasetClassLambdaQueryWrapper = new LambdaQueryWrapper<>();
        datasetClassLambdaQueryWrapper.eq(DatasetClass::getId, id);
        DatasetClassBO datasetClassBO = DefaultConverter.convert(datasetClassDao.getOne(datasetClassLambdaQueryWrapper), DatasetClassBO.class);
        var datasetClassOntologyWrapper = new LambdaQueryWrapper<DatasetClassOntology>().eq(DatasetClassOntology::getDatasetClassId, id);
        DatasetClassOntology one = datasetClassOntologyDAO.getOne(datasetClassOntologyWrapper);
        if (ObjectUtil.isNotNull(one)) {
            datasetClassBO.setOntologyId(one.getOntologyId());
            datasetClassBO.setClassId(one.getClassId());
        }
        return datasetClassBO;
    }

    /**
     * delete class,logic delete
     *
     * @param id id
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteClass(Long id) {
        var datasetClassOntologyWrapper = new LambdaQueryWrapper<DatasetClassOntology>().eq(DatasetClassOntology::getDatasetClassId, id);
        datasetClassOntologyDAO.remove(datasetClassOntologyWrapper);
        datasetClassDao.removeById(id);
    }

    public List<DatasetClassBO> findAll(Long datasetId) {
        LambdaQueryWrapper<DatasetClass> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.eq(DatasetClass::getDatasetId, datasetId);
        List<DatasetClass> list = datasetClassDao.list(lambdaQueryWrapper);
        return DefaultConverter.convert(list, DatasetClassBO.class);
    }

    private void addOrderRule(LambdaQueryWrapper<DatasetClass> classificationLambdaQueryWrapper, String sortBy, String ascOrDesc) {
        //Sort in ascending order by default
        boolean isAsc = StrUtil.isBlank(ascOrDesc) || SortEnum.ASC.name().equals(ascOrDesc);
        if (StrUtil.isNotBlank(sortBy)) {
            classificationLambdaQueryWrapper.orderBy(SortByEnum.NAME.name().equals(sortBy), isAsc, DatasetClass::getName);
            classificationLambdaQueryWrapper.orderBy(SortByEnum.CREATE_TIME.name().equals(sortBy), isAsc, DatasetClass::getCreatedAt);
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
                .collect(toList());
        Map<Long, DatasetClassBO> classMap = getClassMap(classIds);
        return pageResults.getRecords().stream().map(e -> {
            var cla = classMap.getOrDefault(e.getClassId(), new DatasetClassBO());
            return ClassStatisticsUnitBO.builder()
                    .toolType(cla.getToolType())
                    .name(cla.getName() == null ? "No class" : cla.getName())
                    .objectAmount(e.getObjectAmount())
                    .color(cla.getColor() == null ? "#dedede" : cla.getColor())
                    .build();
        }).collect(toList());
    }

    public List<ToolTypeStatisticsUnitBO> statisticsObjectByToolType(Long datasetId) {
        var toolTypeUnits = datasetClassDao.getBaseMapper()
                .statisticsObjectByToolType(datasetId);

        long noClassObjectCount = dataAnnotationObjectDAO.count(new LambdaQueryWrapper<DataAnnotationObject>()
                .eq(DataAnnotationObject::getDatasetId, datasetId)
                .isNull(DataAnnotationObject::getClassId)
        );
        toolTypeUnits.add(ToolTypeStatisticsUnit.builder()
                .toolType(null)
                .objectAmount((int) noClassObjectCount)
                .build()
        );
        return DefaultConverter.convert(toolTypeUnits, ToolTypeStatisticsUnitBO.class);
    }

    private Map<Long, DatasetClassBO> getClassMap(List<Long> classIds) {
        return findByIds(classIds).stream().collect(toMap(DatasetClassBO::getId, t -> t));
    }

    public List<DatasetClassBO> findByIds(List<Long> classIds) {
        if (CollUtil.isEmpty(classIds)) {
            return List.of();
        }
        return DefaultConverter.convert(datasetClassDao.listByIds(classIds), DatasetClassBO.class);
    }


    @Transactional(rollbackFor = Exception.class)
    public void copyFromOntologyCenter(DatasetClassBO datasetClassBO) {
        Long datasetId = datasetClassBO.getDatasetId();
        List<Class> classes = classDAO.listByIds(datasetClassBO.getClassIds());
        List<DatasetClass> datasetClasses = DefaultConverter.convert(classes, DatasetClass.class);
        datasetClasses.forEach(entity -> entity.setDatasetId(datasetId));
        datasetClassDao.getBaseMapper().saveOrUpdateBatch(datasetClasses);
        List<DatasetClassBO> datasetClassResult = DefaultConverter.convert(datasetClassDao.getBaseMapper().getDatasetClass(datasetId, datasetClasses), DatasetClassBO.class);
        List<DatasetClassOntology> relations = new ArrayList<>();
        for (DatasetClassBO bo : datasetClassResult) {
            for (Class clazz : classes) {
                if (bo.getName().equals(clazz.getName()) && bo.getToolType().equals(clazz.getToolType())) {
                    DatasetClassOntology relation = DatasetClassOntology
                            .builder()
                            .datasetClassId(bo.getId())
                            .ontologyId(clazz.getOntologyId())
                            .classId(clazz.getId())
                            .build();
                    relations.add(relation);
                    break;
                }
            }
        }
        datasetClassOntologyDAO.getBaseMapper().saveOrUpdateBatch(relations);
    }
}
