package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.FileDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.File;
import ai.basic.x1.adapter.port.minio.MinioService;
import ai.basic.x1.entity.FileBO;
import ai.basic.x1.entity.RelationFileBO;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.util.ByteUtil;
import cn.hutool.crypto.SecureUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * @author : fyb
 */
@Slf4j
public class FileUseCase {

    @Autowired
    private FileDAO fileDAO;

    @Autowired
    private MinioService minioService;

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
        Objects.requireNonNull(fileBOs).forEach(fileBO -> {
            setUrl(fileBO);
            if (CollectionUtil.isNotEmpty(relationFiles)) {
                var relationFileBOs = DefaultConverter.convert(relationFiles.stream().
                        filter(relationFile -> relationFile.getRelationId().equals(fileBO.getId())).collect(Collectors.toList()), FileBO.class);
                Objects.requireNonNull(relationFileBOs).forEach(this::setUrl);
                fileBO.setRelationFiles(relationFileBOs);
            }
        });
        return fileBOs;
    }


    private void setUrl(FileBO fileBO) {
        try {
            fileBO.setUrl(minioService.getUrl(fileBO.getBucketName(), fileBO.getPath()));
        } catch (Exception e) {
            log.error("Get url error",e);
            throw new UsecaseException("Get url error");
        }
    }

    /**
     * 批量保存文件信息
     *
     * @param fileBOS 文件信息对象
     * @return 文件信息集合
     */
    public List<FileBO> saveBatchFile(Long userId, List<FileBO> fileBOS) {
        var files = DefaultConverter.convert(fileBOS, File.class);
        Objects.requireNonNull(files).forEach(file -> {
            file.setPathHash(ByteUtil.bytesToLong(SecureUtil.md5().digest(file.getPath())));
            file.setCreatedBy(userId);
            file.setCreatedAt(OffsetDateTime.now());
            file.setUpdatedBy(userId);
            file.setUpdatedAt(OffsetDateTime.now());
        });
        fileDAO.saveBatch(files);
        var reFileBOs = DefaultConverter.convert(files, FileBO.class);
        Objects.requireNonNull(reFileBOs).forEach(reFileBO -> setUrl(reFileBO));
        return reFileBOs;
    }
}
