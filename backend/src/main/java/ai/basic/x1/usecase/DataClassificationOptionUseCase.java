package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.DataAnnotationObjectDAO;
import ai.basic.x1.adapter.port.dao.DataClassificationOptionDAO;
import ai.basic.x1.adapter.port.dao.DatasetClassificationDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataAnnotationObject;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataClassificationOption;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetClassification;
import ai.basic.x1.entity.DataAnnotationClassificationBO;
import ai.basic.x1.entity.DataClassificationOptionBO;
import ai.basic.x1.util.ClassificationUtils;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.collection.CollUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.*;
import java.util.stream.Collectors;

public class DataClassificationOptionUseCase {

    @Autowired
    private DataClassificationOptionDAO dataClassificationOptionDAO;

    @Autowired
    private DataAnnotationObjectDAO dataAnnotationObjectDAO;

    @Autowired
    private DatasetClassificationDAO datasetClassificationDAO;


    public void saveBatch(List<DataAnnotationClassificationBO> dataAnnotations) {
        if (CollUtil.isEmpty(dataAnnotations)) {
            return;
        }
        var options = ClassificationUtils.parse(dataAnnotations);
        if (CollUtil.isEmpty(options)) {
            return;
        }
        var datasetIds = dataAnnotations.stream().map(DataAnnotationClassificationBO::getDatasetId)
                .collect(Collectors.toSet());
        var dataIds = dataAnnotations.stream().map(DataAnnotationClassificationBO::getDataId)
                .collect(Collectors.toSet());
        dataClassificationOptionDAO.remove(new LambdaQueryWrapper<DataClassificationOption>()
                .in(DataClassificationOption::getDatasetId, datasetIds)
                .in(DataClassificationOption::getDataId, dataIds));

        dataClassificationOptionDAO.getBaseMapper().insertBatch(options);
    }

    public List<DataClassificationOptionBO> statisticsDataByOption(Long datasetId) {
        var existClassificationIds = getExistClassificationIds(datasetId);
        if (CollUtil.isEmpty(existClassificationIds)) {
            return List.of();
        }
        var records = dataClassificationOptionDAO.getBaseMapper()
                .statisticsDataByOption(datasetId, existClassificationIds);

        setOptionPath(records);
        return DefaultConverter.convert(records, DataClassificationOptionBO.class);
    }

    private List<Long> getExistClassificationIds(Long datasetId) {
        return datasetClassificationDAO.list(new LambdaQueryWrapper<DatasetClassification>()
                .select(DatasetClassification::getId)
                .eq(DatasetClassification::getDatasetId, datasetId)
        ).stream().map(DatasetClassification::getId).collect(Collectors.toList());
    }

    private void setOptionPath(List<DataClassificationOption> options) {
        var attributeIds = options.stream().map(DataClassificationOption::getAttributeId).collect(Collectors.toSet());
        var optionNames = options.stream().map(DataClassificationOption::getOptionName).collect(Collectors.toSet());
        if (CollUtil.isEmpty(attributeIds) || CollUtil.isEmpty(optionNames)) {
            return;
        }
        var optionMap = dataClassificationOptionDAO.list(new LambdaQueryWrapper<DataClassificationOption>()
                .in(DataClassificationOption::getAttributeId, attributeIds)
                .in(DataClassificationOption::getOptionName, optionNames)
        ).stream().collect(Collectors.toMap(e -> String.format("%s-%s", e.getAttributeId(),
                e.getOptionName()), t -> t, (oldV, newV) -> newV));

        options.forEach(op -> {
            var key = String.format("%s-%s", op.getAttributeId(), op.getOptionName());
            op.setOptionPath(optionMap.getOrDefault(key, new DataClassificationOption()).getOptionPath());
        });
    }

    public List<DataClassificationOptionBO> findByClassIds(List<Long> classIds) {
        if (CollUtil.isEmpty(classIds)) {
            return List.of();
        }
        var dataIds = dataAnnotationObjectDAO.list(new LambdaQueryWrapper<DataAnnotationObject>()
                        .in(DataAnnotationObject::getClassId, classIds))
                .stream().map(DataAnnotationObject::getDataId).collect(Collectors.toSet());
        if (CollUtil.isEmpty(dataIds)) {
            return List.of();
        }

        var options = dataClassificationOptionDAO.list(new LambdaQueryWrapper<DataClassificationOption>()
                .in(DataClassificationOption::getDataId, dataIds));
        return groupCountInMemory(options);
    }

    private List<DataClassificationOptionBO> groupCountInMemory(List<DataClassificationOption> options) {
        Map<String, DataClassificationOptionBO> statisticsMap = new HashMap<>();
        for (var option : options) {
            var key = String.format("%s-%s", option.getAttributeId(), option.getOptionName());
            var optionBo = statisticsMap.get(key);
            if (optionBo != null) {
                optionBo.setDataAmount(optionBo.getDataAmount() + 1L);
            } else {
                optionBo = DataClassificationOptionBO.builder().build();
                optionBo.setAttributeId(option.getAttributeId());
                optionBo.setOptionName(option.getOptionName());
                optionBo.setOptionPath(option.getOptionPath());
                optionBo.setDataAmount(1L);
                statisticsMap.put(key, optionBo);
            }
        }
        return new ArrayList<>(statisticsMap.values());
    }

}
