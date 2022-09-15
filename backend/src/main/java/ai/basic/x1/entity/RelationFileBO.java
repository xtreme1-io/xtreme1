package ai.basic.x1.entity;

import lombok.Data;

import java.util.List;

/**
 * @author fyb
 */
@Data
public class RelationFileBO extends FileBO {

    /**
     * Relation files
     */
    private List<FileBO> relationFiles;
    
}
