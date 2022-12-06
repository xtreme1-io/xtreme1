package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.ClassDAO;
import ai.basic.x1.adapter.port.dao.ClassificationDAO;
import ai.basic.x1.adapter.port.dao.DatasetClassOntologyDAO;
import ai.basic.x1.adapter.port.dao.OntologyDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.Class;
import ai.basic.x1.adapter.port.dao.mybatis.model.Classification;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetClassOntology;
import ai.basic.x1.adapter.port.dao.mybatis.model.Ontology;
import ai.basic.x1.entity.ClassBO;
import ai.basic.x1.entity.OntologyBO;
import ai.basic.x1.entity.enums.DatasetTypeEnum;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Nullable;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * @author chenchao
 * @date 2022/8/24
 */
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

        List<Long> ontologyIds = ontologyBOPage.getList().stream().map(OntologyBO::getId).collect(Collectors.toList());
        List<ClassBO> classBOs = classUseCase.findByOntologyIdList(ontologyIds);
        Map<Long, Integer> classNumMap = classBOs.stream()
                .collect(Collectors.toMap(ClassBO::getOntologyId, ClassBO::getClassNum, (k1, k2) -> k1));
        for (OntologyBO ontology : ontologyBOPage.getList()) {
            ontology.setClassNum(Optional.ofNullable(classNumMap.get(ontology.getId())).orElse(0));
        }

        return ontologyBOPage;
    }

    public OntologyBO findById(Long id) {
        return DefaultConverter.convert(ontologyDAO.getById(id), OntologyBO.class);
    }

    public void saveOntology(OntologyBO ontologyBO) {
        try {
            ontologyDAO.saveOrUpdate(DefaultConverter.convert(ontologyBO, Ontology.class));
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
        datasetClassOntologyLambdaQueryWrapper.eq(DatasetClassOntology::getOntologyId,id);
        datasetClassOntologyDAO.remove(datasetClassOntologyLambdaQueryWrapper);

        LambdaQueryWrapper<Ontology> ontologyLambdaQueryWrapper = Wrappers.lambdaQuery();
        ontologyLambdaQueryWrapper.eq(Ontology::getId, id);
        return ontologyDAO.remove(ontologyLambdaQueryWrapper);
    }

    public boolean validateName(Long id, String name,DatasetTypeEnum type) {
        LambdaQueryWrapper<Ontology> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.eq(Ontology::getName, name);
        lambdaQueryWrapper.eq(Ontology::getType,type);
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
}
