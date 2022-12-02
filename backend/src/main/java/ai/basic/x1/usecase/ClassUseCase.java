package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.ClassDAO;
import ai.basic.x1.adapter.port.dao.OntologyDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.Class;
import ai.basic.x1.adapter.port.dao.mybatis.model.Ontology;
import ai.basic.x1.entity.ClassBO;
import ai.basic.x1.entity.enums.SortByEnum;
import ai.basic.x1.entity.enums.SortEnum;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.lang.Assert;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.ObjectUtils;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * @author chenchao
 * @date 2022/8/24
 */
public class ClassUseCase {

    @Autowired
    private ClassDAO classDAO;

    @Autowired
    private OntologyDAO ontologyDAO;

    public Page<ClassBO> findByPage(Integer pageNo, Integer pageSize, ClassBO classBO) {
        LambdaQueryWrapper<Class> classLambdaQueryWrapper = Wrappers.lambdaQuery();
        classLambdaQueryWrapper.eq(Class::getOntologyId, classBO.getOntologyId())
                .like(StrUtil.isNotBlank(classBO.getName()), Class::getName, classBO.getName())
                .eq(ObjectUtils.isNotEmpty(classBO.getToolType()), Class::getToolType, classBO.getToolType())
                .ge(ObjectUtils.isNotEmpty(classBO.getStartTime()), Class::getCreatedAt, classBO.getStartTime())
                .le(ObjectUtils.isNotEmpty(classBO.getEndTime()), Class::getCreatedAt, classBO.getEndTime());
        addOrderRule(classLambdaQueryWrapper, classBO.getSortBy(), classBO.getAscOrDesc());
        var classPage = classDAO.page(new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(pageNo, pageSize), classLambdaQueryWrapper);
        return DefaultConverter.convert(classPage, ClassBO.class);
    }

    public ClassBO findById(Long id) {
        return DefaultConverter.convert(classDAO.getById(id), ClassBO.class);
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
     * 创建更新class
     *
     * @param bo class对象
     */
    public void saveClass(ClassBO bo) {
        Assert.notNull(bo.getOntologyId(), () -> new UsecaseException(UsecaseCode.UNKNOWN, "ontologyId can not be null"));
        Assert.notNull(bo.getName(), () -> new UsecaseException(UsecaseCode.UNKNOWN, "name can not be null"));

        Ontology ontology = ontologyDAO.getBaseMapper().selectById(bo.getOntologyId());
        Assert.notNull(ontology, "cannot find ontology by ontologyId " + bo.getOntologyId());
        Class classInfo = DefaultConverter.convert(bo, Class.class);
        try {
            classDAO.saveOrUpdate(classInfo);
        }catch (DuplicateKeyException e){
            throw new UsecaseException(UsecaseCode.NAME_DUPLICATED);
        }

    }

    /**
     * 删除数据 物理删除
     *
     * @param id id
     * @return true-false
     */
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteClass(Long id) {
        return classDAO.removeById(id);
    }

    public boolean validateName(Long id, Long ontologyId, String name) {
        LambdaQueryWrapper<Class> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.eq(Class::getName, name);
        lambdaQueryWrapper.eq(Class::getOntologyId, ontologyId);
        if (ObjectUtil.isNotEmpty(id)) {
            lambdaQueryWrapper.ne(Class::getId, id);
        }
        return classDAO.getBaseMapper().exists(lambdaQueryWrapper);
    }
}
