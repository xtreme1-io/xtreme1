package ai.basic.x1.entity;


import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataExportBaseBO {

    /**
     * 版本
     */
    private String version;

    /**
     * 数据集名称
     */
    private String datasetName;

    /**
     * 导出时间
     */
    private String exportTime;

    /**
     * 导出内容
     */
    private List<JSONObject> contents;
}
