package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.DataInfoDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataInfo;
import ai.basic.x1.adapter.port.dao.mybatis.model.DatasetStatistics;
import ai.basic.x1.entity.DataInfoBO;
import ai.basic.x1.entity.DataInfoQueryBO;
import ai.basic.x1.entity.DatasetStatisticsBO;
import ai.basic.x1.entity.FileBO;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static ai.basic.x1.util.Constants.FILE;

/**
 * @author fyb
 * @date 2022/2/21 12:12
 */
@Slf4j
public class DataInfoUseCase {

    @Autowired
    private DataInfoDAO dataInfoDAO;

    @Autowired
    private FileUseCase fileUseCase;


    /*public DataInfoUseCase() {
        MimeUtil.registerMimeDetector("eu.medsea.mimeutil.detector.MagicMimeMimeDetector");
    }*/


    /**
     * 批量删除
     *
     * @param ids 数据id集合
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteBatch(List<Long> ids) {
        /*var count = dataEditDAO.count(Wrappers.lambdaQuery(DataEdit.class).in(DataEdit::getDataId, ids));
        if (count > 0) {
            throw new UsecaseException(UsecaseCode.DATASET__DATA_OTHERS_ANNOTATING);
        }*/
        var dataInfoLambdaUpdateWrapper = Wrappers.lambdaUpdate(DataInfo.class);
        dataInfoLambdaUpdateWrapper.in(DataInfo::getId, ids);
        dataInfoLambdaUpdateWrapper.set(DataInfo::getIsDeleted, true);
        dataInfoDAO.update(dataInfoLambdaUpdateWrapper);
    }

    /**
     * 分页查询dataInfo
     *
     * @param queryBO 查询参数对象
     * @return dataInfo page
     */
    public Page<DataInfoBO> findByPage(DataInfoQueryBO queryBO) {
        var lambdaQueryWrapper = Wrappers.lambdaQuery(DataInfo.class);
        lambdaQueryWrapper.eq(DataInfo::getDatasetId, queryBO.getDatasetId());
        lambdaQueryWrapper.eq(DataInfo::getIsDeleted, false);
        if (StrUtil.isNotBlank(queryBO.getName())) {
            lambdaQueryWrapper.like(DataInfo::getName, queryBO.getName());
        }

        if (ObjectUtil.isNotEmpty(queryBO.getCreateStartTime()) && ObjectUtil.isNotEmpty(queryBO.getCreateEndTime())) {
            lambdaQueryWrapper.ge(DataInfo::getCreatedAt, queryBO.getCreateStartTime()).le(DataInfo::getCreatedAt, queryBO.getCreateEndTime());
        }

        if (StrUtil.isNotBlank(queryBO.getSortField())) {
            lambdaQueryWrapper.last(" order by " + queryBO.getSortField().toLowerCase() + " " + queryBO.getAscOrDesc());
        }
        var dataInfoPage = dataInfoDAO.page(new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(queryBO.getPageNo(), queryBO.getPageSize()), lambdaQueryWrapper);
        return DefaultConverter.convert(dataInfoPage, DataInfoBO.class);
    }

    /**
     * 获取文件信息根据datasetId进行分组
     *
     * @param dataInfoBOList 数据集合
     * @return dataset与数据集合Map
     */
    public Map<Long, List<DataInfoBO>> getDataInfoListFileMap(List<DataInfoBO> dataInfoBOList) {
        if (CollectionUtil.isNotEmpty(dataInfoBOList)) {
            setDataInfoBOListFile(dataInfoBOList);
            return dataInfoBOList.stream().collect(
                    Collectors.groupingBy(DataInfoBO::getDatasetId));
        }
        return new HashMap<>();
    }

    /**
     * 获取文件信息，并往data list设置文件信息
     *
     * @param dataInfoBOList 数据集合
     */
    private void setDataInfoBOListFile(List<DataInfoBO> dataInfoBOList) {
        var fileIds = new ArrayList<Long>();
        dataInfoBOList.forEach(dataInfoBO -> fileIds.addAll(getFileIds(dataInfoBO.getContent())));
        if (CollectionUtil.isNotEmpty(fileIds)) {
            var fileMap = findFileByFileIds(fileIds);
            dataInfoBOList.forEach(dataInfoBO -> setFile(dataInfoBO.getContent(), fileMap));
        }
    }

    /**
     * 往content中设置文件信息
     *
     * @param fileNodeBOList data文件信息
     * @param fileMap        文件map
     */
    private void setFile(List<DataInfoBO.FileNodeBO> fileNodeBOList, Map<Long, FileBO> fileMap) {
        if (CollectionUtil.isEmpty(fileNodeBOList)) {
            return;
        }
        fileNodeBOList.forEach(fileNodeBO -> {
            if (fileNodeBO.getType().equals(FILE)) {
                fileNodeBO.setFile(fileMap.get(fileNodeBO.getFileId()));
            } else {
                setFile(fileNodeBO.getFiles(), fileMap);
            }
        });
    }

    /**
     * 根据数据id查询文件信息
     *
     * @param fileIds 文件id集合
     * @return 文件对象map
     */
    private Map<Long, FileBO> findFileByFileIds(List<Long> fileIds) {
        var relationFileBOList = fileUseCase.findByIds(fileIds);
        return CollectionUtil.isNotEmpty(relationFileBOList) ?
                relationFileBOList.stream().collect(Collectors.toMap(FileBO::getId, fileBO -> fileBO, (k1, k2) -> k1)) : new HashMap<>();

    }

    /**
     * 从content中循环获取文件ID
     *
     * @param fileNodeBOList 数据集合
     * @return 文件ID集合
     */
    private List<Long> getFileIds(List<DataInfoBO.FileNodeBO> fileNodeBOList) {
        var fileIds = new ArrayList<Long>();
        if (CollectionUtil.isEmpty(fileNodeBOList)) {
            return fileIds;
        }
        fileNodeBOList.forEach(fileNodeBO -> {
            if (fileNodeBO.getType().equals(FILE)) {
                fileIds.add(fileNodeBO.getFileId());
            } else {
                fileIds.addAll(getFileIds(fileNodeBO.getFiles()));
            }
        });
        return fileIds;
    }


    /**
     * 根据数据集id集合查询数据集统计
     *
     * @param datasetIds 数据集id集合
     * @return 数据集统计数据
     */
    public Map<Long, DatasetStatisticsBO> getDatasetStatisticsByDatasetIds(List<Long> datasetIds) {
        var datasetStatisticsList = dataInfoDAO.getBaseMapper().getDatasetStatisticsByDatasetIds(datasetIds);
        return datasetStatisticsList.stream()
                .collect(Collectors.toMap(DatasetStatistics::getDatasetId, datasetStatistics -> DefaultConverter.convert(datasetStatistics, DatasetStatisticsBO.class), (k1, k2) -> k1));
    }


}
