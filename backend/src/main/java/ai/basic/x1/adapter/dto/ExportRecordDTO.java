package ai.basic.x1.adapter.dto;

import ai.basic.x1.entity.enums.ExportStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author fyb
 * @date 2022-04-21 11:48:13
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExportRecordDTO {

    /**
     *
     */
    private Long id;

    /**
     * 流水号
     */
    private Long serialNumber;

    /**
     * 文件ID
     */
    private Long fileId;

    /**
     * 文件名称
     */
    private String fileName;

    /**
     * 状态(UNSTARTED:未开始,GENERATING:生成中,COMPLETED:已完成,FAILED:失败)
     */
    private ExportStatusEnum status;

    /**
     * 已生成数量
     */
    private Integer generatedNum;

    /**
     * 总数
     */
    private Integer totalNum;

    /**
     * 文件路径
     */
    private String filePath;
}
