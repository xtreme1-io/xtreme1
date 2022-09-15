package ai.basic.x1.adapter.port.rpc;

import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.port.rpc.dto.PredImageReqDTO;
import ai.basic.x1.adapter.port.rpc.dto.PredImageRespDTO;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import cn.hutool.http.ContentType;
import cn.hutool.http.HttpStatus;
import cn.hutool.http.HttpUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

/**
 * @author zhujh
 */
@Component
public class PredImageCo80ModelHttpCaller {

    @Value("${model.arithmetic.image80.url:http://pre/basic_predict}")
    private String url;

    @Autowired
    private ObjectMapper objectMapper;

    public ApiResult<List<PredImageRespDTO>> callPredImageModel(PredImageReqDTO requestBody) throws IOException {
        var requestBodyStr = objectMapper.writeValueAsString(requestBody);
        var httpRequest = HttpUtil.createPost(url)
                .body(requestBodyStr, ContentType.JSON.getValue());
        var httpResponse = httpRequest.execute();
        ApiResult<List<PredImageRespDTO>> result;
        if (httpResponse.getStatus() == HttpStatus.HTTP_OK) {
            result = objectMapper.readValue(httpResponse.bodyBytes(),
                    new TypeReference<ApiResult<List<PredImageRespDTO>>>() {
            });
        } else {
            throw new UsecaseException(UsecaseCode.UNKNOWN, httpResponse.body());
        }
        return result;
    }

}
