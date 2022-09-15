package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.FileMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.File;
import org.springframework.stereotype.Component;

/**
 * @author: fyb
 * @date : 2022/2/7 15:43
 */
@Component
public class FileDAO extends AbstractDAO<FileMapper, File> {
}
