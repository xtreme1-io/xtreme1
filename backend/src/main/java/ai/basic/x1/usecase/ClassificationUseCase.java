package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.ClassificationDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.Classification;
import ai.basic.x1.entity.ClassificationBO;
import ai.basic.x1.entity.enums.SortByEnum;
import ai.basic.x1.entity.enums.SortEnum;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.util.ObjectUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.ObjectUtils;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.springframework.beans.factory.annotation.Autowired;

/**
* @author chenchao
* @version 1.0
* @date 2022/4/2
*/
public class ClassificationUseCase {

    @Autowired
    private ClassificationDAO classificationDAO;

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
}
