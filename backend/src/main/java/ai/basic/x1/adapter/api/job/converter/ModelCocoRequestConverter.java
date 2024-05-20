package ai.basic.x1.adapter.api.job.converter;

import ai.basic.x1.adapter.port.rpc.dto.ImageDetectionReqDTO;
import ai.basic.x1.entity.ModelMessageBO;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;

import java.util.List;

import static ai.basic.x1.util.Constants.FILE;

/**
 * @author zhujh
 */
public class ModelCocoRequestConverter {

    public static ImageDetectionReqDTO convert(ModelMessageBO message) {
        var dataInfo = message.getDataInfo();
        if (dataInfo == null) {
            throw new IllegalArgumentException(String.format("%s data is not found",
                    message.getDataId()));
        }
        var fileNodes = dataInfo.getContent();
        if (CollUtil.isEmpty(fileNodes)) {
            throw new IllegalArgumentException("file is not found");
        }
        var fileNodeBO = fileNodes.get(0);
        String url;
        if (fileNodeBO.getType().equals(FILE)) {
            url = fileNodeBO.getFile().getUrl();
        } else {
            url = fileNodeBO.getFiles().get(0).getFile().getUrl();
        }
        if (StrUtil.isEmpty(url)) {
            throw new IllegalArgumentException("file url is empty");
        }
        return ImageDetectionReqDTO.builder().datas(List.of(ImageDetectionReqDTO.ImageData.builder()
                .id(dataInfo.getId()).url(url).build())).build();
    }

}
