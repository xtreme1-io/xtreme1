package ai.basic.x1.adapter.dto;

import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.util.ObjectUtil;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author fyb
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataInfoDTO {

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
    private List<FileNodeDTO> content;

    /**
     * 类型（表示连续帧、非连续帧）
     */
    private String type;

    /**
     * 父级ID(连续帧ID)
     */
    private Long parentId;

    /**
     * 锁定人员的名称
     */
    private String lockedBy;


    @JsonInclude(value = JsonInclude.Include.NON_NULL)
    public static class FileNodeDTO {
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
         * 文件信息
         */
        private FileDTO file;

        /**
         * 子文件
         */
        private List<FileNodeDTO> files;

        /**
         * 文件夹类型（标识下面的文件是什么类型）
         */
        private String directoryType;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Long getFileId() {
            return fileId;
        }

        public void setFileId(Long fileId) {
            this.fileId = fileId;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public FileDTO getFile() {
            return file;
        }

        public void setFile(FileDTO file) {
            this.file = file;
        }

        public List<FileNodeDTO> getFiles() {
            return files;
        }

        public void setFiles(List<FileNodeDTO> files) {
            this.files = files;
        }

        public void setDirectoryType(String directoryType) {
            this.directoryType = directoryType;
        }

        public String getDirectoryType() {
            if (CollectionUtil.isNotEmpty(files)) {
                var file = CollectionUtil.getFirst(files).getFile();
                return ObjectUtil.isNotNull(file) ? file.getType() : null;
            }
            return directoryType;
        }

    }
}