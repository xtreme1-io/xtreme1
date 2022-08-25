package ai.basic.x1.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * @author fyb
 * @date 2022/2/16 14:51
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataInfoBO {

    /**
     * 单个dataID
     */
    private Long id;

    /**
     * 数据集ID
     */
    private Long datasetId;

    /**
     * 数据名称
     */
    private String name;

    /**
     * 数据大小
     */
    private Long size;

    /**
     * 配置参数（例如旋转）存入json由前端控制
     */
    private String displaySettings;

    /**
     * 标注数量
     */
    private Integer annotationCount;

    /**
     * 内容（文件夹路径、版本信息）
     */
    private List<FileNodeBO> content;

    /**
     * 是否删除 0 否 1是
     */
    private Boolean isDeleted;

    /**
     * 创建时间
     */
    private OffsetDateTime createdAt;

    /**
     * 创建人ID
     */
    private Long createdBy;

    /**
     * 更新时间
     */
    private OffsetDateTime updatedAt;

    /**
     * 更改人ID
     */
    private Long updatedBy;

    /**
     * 文件Id
     */
    private Long fileId;

    /**
     * 锁定人员的名称
     */
    private String lockedBy;


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileNodeBO {

        /**
         * 名称
         */
        private String name;

        /**
         * 文件ID
         */
        private Long fileId;

        /**
         * 类型
         */
        private String type;

        /**
         * 文件对象
         */
        private FileBO file;

        /**
         * 子文件
         */
        private List<FileNodeBO> files;
    }
}
