package ai.basic.x1.adapter.port.rpc;

import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.port.rpc.dto.SimilarityParamDTO;
import ai.basic.x1.usecase.exception.UsecaseException;
import cn.hutool.core.date.StopWatch;
import cn.hutool.http.*;
import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
/**
 * @author andy
 */
@Component
@Slf4j
public class SimilarityHttpCaller {

    @Value("${dataset.similarity.url}")
    private String similarityUrl;

    public ApiResult callSimilarity(SimilarityParamDTO similarityParamDTO) {
        try {
            StopWatch stopWatch = new StopWatch();
            stopWatch.start();
            String requestBody = JSONUtil.toJsonStr(similarityParamDTO);
            HttpRequest httpRequest = HttpUtil.createPost(similarityUrl)
                    .body(requestBody, ContentType.JSON.getValue());
            HttpResponse httpResponse = httpRequest.execute();
            stopWatch.stop();
            log.info(String.format("call calcSimilarity took: %dms,req:%s ,resp:%s", stopWatch.getLastTaskTimeMillis(), requestBody, httpResponse.body()));
            if (httpResponse.getStatus() == HttpStatus.HTTP_OK) {
                ApiResult apiResult = JSONUtil.toBean(httpResponse.body(), ApiResult.class);
                return apiResult;
            } else {
                throw new UsecaseException("call calcSimilarity run error!");
            }
        } catch (Throwable throwable) {
            log.error("call calcSimilarity service error.", throwable);
            throw new UsecaseException("calcSimilarity error!");
        }
    }

}
