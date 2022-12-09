package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.DatasetDAO;
import ai.basic.x1.adapter.port.dao.DatasetSimilarityJobDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.Dataset;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetSimilarityJob;
import ai.basic.x1.entity.enums.DatasetTypeEnum;
import cn.hutool.core.util.ObjectUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.transaction.annotation.Transactional;

/**
 * @author fyb
 * @date 2022-12-07 20:00:32
 */


@Slf4j
public class DatasetSimilarityJobUseCase {
    @Autowired
    private DatasetSimilarityJobDAO datasetSimilarityJobDAO;
    @Autowired
    private DatasetDAO datasetDAO;

    @Transactional(rollbackFor = Throwable.class)
    public void submitJob(Long datasetId) {
        Dataset dataset = datasetDAO.getById(datasetId);
        if (ObjectUtil.isNotEmpty(dataset) && dataset.getType() == DatasetTypeEnum.IMAGE) {
            DatasetSimilarityJob datasetSimilarityJob = DatasetSimilarityJob.builder()
                    .datasetId(datasetId).build();
            try {
                datasetSimilarityJobDAO.save(datasetSimilarityJob);
            } catch (DuplicateKeyException duplicateKeyException) {
                log.warn("dataset:{} exist todo job.", datasetId);
            }
        }
    }
}