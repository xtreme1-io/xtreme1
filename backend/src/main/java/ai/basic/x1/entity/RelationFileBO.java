package ai.basic.x1.entity;

import lombok.Data;

import java.util.List;

@Data
public class RelationFileBO extends FileBO {
    /**
     * 关联文件集合
     */
    private List<FileBO> relationFiles;
}
