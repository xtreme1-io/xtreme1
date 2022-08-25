package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.FileDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.File;
import ai.basic.x1.entity.FileBO;
import ai.basic.x1.entity.RelationFileBO;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.collection.CollectionUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author : fyb
 */
@Slf4j
public class FileUseCase {

    @Autowired
    private FileDAO fileDAO;

    /**
     * 文件id
     *
     * @param id id
     * @return 文件对象
     */
    public RelationFileBO findById(Long id) {
        var file = fileDAO.getById(id);
        var lambdaQueryWrapper = Wrappers.lambdaQuery(File.class);
        lambdaQueryWrapper.eq(File::getRelationId, id);
        var relationFiles = fileDAO.list(lambdaQueryWrapper);
        var fileBO = DefaultConverter.convert(file, RelationFileBO.class);
        if (CollectionUtil.isNotEmpty(relationFiles)) {
            var relationFileBOs = DefaultConverter.convert(relationFiles, FileBO.class);
            relationFileBOs.forEach(this::setUrl);
            fileBO.setRelationFiles(relationFileBOs);
        }
        setUrl(fileBO);
        return fileBO;
    }

    /**
     * 文件对象list
     *
     * @param ids 文件id集合
     * @return 文件对象list
     */
    public List<RelationFileBO> findByIds(List<Long> ids) {
        var files = fileDAO.listByIds(ids);
        var fileBOs = DefaultConverter.convert(files, RelationFileBO.class);
        var lambdaQueryWrapper = Wrappers.lambdaQuery(File.class);
        lambdaQueryWrapper.in(File::getRelationId, ids);
        var relationFiles = fileDAO.list(lambdaQueryWrapper);
        fileBOs.forEach(fileBO -> {
            setUrl(fileBO);
            if (CollectionUtil.isNotEmpty(relationFiles)) {
                var relationFileBOs = DefaultConverter.convert(relationFiles.stream().
                        filter(relationFile -> relationFile.getRelationId().equals(fileBO.getId())).collect(Collectors.toList()), FileBO.class);
                relationFileBOs.forEach(this::setUrl);
                fileBO.setRelationFiles(relationFileBOs);
            }
        });
        return fileBOs;
    }


    private void setUrl(FileBO fileBO) {

    }
}
