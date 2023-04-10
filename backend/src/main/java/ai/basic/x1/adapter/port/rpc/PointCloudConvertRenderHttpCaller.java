package ai.basic.x1.adapter.port.rpc;

import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.port.rpc.dto.PointCloudCRReqDTO;
import ai.basic.x1.adapter.port.rpc.dto.PointCloudCRRespDTO;
import ai.basic.x1.usecase.exception.UsecaseException;
import cn.hutool.core.date.StopWatch;
import cn.hutool.core.lang.TypeReference;
import cn.hutool.http.*;
import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * @author andy
 */
@Component
@Slf4j
public class PointCloudConvertRenderHttpCaller {

    @Value("${pointCloud.convertRender.url}")
    private String url;


    public ApiResult<List<PointCloudCRRespDTO>> callConvertRender(PointCloudCRReqDTO pointCloudCRReqDTO) {
        try {
            StopWatch stopWatch = new StopWatch();
            stopWatch.start();
            String requestBody = JSONUtil.toJsonStr(pointCloudCRReqDTO);
            HttpRequest httpRequest = HttpUtil.createPost(url)
                    .body(requestBody, ContentType.JSON.getValue());
            HttpResponse httpResponse = httpRequest.execute();
            stopWatch.stop();
            log.info(String.format("call pointCloudConvertRender took: %dms,req:%s ,resp:%s", stopWatch.getLastTaskTimeMillis(), requestBody, httpResponse.body()));
            if (httpResponse.getStatus() == HttpStatus.HTTP_OK) {
                ApiResult<List<PointCloudCRRespDTO>> apiResult = JSONUtil.toBean(httpResponse.body(), new TypeReference<>() {
                }, false);
                return apiResult;
            } else {
                throw new UsecaseException("pointCloudConvertRender service error!");
            }
        } catch (Throwable throwable) {
            log.error("call pointCloudConvertRender service error.", throwable);
            throw new UsecaseException("pointCloudConvertRender service error!");
        }
    }
}
