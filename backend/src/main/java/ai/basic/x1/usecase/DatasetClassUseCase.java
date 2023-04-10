package ai.basic.x1.usecase;

import ai.basic.x1.adapter.api.context.RequestContextHolder;
import ai.basic.x1.adapter.port.dao.ClassDAO;
import ai.basic.x1.adapter.port.dao.DataAnnotationObjectDAO;
import ai.basic.x1.adapter.port.dao.DatasetClassDAO;
import ai.basic.x1.adapter.port.dao.DatasetClassOntologyDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.Class;
import ai.basic.x1.adapter.port.dao.mybatis.model.ClassStatisticsUnit;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetClass;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetClassOntology;
import ai.basic.x1.entity.ClassBO;
import ai.basic.x1.entity.ClassStatisticsUnitBO;
import ai.basic.x1.entity.DatasetClassBO;
import ai.basic.x1.entity.ToolTypeStatisticsUnitBO;
import ai.basic.x1.entity.enums.ScenarioQuerySourceEnum;
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
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.google.common.collect.Lists;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.time.OffsetDateTime;
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
    private DatasetClassDAO datasetClassDAO;

    @Autowired
    private DatasetClassOntologyDAO datasetClassOntologyDAO;

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
            datasetClassDAO.saveOrUpdate(datasetClass);
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
        return datasetClassDAO.getBaseMapper().exists(lambdaQueryWrapper);
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
        return DefaultConverter.convert(datasetClassDAO.page(com.baomidou.mybatisplus.extension.plugins.pagination.Page.of(pageNo, pageSize), lambdaQueryWrapper), DatasetClassBO.class);
    }

    public DatasetClassBO findById(Long id) {
        LambdaQueryWrapper<DatasetClass> datasetClassLambdaQueryWrapper = new LambdaQueryWrapper<>();
        datasetClassLambdaQueryWrapper.eq(DatasetClass::getId, id);
        DatasetClassBO datasetClassBO = DefaultConverter.convert(datasetClassDAO.getOne(datasetClassLambdaQueryWrapper), DatasetClassBO.class);
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
        datasetClassDAO.removeById(id);
    }

    public List<DatasetClassBO> findAll(Long datasetId) {
        LambdaQueryWrapper<DatasetClass> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.eq(DatasetClass::getDatasetId, datasetId);
        List<DatasetClass> list = datasetClassDAO.list(lambdaQueryWrapper);
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

    public List<ClassStatisticsUnitBO> statisticObjectByClass(Long datasetId) {

        var classStatisticsUnits = datasetClassDAO.getBaseMapper().statisticsObjectByClass(datasetId);
        if (CollUtil.isEmpty(classStatisticsUnits)) {
            return List.of();
        }
        var classIds = classStatisticsUnits.stream().map(ClassStatisticsUnit::getClassId)
                .collect(toList());
        Map<Long, DatasetClassBO> classMap = getClassMap(classIds);
        return classStatisticsUnits.stream().map(e -> {
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
        var toolTypeUnits = datasetClassDAO.getBaseMapper()
                .statisticsObjectByToolType(datasetId);

        return DefaultConverter.convert(toolTypeUnits, ToolTypeStatisticsUnitBO.class);
    }

    private Map<Long, DatasetClassBO> getClassMap(List<Long> classIds) {
        return findByIds(null,classIds).stream().collect(toMap(DatasetClassBO::getId, t -> t));
    }

    public List<DatasetClassBO> findByIds(Long datasetId,List<Long> classIds) {
        if (CollUtil.isEmpty(classIds)) {
            return List.of();
        }
        var lambdaQueryWrapper = Wrappers.lambdaQuery(DatasetClass.class);
        lambdaQueryWrapper.in(DatasetClass::getId,classIds);
        lambdaQueryWrapper.eq(ObjectUtil.isNotNull(datasetId),DatasetClass::getDatasetId,datasetId);
        return DefaultConverter.convert(datasetClassDAO.list(lambdaQueryWrapper), DatasetClassBO.class);
    }


    @Transactional(rollbackFor = Exception.class)
    public void copyFromOntologyCenter(DatasetClassBO datasetClassBO) {
        Long datasetId = datasetClassBO.getDatasetId();
        List<ClassBO> classes = DefaultConverter.convert(classDAO.listByIds(datasetClassBO.getClassIds()), ClassBO.class);
        List<DatasetClass> datasetClasses = DefaultConverter.convert(classes, DatasetClass.class);
        datasetClasses.forEach(entity -> entity.setDatasetId(datasetId));
        datasetClassDAO.getBaseMapper().saveOrUpdateBatch(datasetClasses);
        List<DatasetClassBO> datasetClassResult = DefaultConverter.convert(datasetClassDAO.getBaseMapper().getDatasetClasses(datasetId, datasetClasses), DatasetClassBO.class);
        associateRelationships(classes,datasetClassResult);
    }

    /**
     * @param datasetId dataset that need insert
     * @param classId
     * @param source    source of class, ontology or dataset
     * @return value is id of  insertedclass
     */
    @Transactional(rollbackFor = Exception.class)
    public Long copyClassesToNewDataset(Long datasetId, Long classId, ScenarioQuerySourceEnum source) {
        DatasetClass datasetClass;
        if (ScenarioQuerySourceEnum.DATASET_CLASS.equals(source)) {
            datasetClass = datasetClassDAO.getById(classId);
            if (ObjectUtil.isNull(datasetClass)) {
                throw new UsecaseException(UsecaseCode.UNKNOWN, "can not find class by class id " + classId);
            }
        } else if (ScenarioQuerySourceEnum.ONTOLOGY.equals(source)) {
            Class clazz = classDAO.getById(classId);
            if (ObjectUtil.isNull(clazz)) {
                throw new UsecaseException(UsecaseCode.UNKNOWN, "can not find class by class id " + classId);
            }
            datasetClass = DefaultConverter.convert(clazz, DatasetClass.class);
        } else {
            throw new UsecaseException(UsecaseCode.UNKNOWN);
        }
        datasetClass.setDatasetId(datasetId);
        datasetClass.setId(null);
        datasetClass.setCreatedAt(OffsetDateTime.now());
        datasetClass.setCreatedBy(RequestContextHolder.getContext().getUserInfo().getId());
        datasetClass.setUpdatedAt(null);
        datasetClass.setUpdatedBy(null);
        datasetClassDAO.save(datasetClass);
        return datasetClass.getId();
    }

    public void deleteClasses(List<Long> datasetClassIds) {
        var datasetClassOntologyWrapper = new LambdaQueryWrapper<DatasetClassOntology>().in(DatasetClassOntology::getDatasetClassId, datasetClassIds);
        datasetClassOntologyDAO.remove(datasetClassOntologyWrapper);
        datasetClassDAO.getBaseMapper().deleteBatchIds(datasetClassIds);
    }

    public void saveToOntologyCenter(Long ontologyId, List<Long> datasetClassIds) {
        List<DatasetClassBO> datasetClassBOs = DefaultConverter.convert(datasetClassDAO.listByIds(datasetClassIds), DatasetClassBO.class);
        List<Class> classes = DefaultConverter.convert(datasetClassBOs, Class.class);
        classes.forEach(entity -> entity.setOntologyId(ontologyId));
        classDAO.getBaseMapper().saveOrUpdateBatch(classes);
        List<ClassBO> classResult = DefaultConverter.convert(classDAO.getBaseMapper().getClasses(ontologyId, classes), ClassBO.class);
        associateRelationships(classResult, datasetClassBOs);
    }

    private void associateRelationships(List<ClassBO> classBOs, List<DatasetClassBO> datasetClassBOs) {
        List<DatasetClassOntology> relations = new ArrayList<>();
        for (ClassBO bo : classBOs) {
            for (DatasetClassBO datasetClassBO : datasetClassBOs) {
                if (datasetClassBO.getName().equals(bo.getName()) && datasetClassBO.getToolType().equals(bo.getToolType())) {
                    DatasetClassOntology relation = DatasetClassOntology
                            .builder()
                            .datasetClassId(datasetClassBO.getId())
                            .ontologyId(bo.getOntologyId())
                            .classId(bo.getId())
                            .build();
                    relations.add(relation);
                    break;
                }
            }
        }
        datasetClassOntologyDAO.getBaseMapper().saveOrUpdateBatch(relations);
    }
}
