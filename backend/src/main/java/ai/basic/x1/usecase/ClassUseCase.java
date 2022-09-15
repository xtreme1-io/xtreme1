package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.ClassDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.Class;
import ai.basic.x1.entity.ClassBO;
import ai.basic.x1.entity.enums.SortByEnum;
import ai.basic.x1.entity.enums.SortEnum;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.ObjectUtils;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author chenchao
 * @date 2022/8/24
 */
public class ClassUseCase {

    @Autowired
    private ClassDAO classDAO;

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
        Map<String,List<Long>> map = new HashMap<>(1);
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
}
