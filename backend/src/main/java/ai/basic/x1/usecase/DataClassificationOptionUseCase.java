package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.DataClassificationOptionDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataClassificationOption;
import ai.basic.x1.entity.DataAnnotationClassificationBO;
import ai.basic.x1.entity.DataClassificationOptionBO;
import ai.basic.x1.util.ClassificationUtils;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.collection.CollUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;

public class DataClassificationOptionUseCase {

    @Autowired
    private DataClassificationOptionDAO dataClassificationOptionDAO;


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

    public List<DataClassificationOptionBO> statisticsDataByOption(Long datasetId, int pageNo,
                                                                   int pageSize) {

        var page = new com.baomidou.mybatisplus.extension.plugins.pagination.Page<DataClassificationOption>(pageNo, pageSize);
        var records = dataClassificationOptionDAO.getBaseMapper()
                .statisticsDataByOption(page, datasetId).getRecords();
        return DefaultConverter.convert(records, DataClassificationOptionBO.class);
    }

    public List<DataClassificationOptionBO> findByClassIds(List<Long> classIds) {
        if (CollUtil.isEmpty(classIds)) {
            return List.of();
        }
        var options = dataClassificationOptionDAO.getBaseMapper()
                .findByClassIds(classIds);
        return DefaultConverter.convert(options, DataClassificationOptionBO.class);
    }

}
