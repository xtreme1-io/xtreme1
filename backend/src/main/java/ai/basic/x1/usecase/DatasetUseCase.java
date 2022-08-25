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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;

/**
 * @author fyb
 * @date 2022/2/16 15:03
 */
public class DatasetUseCase {

    private static final Logger logger = LoggerFactory.getLogger(DatasetUseCase.class);

    @Autowired
    private DatasetDAO datasetDAO;

    @Autowired
    private DataInfoUseCase dataInfoUseCase;

    @Autowired
    private IDistributedLock distributedLock;



    /**
     * 保存dataset
     *
     * @param bo 数据集
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
     * 更新数据集
     *
     * @param id       数据集ID
     * @param updateBO 数据集对象
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
     * 判断名称是否存在
     *
     * @param name 名称
     * @param id   数据集ID
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
     * 删除数据集
     *
     * @param id     数据集ID
     */
    public void delete(Long id) {
        var datasetLambdaUpdateWrapper = Wrappers.lambdaUpdate(Dataset.class);
        datasetLambdaUpdateWrapper.eq(Dataset::getId, id);
        datasetLambdaUpdateWrapper.set(Dataset::getIsDeleted, true);
        datasetDAO.update(datasetLambdaUpdateWrapper);
    }

    /**
     * 分页查询dataset
     *
     * @param pageNo   当前查询页码
     * @param pageSize 每一页条数
     * @param queryBO  查询参数对象
     * @return dataset page
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
     * 根据数据集id查询详情
     *
     * @param id 数据集id
     * @return 数据集对象
     */
    public DatasetBO findById(Long id) {
        return DefaultConverter.convert(datasetDAO.getById(id), DatasetBO.class);
    }

    /**
     * 根据id集合查询数据集对象list
     *
     * @param ids id集合
     * @return 数据集对象list
     */
    public List<DatasetBO> listByIds(List<Long> ids) {
        return DefaultConverter.convert(datasetDAO.listByIds(ids), DatasetBO.class);
    }
}
