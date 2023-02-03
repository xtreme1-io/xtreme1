package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.*;
import ai.basic.x1.adapter.port.dao.mybatis.model.*;
import ai.basic.x1.adapter.port.dao.mybatis.model.Class;
import ai.basic.x1.entity.*;
import ai.basic.x1.entity.enums.ClassAndClassificationSourceEnum;
import ai.basic.x1.entity.enums.DatasetTypeEnum;
import ai.basic.x1.entity.enums.InputTypeEnum;
import ai.basic.x1.entity.enums.ToolTypeEnum;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.io.FileTypeUtil;
import cn.hutool.core.io.IoUtil;
import cn.hutool.core.util.EnumUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Nullable;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.*;

import static java.util.stream.Collectors.*;

/**
 * @author chenchao
 * @date 2022/8/24
 */
@Slf4j
public class OntologyUseCase {

    @Autowired
    private OntologyDAO ontologyDAO;

    @Autowired
    private ClassUseCase classUseCase;

    @Autowired
    private ClassDAO classDAO;

    @Autowired
    private ClassificationDAO classificationDAO;

    @Autowired
    private DatasetClassOntologyDAO datasetClassOntologyDAO;

    @Autowired
    private DatasetClassDAO datasetClassDAO;

    @Autowired
    private DatasetClassificationDAO datasetClassificationDAO;

    public Page<OntologyBO> findByPage(Integer pageNo, Integer pageSize, OntologyBO bo) {
        LambdaQueryWrapper<Ontology> ontologyQueryWrapper = Wrappers.lambdaQuery();
        ontologyQueryWrapper.like(StrUtil.isNotBlank(bo.getName()), Ontology::getName, bo.getName())
                .eq(ObjectUtil.isNotNull(bo.getType()), Ontology::getType, bo.getType())
                .orderBy(true, true, Ontology::getCreatedAt);
        var ontologyPage = ontologyDAO.page(new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(pageNo, pageSize), ontologyQueryWrapper);
        Page<OntologyBO> ontologyBOPage = DefaultConverter.convert(ontologyPage, OntologyBO.class);
        if (ontologyBOPage.getList().size() == 0) {
            return ontologyBOPage;
        }

        List<Long> ontologyIds = ontologyBOPage.getList().stream().map(OntologyBO::getId).collect(toList());
        List<ClassBO> classBOs = classUseCase.findByOntologyIdList(ontologyIds);
        Map<Long, Integer> classNumMap = classBOs.stream()
                .collect(toMap(ClassBO::getOntologyId, ClassBO::getClassNum, (k1, k2) -> k1));
        for (OntologyBO ontology : ontologyBOPage.getList()) {
            ontology.setClassNum(Optional.ofNullable(classNumMap.get(ontology.getId())).orElse(0));
        }

        return ontologyBOPage;
    }

    public OntologyBO findById(Long id) {
        return DefaultConverter.convert(ontologyDAO.getById(id), OntologyBO.class);
    }

    public Long saveOntology(OntologyBO ontologyBO) {
        try {
            Ontology ontology = DefaultConverter.convert(ontologyBO, Ontology.class);
            ontologyDAO.saveOrUpdate(ontology);
            return ontology.getId();
        } catch (DuplicateKeyException e) {
            throw new UsecaseException(UsecaseCode.NAME_DUPLICATED);
        }
    }

    @Transactional(rollbackFor = Throwable.class)
    public Boolean deleteOntology(Long id) {

        //delete class and classification in deleted ontology
        LambdaQueryWrapper<Class> classLambdaQueryWrapper = Wrappers.lambdaQuery();
        classLambdaQueryWrapper.eq(Class::getOntologyId, id);
        classDAO.remove(classLambdaQueryWrapper);
        LambdaQueryWrapper<Classification> classificationLambdaQueryWrapper = Wrappers.lambdaQuery();
        classificationLambdaQueryWrapper.eq(Classification::getOntologyId, id);
        classificationDAO.remove(classificationLambdaQueryWrapper);

        //delete relationship of datasetClass and deleted ontology
        LambdaQueryWrapper<DatasetClassOntology> datasetClassOntologyLambdaQueryWrapper = Wrappers.lambdaQuery();
        datasetClassOntologyLambdaQueryWrapper.eq(DatasetClassOntology::getOntologyId, id);
        datasetClassOntologyDAO.remove(datasetClassOntologyLambdaQueryWrapper);

        LambdaQueryWrapper<Ontology> ontologyLambdaQueryWrapper = Wrappers.lambdaQuery();
        ontologyLambdaQueryWrapper.eq(Ontology::getId, id);
        return ontologyDAO.remove(ontologyLambdaQueryWrapper);
    }

    public boolean validateName(Long id, String name, DatasetTypeEnum type) {
        LambdaQueryWrapper<Ontology> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.eq(Ontology::getName, name);
        lambdaQueryWrapper.eq(Ontology::getType, type);
        if (ObjectUtil.isNotEmpty(id)) {
            lambdaQueryWrapper.ne(Ontology::getId, id);
        }
        return ontologyDAO.getBaseMapper().exists(lambdaQueryWrapper);
    }

    public List<OntologyBO> findAll(@Nullable DatasetTypeEnum type) {
        LambdaQueryWrapper<Ontology> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        if (ObjectUtil.isNotNull(type)) {
            lambdaQueryWrapper.eq(Ontology::getType, type);
        }
        return DefaultConverter.convert(ontologyDAO.list(lambdaQueryWrapper), OntologyBO.class);
    }

    @Transactional(rollbackFor = Exception.class)
    public ClassAndClassificationImportBO importByJson(MultipartFile file, Long desId, ClassAndClassificationSourceEnum desType) throws IOException {
        ClassAndClassificationImportBO result = new ClassAndClassificationImportBO();
        result.setDesId(desId);
        result.setDesType(desType);
        checkValidityOfFile(file);
        boolean canInsert = true;
        List<ClassBO> validClasses = new ArrayList<>();
        List<DatasetClassBO> validDatasetClasses = new ArrayList<>();
        List<ClassificationBO> validClassifications = new ArrayList<>();
        List<DatasetClassificationBO> validDatasetClassifications = new ArrayList<>();

        String classAndClassification = IoUtil.read(file.getInputStream(), Charset.defaultCharset());
        JSONObject classAndClassificationJson = new JSONObject(classAndClassification);
        if (ObjectUtil.isNotEmpty(classAndClassificationJson.get("classes"))) {
            JSONArray classesJson = (JSONArray) classAndClassificationJson.get("classes");
            if (CollUtil.size(classesJson) > 1000) {
                throw new UsecaseException("A maximum of 1000 classes can be import");
            }
            result.setClassTotalSize(classesJson.size());
            filterClass(classesJson);

            result.setValidClassSize(classesJson.size());
            setId(classesJson);
            result.setClasses(classesJson.toList(ClassAndClassificationImportBO.Class.class));
            if (ObjectUtil.isNotEmpty(classesJson)){
                if (ClassAndClassificationSourceEnum.ONTOLOGY.equals(desType)) {
                    validClasses = classesJson.toList(ClassBO.class);
                    validClasses.forEach(clazz -> clazz.setOntologyId(desId));
                    List<Class> alreadyExistClasses = classDAO.getBaseMapper().getClasses(desId, DefaultConverter.convert(validClasses, Class.class));
                    if (ObjectUtil.isNotEmpty(alreadyExistClasses)) {
                        result.setDuplicateClassName(DefaultConverter.convert(alreadyExistClasses, ClassAndClassificationImportBO.ClassIdentifier.class));

                        canInsert = false;
                    }
                } else if (ClassAndClassificationSourceEnum.DATASET.equals(desType)) {
                    validDatasetClasses = classesJson.toList(DatasetClassBO.class);
                    validDatasetClasses.forEach(clazz -> clazz.setDatasetId(desId));
                    List<DatasetClass> alreadyExistDatasetClasses = datasetClassDAO.getBaseMapper().getDatasetClasses(desId, DefaultConverter.convert(validDatasetClasses, DatasetClass.class));
                    if (ObjectUtil.isNotEmpty(alreadyExistDatasetClasses)) {
                        result.setDuplicateClassName(DefaultConverter.convert(alreadyExistDatasetClasses, ClassAndClassificationImportBO.ClassIdentifier.class));
                        canInsert = false;
                    }
                }
            }
        } else {
            result.setClassTotalSize(0);
            result.setValidClassificationSize(0);
        }
        if (ObjectUtil.isNotEmpty(classAndClassificationJson.get("classifications"))) {
            JSONArray classificationsJson = (JSONArray) classAndClassificationJson.get("classifications");
            if (CollUtil.size(classificationsJson) > 1000) {
                throw new UsecaseException("A maximum of 1000 classifications can be import");
            }
            result.setClassificationTotalSize(classificationsJson.size());
            filterClassification(classificationsJson);
            result.setValidClassificationSize(classificationsJson.size());
            setId(classificationsJson);
            result.setClassifications(classificationsJson.toList(ClassAndClassificationImportBO.Classification.class));
            if(ObjectUtil.isNotEmpty(classificationsJson)){
                if (ClassAndClassificationSourceEnum.ONTOLOGY.equals(desType)) {
                    validClassifications = classificationsJson.toList(ClassificationBO.class);
                    validClassifications.forEach(clazz -> clazz.setOntologyId(desId));
                    var classificationWrapper = new LambdaQueryWrapper<Classification>()
                            .eq(Classification::getOntologyId, desId)
                            .in(Classification::getName, validClassifications.stream().map(ClassificationBO::getName).collect(toList()));
                    List<Classification> alreadyExistClassifications = classificationDAO.list(classificationWrapper);
                    if (ObjectUtil.isNotEmpty(alreadyExistClassifications)) {
                        result.setDuplicateClassificationName(alreadyExistClassifications.stream().map(Classification::getName).collect(toList()));
                        canInsert = false;
                    }
                } else if (ClassAndClassificationSourceEnum.DATASET.equals(desType)) {
                    validDatasetClassifications = classificationsJson.toList(DatasetClassificationBO.class);
                    validDatasetClassifications.forEach(clazz -> clazz.setDatasetId(desId));
                    var classificationWrapper = new LambdaQueryWrapper<DatasetClassification>()
                            .eq(DatasetClassification::getDatasetId, desId)
                            .in(DatasetClassification::getName, validDatasetClassifications.stream().map(DatasetClassificationBO::getName).collect(toList()));
                    List<DatasetClassification> alreadyExistClassifications = datasetClassificationDAO.list(classificationWrapper);
                    if (ObjectUtil.isNotEmpty(alreadyExistClassifications)) {
                        result.setDuplicateClassificationName(alreadyExistClassifications.stream().map(DatasetClassification::getName).collect(toList()));
                        canInsert = false;
                    }
                }
            }

        } else {
            result.setClassificationTotalSize(0);
            result.setValidClassificationSize(0);
        }

        if (canInsert) {
            result.setIsDuplicate(false);
            saveOrUpdateBatch(validClasses, validDatasetClasses, validClassifications, validDatasetClassifications);
        } else {
            result.setIsDuplicate(true);
        }
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public void saveOrUpdateBatch(List<ClassBO> validClasses, List<DatasetClassBO> validDatasetClasses, List<ClassificationBO> validClassifications, List<DatasetClassificationBO> validDatasetClassifications) {
        if (ObjectUtil.isNotEmpty(validClasses)) {
            classDAO.getBaseMapper().saveOrUpdateBatch(DefaultConverter.convert(validClasses, Class.class));
        }
        if (ObjectUtil.isNotEmpty(validDatasetClasses)) {
            datasetClassDAO.getBaseMapper().saveOrUpdateBatch(DefaultConverter.convert(validDatasetClasses, DatasetClass.class));
        }
        if (ObjectUtil.isNotEmpty(validClassifications)) {
            classificationDAO.getBaseMapper().saveOrUpdateBatch(DefaultConverter.convert(validClassifications, Classification.class));
        }
        if (ObjectUtil.isNotEmpty(validDatasetClassifications)) {
            datasetClassificationDAO.getBaseMapper().saveOrUpdateBatch(DefaultConverter.convert(validDatasetClassifications, DatasetClassification.class));
        }
    }

    private static void checkValidityOfFile(MultipartFile file) throws IOException {
        String type = FileTypeUtil.getType(file.getInputStream(), file.getOriginalFilename());
        log.info("class/classification file format: " + type);
        if (!"json".equalsIgnoreCase(type)) {
            throw new UsecaseException(UsecaseCode.FILE_TYPE_NOT_SUPPORT);
        }
        // 10 MB
        long fileMaxSize = 10 * 1024 * 1024;
        if (file.getSize() > fileMaxSize) {
            throw new UsecaseException("The file exceeds the size. Default is 10MB");
        }
    }

    private static void filterClassification(JSONArray classificationsJson) {
        Iterator<Object> classificationIterator = classificationsJson.iterator();
        Set<String> classificationNameSet = new HashSet<>();
        while (classificationIterator.hasNext()) {
            JSONObject classification = (JSONObject) classificationIterator.next();
            if (ObjectUtil.isNull(classification.get("name"))) {
                classificationIterator.remove();
            } else if (classification.get("name").toString().length() > 256) {
                classificationIterator.remove();
            } else if (classificationNameSet.contains(classification.get("name").toString())) {
                classificationIterator.remove();
            }
            if (ObjectUtil.isNull(classification.get("isRequired"))) {
                classificationIterator.remove();
            }
            if (ObjectUtil.isNull(classification.get("inputType"))) {
                classificationIterator.remove();
            } else if (EnumUtil.notContains(InputTypeEnum.class, classification.get("inputType").toString())) {
                classificationIterator.remove();
            }
            if (ObjectUtil.isNotNull(classification.get("options")) && !(classification.get("options") instanceof JSONArray)) {
                classificationIterator.remove();
            }
            classificationNameSet.add(classification.get("name").toString());
        }
    }

    private static void filterClass(JSONArray classesJson) {
        Iterator<Object> classIterator = classesJson.iterator();
        Set<Map> classNameSet = new HashSet<>();
        while (classIterator.hasNext()) {
            JSONObject clazz = (JSONObject) classIterator.next();
            boolean isRemove = false;
            if (ObjectUtil.isNull(clazz.get("name"))) {
                isRemove = true;
            } else if (clazz.get("name").toString().length() > 256) {
                isRemove = true;
            }
            if (ObjectUtil.isNull(clazz.get("toolType"))) {
                isRemove = true;
            } else if (EnumUtil.notContains(ToolTypeEnum.class, clazz.get("toolType").toString())) {
                isRemove = true;
            }
            long count = classNameSet.stream().filter(map -> map.get("toolType").equals(clazz.get("toolType").toString()) && map.get("name").equals(clazz.get("name").toString())).count();
            if (count != 0) {
                isRemove = true;
            }
            if (ObjectUtil.isNotNull(clazz.get("toolTypeOptions")) && !(clazz.get("toolTypeOptions") instanceof JSONObject)) {
                isRemove = true;
            }
            if (ObjectUtil.isNotNull(clazz.get("attributes")) && !(clazz.get("attributes") instanceof JSONArray)) {
                isRemove = true;
            }
            if (isRemove) {
                classIterator.remove();
            } else {
                Map<String,String> map = new HashMap(4);
                map.put("toolType", clazz.get("toolType").toString());
                map.put("name", clazz.get("name").toString());
                classNameSet.add(map);
            }
        }
    }

    public ClassAndClassificationExportBO queryClassAndClassification(ClassAndClassificationExportParamBO param) {
        ClassAndClassificationExportBO exportBO = new ClassAndClassificationExportBO();
        if (ClassAndClassificationSourceEnum.ONTOLOGY.equals(param.getSourceType())) {
            LambdaQueryWrapper<Class> classWrapper = new LambdaQueryWrapper<Class>().eq(Class::getOntologyId, param.getSourceId());
            List<Class> classes = classDAO.list(classWrapper);
            classes.forEach(clazz -> removeId(clazz.getAttributes()));
            exportBO.setClasses(DefaultConverter.convert(classes, ClassAndClassificationExportBO.Class.class));
            LambdaQueryWrapper<Classification> classificationWrapper = new LambdaQueryWrapper<Classification>().eq(Classification::getOntologyId, param.getSourceId());
            List<Classification> classifications = classificationDAO.list(classificationWrapper);
            classifications.forEach(classification -> removeId(classification.getAttribute()));
            exportBO.setClassifications(DefaultConverter.convert(classifications, ClassAndClassificationExportBO.Classification.class));
        } else if (ClassAndClassificationSourceEnum.DATASET.equals(param.getSourceType())) {
            LambdaQueryWrapper<DatasetClass> datasetClassWrapper = new LambdaQueryWrapper<DatasetClass>().eq(DatasetClass::getDatasetId, param.getSourceId());
            List<DatasetClass> classes = datasetClassDAO.list(datasetClassWrapper);
            classes.forEach(clazz -> removeId(clazz.getAttributes()));
            exportBO.setClasses(DefaultConverter.convert(classes, ClassAndClassificationExportBO.Class.class));
            LambdaQueryWrapper<DatasetClassification> datasetClassificationWrapper = new LambdaQueryWrapper<DatasetClassification>().eq(DatasetClassification::getDatasetId, param.getSourceId());
            List<DatasetClassification> classifications = datasetClassificationDAO.list(datasetClassificationWrapper);
            classifications.forEach(classification -> removeId(classification.getAttribute()));
            exportBO.setClassifications(DefaultConverter.convert(classifications, ClassAndClassificationExportBO.Classification.class));
        } else {
            throw new UsecaseException(UsecaseCode.UNKNOWN);
        }
        return exportBO;
    }

    private void setId(JSONArray array) {
        array.forEach(o -> {
            JSONObject jsonObject = (JSONObject) o;
            if (ObjectUtil.isNull(jsonObject.get("id"))) {
                jsonObject.set("id", UUID.randomUUID().toString());
            }
            if (ObjectUtil.isNotNull(jsonObject.get("attributes"))) {
                JSONArray attributes = (JSONArray) jsonObject.get("attributes");
                if (ObjectUtil.isNotEmpty(attributes)) {
                    setId(attributes);
                }
            }
            if (ObjectUtil.isNotNull(jsonObject.get("options"))) {
                JSONArray options = (JSONArray) jsonObject.get("options");
                if (ObjectUtil.isNotEmpty(options)) {
                    setId(options);
                }
            }
        });
    }

    private void removeId(JSONObject jsonObject){
        if (ObjectUtil.isNull(jsonObject)){
            return;
        }
        jsonObject.remove("id");
        if (ObjectUtil.isNotNull(jsonObject.get("attributes"))) {
            JSONArray attributes = (JSONArray) jsonObject.get("attributes");
            if (ObjectUtil.isNotEmpty(attributes)) {
                removeId(attributes);
            }
        }
        if (ObjectUtil.isNotNull(jsonObject.get("options"))) {
            JSONArray options = (JSONArray) jsonObject.get("options");
            if (ObjectUtil.isNotEmpty(options)) {
                removeId(options);
            }
        }
    }

    private void removeId(JSONArray array) {
        if (ObjectUtil.isNotEmpty(array)) {
            array.forEach(o -> {
                removeId((JSONObject) o);
            });
        }
    }
}
