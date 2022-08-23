package ai.basic.x1.adapter.dto;

import com.fasterxml.jackson.annotation.JsonTypeName;
import lombok.Data;

/**
 * @author Jagger Wang
 */
@Data
@JsonTypeName("pcdFile")
public class PcdFileDTO extends FileDTO {

    /**
     * pcd二进制文件对象
     */
    private FileDTO binary;

    /**
     * pcd二进制压缩文件对象
     */
    private FileDTO binaryCompressed;

    /**
     * pcd渲染图片
     */
    private FileDTO renderImage;
}
