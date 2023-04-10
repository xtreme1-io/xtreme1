package ai.basic.x1.adapter.port.rpc;

import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.port.rpc.dto.PointCloudDetectionReqDTO;
import ai.basic.x1.adapter.port.rpc.dto.PointCloudDetectionRespDTO;
import ai.basic.x1.usecase.exception.UsecaseException;
import cn.hutool.core.date.StopWatch;
import cn.hutool.core.lang.TypeReference;
import cn.hutool.http.*;
import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * @author andy
 */
@Component
@Slf4j
public class PointCloudDetectionModelHttpCaller {


    public ApiResult<List<PointCloudDetectionRespDTO>> callPreLabelModel(PointCloudDetectionReqDTO preModelReqDTO, String url) {
        try {
            StopWatch stopWatch = new StopWatch();
            stopWatch.start();
            String requestBody = JSONUtil.toJsonStr(preModelReqDTO);
            HttpRequest httpRequest = HttpUtil.createPost(url)
                    .body(requestBody, ContentType.JSON.getValue());
            HttpResponse httpResponse = httpRequest.execute();
            stopWatch.stop();
            log.info(String.format("call preLabelModelService took: %dms,req:%s ,resp:%s", stopWatch.getLastTaskTimeMillis(), requestBody, httpResponse.body()));
            if (httpResponse.getStatus() == HttpStatus.HTTP_OK) {
                ApiResult<List<PointCloudDetectionRespDTO>> apiResult = JSONUtil.toBean(httpResponse.body(), new TypeReference<>() {
                }, false);
                return apiResult;
            } else {
                throw new UsecaseException("preLabelModel run error!");
            }
        } catch (Throwable throwable) {
            log.error("call pre-model service error.", throwable);
            throw new UsecaseException("preLabelModel run error!");
        }
    }
}
