package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.DatasetDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.Dataset;
import ai.basic.x1.entity.DatasetBO;
import ai.basic.x1.entity.DatasetQueryBO;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import ai.basic.x1.util.lock.IDistributedLock;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * @author fyb
 * @date 2022/2/16 15:03
 */
public class DatasetUseCase {

    @Autowired
    private DatasetDAO datasetDAO;

    @Autowired
    private IDistributedLock distributedLock;


    /**
     * Save dataset
     *
     * @param bo Dataset information
     */
    public DatasetBO create(DatasetBO bo) {
        var lockKey = String.format("%s/%s", "datasetName", bo.getName());
        var boo = distributedLock.tryLock(lockKey, 1000);
        if (!boo) {
            throw new UsecaseException(UsecaseCode.DATASET_NAME_DUPLICATED);
        }
        if (nameExists(bo.getName(), null)) {
            distributedLock.unlock(lockKey);
            throw new UsecaseException(UsecaseCode.DATASET_NAME_DUPLICATED);
        }
        var dataset = DefaultConverter.convert(bo, Dataset.class);
        datasetDAO.save(dataset);
        distributedLock.unlock(lockKey);
        return DefaultConverter.convert(dataset, DatasetBO.class);
    }

    /**
     * Dataset update
     *
     * @param id       Dataset id
     * @param updateBO Dataset update information
     */
    public void update(Long id, DatasetBO updateBO) {
        var lockKey = String.format("%s/%s", "datasetName", updateBO.getName());
        var boo = distributedLock.tryLock(lockKey, 1000);
        if (!boo) {
            throw new UsecaseException(UsecaseCode.DATASET_NAME_DUPLICATED);
        }
        var datasetBO = findById(id);
        if (datasetBO == null) {
            distributedLock.unlock(lockKey);
            throw new UsecaseException(UsecaseCode.NOT_FOUND);
        }
        if (nameExists(updateBO.getName(), id)) {
            distributedLock.unlock(lockKey);
            throw new UsecaseException(UsecaseCode.DATASET_NAME_DUPLICATED);
        }
        datasetBO.setName(updateBO.getName());
        datasetBO.setDescription(updateBO.getDescription());
        var lambdaUpdateWrapper = Wrappers.lambdaUpdate(Dataset.class);
        lambdaUpdateWrapper.eq(Dataset::getId, id);
        datasetDAO.update(DefaultConverter.convert(datasetBO, Dataset.class), lambdaUpdateWrapper);
        distributedLock.unlock(lockKey);
    }

    /**
     * Determine if the dataset name exists
     *
     * @param name Dataset name
     * @param id   Dataset id
     */
    private boolean nameExists(String name, Long id) {
        var datasetLambdaQueryWrapper = Wrappers.lambdaQuery(Dataset.class);
        datasetLambdaQueryWrapper.eq(Dataset::getName, name);
        if (ObjectUtil.isNotEmpty(id)) {
            datasetLambdaQueryWrapper.ne(Dataset::getId, id);
        }
        return datasetDAO.getBaseMapper().exists(datasetLambdaQueryWrapper);
    }


    /**
     * Delete dataset
     *
     * @param id Dataset id
     */
    public void delete(Long id) {
        var datasetLambdaUpdateWrapper = Wrappers.lambdaUpdate(Dataset.class);
        datasetLambdaUpdateWrapper.eq(Dataset::getId, id);
        datasetLambdaUpdateWrapper.set(Dataset::getIsDeleted, true);
        datasetDAO.update(datasetLambdaUpdateWrapper);
    }

    /**
     * Paging query dataset
     *
     * @param pageNo   Page number
     * @param pageSize Page size
     * @param queryBO  query parameters object
     * @return Dataset page
     */
    public Page<DatasetBO> findByPage(Integer pageNo, Integer pageSize, DatasetQueryBO queryBO) {
        var lambdaQueryWrapper = Wrappers.lambdaQuery(Dataset.class);
        lambdaQueryWrapper.eq(Dataset::getIsDeleted, false);
        if (StrUtil.isNotBlank(queryBO.getName())) {
            lambdaQueryWrapper.like(Dataset::getName, queryBO.getName());
        }

        if (ObjectUtil.isNotNull(queryBO.getType())) {
            lambdaQueryWrapper.eq(Dataset::getType, queryBO.getType());
        }

        if (ObjectUtil.isNotEmpty(queryBO.getCreateStartTime()) && ObjectUtil.isNotEmpty(queryBO.getCreateEndTime())) {
            lambdaQueryWrapper.ge(Dataset::getCreatedAt, queryBO.getCreateStartTime()).le(Dataset::getCreatedAt, queryBO.getCreateEndTime());
        }

        if (StrUtil.isNotBlank(queryBO.getSortField())) {
            lambdaQueryWrapper.last(" order by " + queryBO.getSortField().toLowerCase() + " " + queryBO.getAscOrDesc());
        }
        var datasetPage = datasetDAO.getBaseMapper().selectDatasetPage(new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(pageNo, pageSize), lambdaQueryWrapper);
        return DefaultConverter.convert(datasetPage, DatasetBO.class);
    }

    /**
     * Query details based on dataset id
     *
     * @param id Dataset id
     * @return Dataset detail
     */
    public DatasetBO findById(Long id) {
        return DefaultConverter.convert(datasetDAO.getById(id), DatasetBO.class);
    }

}
