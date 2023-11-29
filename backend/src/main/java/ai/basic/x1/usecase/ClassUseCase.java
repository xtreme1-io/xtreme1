package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.ClassDAO;
import ai.basic.x1.adapter.port.dao.DatasetClassDAO;
import ai.basic.x1.adapter.port.dao.DatasetClassOntologyDAO;
import ai.basic.x1.adapter.port.dao.OntologyDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.Class;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetClass;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetClassOntology;
import ai.basic.x1.adapter.port.dao.mybatis.model.Ontology;
import ai.basic.x1.entity.ClassBO;
import ai.basic.x1.entity.enums.SortByEnum;
import ai.basic.x1.entity.enums.SortEnum;
import ai.basic.x1.entity.enums.ToolTypeEnum;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.lang.Assert;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONArray;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.ObjectUtils;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toMap;

/**
 * @author chenchao
 * @date 2022/8/24
 */
public class ClassUseCase {

    @Autowired
    private ClassDAO classDAO;

    @Autowired
    private OntologyDAO ontologyDAO;

    @Autowired
    private DatasetClassOntologyDAO datasetClassOntologyDAO;

    @Autowired
    private DatasetClassDAO datasetClassDAO;

    public Page<ClassBO> findByPage(Integer pageNo, Integer pageSize, ClassBO classBO) {
        LambdaQueryWrapper<Class> classLambdaQueryWrapper = Wrappers.lambdaQuery();
        Long ontologyId = classBO.getOntologyId();
        classLambdaQueryWrapper.eq(Class::getOntologyId, ontologyId)
                .like(StrUtil.isNotBlank(classBO.getName()), Class::getName, classBO.getName())
                .eq(ObjectUtils.isNotEmpty(classBO.getToolType()), Class::getToolType, classBO.getToolType())
                .ge(ObjectUtils.isNotEmpty(classBO.getStartTime()), Class::getCreatedAt, classBO.getStartTime())
                .le(ObjectUtils.isNotEmpty(classBO.getEndTime()), Class::getCreatedAt, classBO.getEndTime());
        addOrderRule(classLambdaQueryWrapper, classBO.getSortBy(), classBO.getAscOrDesc());
        var classPage = classDAO.page(new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(pageNo, pageSize), classLambdaQueryWrapper);
        Page<ClassBO> classBOPage = DefaultConverter.convert(classPage, ClassBO.class);

        setDatasetClassNum(ontologyId, classBOPage);
        return classBOPage;
    }

    private void setDatasetClassNum(Long ontologyId, Page<ClassBO> classBOPage) {
        if(ObjectUtil.isEmpty(classBOPage.getList())){
            return;
        }
        List<Long> classIds = classBOPage.getList().stream().map(ClassBO::getId).collect(toList());
        var datasetClassOntologyWrapper = new QueryWrapper<DatasetClassOntology>()
                .select("class_id", "count(id) as datasetClassNum")
                .lambda()
                .eq(DatasetClassOntology::getOntologyId, ontologyId)
                .in(DatasetClassOntology::getClassId, classIds)
                .groupBy(DatasetClassOntology::getClassId);
        List<DatasetClassOntology> list = datasetClassOntologyDAO.list(datasetClassOntologyWrapper);
        Map<Long, Long> datasetClssNumMap = list.stream().collect(toMap(DatasetClassOntology::getClassId, DatasetClassOntology::getDatasetClassNum));
        classBOPage.getList().stream().forEach(record->record.setDatasetClassNum(datasetClssNumMap.get(record.getId())));
    }

    public ClassBO findById(Long id) {
        ClassBO classBO = DefaultConverter.convert(classDAO.getById(id), ClassBO.class);
        if (ObjectUtil.isNull(classBO)) {
            return null;
        }
        long datasetClassNum =getRelatedDatasetClassNum(id);
        classBO.setDatasetClassNum(datasetClassNum);
        return classBO;
    }

    public List<ClassBO> findByOntologyIdList(List<Long> ontologyIdList) {
        if (ObjectUtils.isEmpty(ontologyIdList)) {
            return new ArrayList<>();
        }
        Map<String, List<Long>> map = new HashMap<>(1);
        map.put("ontologyIds", ontologyIdList);
        List<Class> count = classDAO.classCountGroupByOntologyId(map);
        return DefaultConverter.convert(count, ClassBO.class);
    }

    private void addOrderRule(LambdaQueryWrapper<Class> classificationLambdaQueryWrapper, String sortBy, String ascOrDesc) {
        boolean isAsc = StrUtil.isBlank(ascOrDesc) || SortEnum.ASC.name().equals(ascOrDesc);
        if (StrUtil.isNotBlank(sortBy)) {
            classificationLambdaQueryWrapper.orderBy(SortByEnum.NAME.name().equals(sortBy), isAsc, Class::getName);
            classificationLambdaQueryWrapper.orderBy(SortByEnum.CREATE_TIME.name().equals(sortBy), isAsc, Class::getCreatedAt);
        }
    }

    /**
     * Create update class
     *
     * @param bo class object
     */
    public void saveClass(ClassBO bo) {
        Assert.notNull(bo.getOntologyId(), () -> new UsecaseException(UsecaseCode.UNKNOWN, "ontologyId can not be null"));
        Assert.notNull(bo.getName(), () -> new UsecaseException(UsecaseCode.UNKNOWN, "name can not be null"));

        Ontology ontology = ontologyDAO.getBaseMapper().selectById(bo.getOntologyId());
        Assert.notNull(ontology, "cannot find ontology by ontologyId " + bo.getOntologyId());
        Class classInfo = DefaultConverter.convert(bo, Class.class);
        try {
            classDAO.saveOrUpdate(classInfo);
        } catch (DuplicateKeyException e) {
            throw new UsecaseException(UsecaseCode.NAME_DUPLICATED);
        }
        if (ObjectUtil.isNotNull(bo.getId()) && ObjectUtil.equals(Boolean.TRUE, bo.getIsResetRelations())) {
            removeDatasetClassOntology(bo.getId());
        }
    }

    /**
     * delete class
     *
     * @param id id
     * @return true-false
     */
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteClass(Long id) {
        removeDatasetClassOntology(id);
        return classDAO.removeById(id);
    }

    /**
     * delete relationship of datasetClass and deleted class
     *
     * @param classId
     */
    private void removeDatasetClassOntology(Long classId) {
        LambdaQueryWrapper<DatasetClassOntology> datasetClassOntologyLambdaQueryWrapper = Wrappers.lambdaQuery();
        datasetClassOntologyLambdaQueryWrapper.eq(DatasetClassOntology::getClassId, classId);
        datasetClassOntologyDAO.remove(datasetClassOntologyLambdaQueryWrapper);
    }

    public boolean validateName(Long id, Long ontologyId, String name, ToolTypeEnum toolType) {
        LambdaQueryWrapper<Class> lambdaQueryWrapper = new LambdaQueryWrapper<Class>()
                .eq(Class::getName, name)
                .eq(Class::getOntologyId, ontologyId)
                .eq(Class::getToolType, toolType);
        if (ObjectUtil.isNotEmpty(id)) {
            lambdaQueryWrapper.ne(Class::getId, id);
        }
        return classDAO.getBaseMapper().exists(lambdaQueryWrapper);
    }

    public List<ClassBO> findAll(Long ontologyId, ToolTypeEnum toolType) {
        var classWrapper = new LambdaQueryWrapper<Class>().eq(Class::getOntologyId, ontologyId);
        classWrapper.eq(ObjectUtil.isNotNull(toolType), Class::getToolType, toolType);
        return DefaultConverter.convert(classDAO.list(classWrapper), ClassBO.class);
    }

    @Transactional(rollbackFor = Exception.class)
    public void pushAttributesToDataset(Long id) {
        Class clazz = classDAO.getById(id);
        JSONArray attributes = clazz.getAttributes();
        var datasetClassOntologyWrapper = new LambdaQueryWrapper<DatasetClassOntology>().eq(DatasetClassOntology::getClassId, id);
        List<DatasetClassOntology> list = datasetClassOntologyDAO.list(datasetClassOntologyWrapper);
        if (ObjectUtil.isEmpty(list)) {
            return;
        }
        List<Long> datasetClassIds = list.stream().map(DatasetClassOntology::getDatasetClassId).collect(toList());
        List<DatasetClass> datasetClasses = new ArrayList<>();
        datasetClassIds.forEach(datasetClassId -> {
            datasetClasses.add(DatasetClass.builder().id(datasetClassId).attributes(attributes).build());
        });
        if (ObjectUtil.isNotEmpty(datasetClasses)) {
            datasetClassDAO.updateBatchById(datasetClasses);
        }
    }

    public long getRelatedDatasetClassNum(Long id) {
        var datasetClassOntologyWrapper = new LambdaQueryWrapper<DatasetClassOntology>().eq(DatasetClassOntology::getClassId, id);
        return datasetClassOntologyDAO.count(datasetClassOntologyWrapper);
    }

    public List<Long> findDatasetClassIdsByClassId(Long classId) {
        var datasetClassOntologyWrapper = new LambdaQueryWrapper<DatasetClassOntology>().eq(DatasetClassOntology::getClassId, classId);
        List<DatasetClassOntology> list = datasetClassOntologyDAO.list(datasetClassOntologyWrapper);
        return list.stream().map(DatasetClassOntology::getDatasetClassId).collect(toList());
    }

}
