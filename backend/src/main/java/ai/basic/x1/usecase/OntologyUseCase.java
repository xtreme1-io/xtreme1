package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.OntologyDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.Ontology;
import ai.basic.x1.entity.ClassBO;
import ai.basic.x1.entity.OntologyBO;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.springframework.beans.factory.annotation.Autowired;

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
}
