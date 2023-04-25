package ai.basic.x1.adapter.api.job;

import ai.basic.x1.adapter.api.context.RequestContext;
import ai.basic.x1.adapter.api.context.RequestContextHolder;
import ai.basic.x1.adapter.api.context.RequestInfo;
import ai.basic.x1.adapter.api.context.UserInfo;
import ai.basic.x1.adapter.port.dao.DatasetSimilarityJobDAO;
import ai.basic.x1.adapter.port.dao.DatasetSimilarityRecordDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetSimilarityJob;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetSimilarityRecord;
import ai.basic.x1.adapter.port.minio.MinioProp;
import ai.basic.x1.adapter.port.minio.MinioService;
import ai.basic.x1.entity.enums.SimilarityStatusEnum;
import ai.basic.x1.usecase.DatasetSimilarityRecordUseCase;
import ai.basic.x1.util.Constants;
import ai.basic.x1.util.lock.IDistributedLock;
import cn.hutool.core.collection.CollUtil;
import com.alibaba.ttl.TtlRunnable;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executor;

/**
 * @author andy
 */
@Component
@Slf4j
public class DatasetSimilarityResultScheduledJob {
    @Autowired
    private DatasetSimilarityRecordDAO datasetSimilarityRecordDAO;
    @Autowired
    private Executor similarityExecutor;
    @Autowired
    private MinioProp minioProp;
    @Autowired
    private MinioService minioService;
    @Autowired
    @Qualifier("similarityDistributedLock")
    private IDistributedLock similarityDistributedLock;
    @Autowired
    private DatasetSimilarityRecordUseCase datasetSimilarityRecordUseCase;
    @Autowired
    private DatasetSimilarityJobDAO datasetSimilarityJobDAO;

    private static final String UPDATE_RESULT_LOCK = "update_dataset_similarity_result_lock";
    private static final String GENERATE_LOCK = "generate_similarity_result_lock";

    //@Scheduled(cron = "0/5 * * * * ?")
    public void updateDatasetSimilarityResult() {
        boolean getLock = similarityDistributedLock.tryLock(UPDATE_RESULT_LOCK);
        if (getLock) {
            try {
                List<DatasetSimilarityRecord> list = datasetSimilarityRecordDAO.list(Wrappers.lambdaQuery(DatasetSimilarityRecord.class)
                        .select(DatasetSimilarityRecord::getDatasetId, DatasetSimilarityRecord::getSerialNumber)
                        .eq(DatasetSimilarityRecord::getStatus, SimilarityStatusEnum.SUBMITTED)
                        .orderByAsc(DatasetSimilarityRecord::getCreatedAt));
                if (CollUtil.isNotEmpty(list)) {
                    CountDownLatch countDownLatch = new CountDownLatch(list.size());
                    for (DatasetSimilarityRecord datasetSimilarityRecord : list) {
                        similarityExecutor.execute(TtlRunnable.get(() -> {
                            try {
                                boolean resultExist = minioService.checkObjectExist(minioProp.getBucketName(), String.format(Constants.SIMILARITY_RESULT_PATH_FORMAT, datasetSimilarityRecord.getSerialNumber() + Constants.JSON_SUFFIX.toLowerCase()));
                                if (resultExist) {
                                    datasetSimilarityRecordDAO.update(Wrappers.lambdaUpdate(DatasetSimilarityRecord.class)
                                            .set(DatasetSimilarityRecord::getStatus, SimilarityStatusEnum.COMPLETED)
                                            .eq(DatasetSimilarityRecord::getDatasetId, datasetSimilarityRecord.getDatasetId()));
                                }
                            } catch (Throwable throwable) {
                                log.error("checkObjectExist error", throwable);
                            } finally {
                                countDownLatch.countDown();
                            }
                        }));
                    }
                    countDownLatch.await();
                }
            } catch (Throwable throwable) {
                log.error("updateDatasetResult error", throwable);
            } finally {
                if (getLock) {
                    similarityDistributedLock.unlock(UPDATE_RESULT_LOCK);
                }
            }
        }
    }

    //@Scheduled(cron = "0/5 * * * * ?")
    public void generateSimilarity() {
        boolean getLock = similarityDistributedLock.tryLock(GENERATE_LOCK);
        if (getLock) {
            try {
                List<DatasetSimilarityJob> jobList = datasetSimilarityJobDAO.list();
                if (CollUtil.isNotEmpty(jobList)) {
                    for (DatasetSimilarityJob datasetSimilarityJob : jobList) {
                        RequestContext requestContext = RequestContextHolder.createEmptyContent();
                        requestContext.setUserInfo(UserInfo.builder().id(datasetSimilarityJob.getCreatedBy()).build());
                        requestContext.setRequestInfo(RequestInfo.builder().build());
                        RequestContextHolder.setContext(requestContext);
                        datasetSimilarityRecordUseCase.generateDatasetSimilarityRecord(datasetSimilarityJob.getDatasetId());
                    }
                }
            } catch (Throwable throwable) {
                log.error("generateSimilarity error", throwable);
            } finally {
                if (getLock) {
                    similarityDistributedLock.unlock(GENERATE_LOCK);
                }
                RequestContextHolder.cleanContext();
            }
        }
    }

}
