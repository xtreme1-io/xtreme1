package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.ClassificationDAO;
import ai.basic.x1.adapter.port.dao.OntologyDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.Classification;
import ai.basic.x1.adapter.port.dao.mybatis.model.Ontology;
import ai.basic.x1.entity.ClassificationBO;
import ai.basic.x1.entity.enums.SortByEnum;
import ai.basic.x1.entity.enums.SortEnum;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.lang.Assert;
import cn.hutool.core.util.ObjectUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.ObjectUtils;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.transaction.annotation.Transactional;

/**
* @author chenchao
* @date 2022/4/2
*/
public class ClassificationUseCase {

    @Autowired
    private ClassificationDAO classificationDAO;
    @Autowired
    private OntologyDAO ontologyDAO;

    public ClassificationBO findById(Long id) {
        return DefaultConverter.convert(classificationDAO.getById(id), ClassificationBO.class);
    }

    private void addOrderRule(LambdaQueryWrapper<Classification> classificationQueryWrapper, String sortBy,String ascOrDesc) {
        //By default, it is in ascending order
        boolean isAsc = StringUtils.isBlank(ascOrDesc)|| SortEnum.ASC.name().equals(ascOrDesc);
        if (StringUtils.isNotBlank(sortBy)) {
            classificationQueryWrapper.orderBy(SortByEnum.NAME.name().equals(sortBy),isAsc,Classification::getName);
            classificationQueryWrapper.orderBy(SortByEnum.CREATE_TIME.name().equals(sortBy),isAsc,Classification::getCreatedAt);
        }
    }

    public Page<ClassificationBO> findByPage(Integer pageNo, Integer pageSize, ClassificationBO bo) {

        LambdaQueryWrapper<Classification> classificationQueryWrapper = Wrappers.lambdaQuery();
        classificationQueryWrapper.eq(Classification::getOntologyId, bo.getOntologyId())
                .eq(!ObjectUtils.isEmpty(bo.getInputType()),Classification::getInputType, bo.getInputType())
                .ge(ObjectUtil.isNotNull(bo.getStartTime()), Classification::getCreatedAt, bo.getStartTime())
                .le(ObjectUtil.isNotNull(bo.getEndTime()), Classification::getCreatedAt, bo.getEndTime())
                .like(!ObjectUtils.isEmpty(bo.getName()),Classification::getName,bo.getName());
        addOrderRule(classificationQueryWrapper,bo.getSortBy(),bo.getAscOrDesc());
        var classificationPage = classificationDAO.page(new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(pageNo, pageSize), classificationQueryWrapper);
        return DefaultConverter.convert(classificationPage, ClassificationBO.class);
    }
    /**
     * Save the classification and return the saved data
     * @param bo classificationBO
     */
    public void saveClassification(ClassificationBO bo) {

        Assert.notNull(bo.getOntologyId(),()->new UsecaseException(UsecaseCode.UNKNOWN,"ontologyId can not be null"));
        Assert.notNull(bo.getName(),()->new UsecaseException(UsecaseCode.UNKNOWN,"name can not be null"));
        Ontology ontology = ontologyDAO.getBaseMapper().selectById(bo.getOntologyId());
        Assert.notNull(ontology,"cannot find ontology by ontologyId "+bo.getOntologyId());

        Classification classificationInfo = DefaultConverter.convert(bo, Classification.class);
        try {
            classificationDAO.saveOrUpdate(classificationInfo);
        } catch (DuplicateKeyException e){
            throw new UsecaseException(UsecaseCode.NAME_DUPLICATED);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteClassification(Long id) {
        return classificationDAO.removeById(id);
    }

    public boolean validateName(Long id, Long ontologyId, String name) {
        LambdaQueryWrapper<Classification> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.eq(Classification::getName, name);
        lambdaQueryWrapper.eq(Classification::getOntologyId, ontologyId);
        if (ObjectUtil.isNotEmpty(id)) {
            lambdaQueryWrapper.ne(Classification::getId, id);
        }
        return classificationDAO.getBaseMapper().exists(lambdaQueryWrapper);
    }

}
