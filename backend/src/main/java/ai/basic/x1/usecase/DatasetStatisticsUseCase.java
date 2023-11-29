package ai.basic.x1.usecase;

import ai.basic.x1.entity.DatasetStatisticsBO;
import cn.hutool.core.map.MapUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.Assert;

import java.util.List;

/**
 * @author zhujh
 */
public class DatasetStatisticsUseCase {

    @Autowired
    private DataInfoUseCase dataInfoUsecase;

    @Autowired
    private DatasetClassUseCase datasetClassUseCase;

    public DatasetStatisticsBO datasetOverview(Long datasetId) {
        Assert.notNull(datasetId, "datasetId is null");
        var datasetStatisticsMap = dataInfoUsecase.getDatasetStatisticsByDatasetIds(List.of(datasetId));
        return datasetStatisticsMap.getOrDefault(datasetId, DatasetStatisticsBO.createEmpty(datasetId));
    }

}
