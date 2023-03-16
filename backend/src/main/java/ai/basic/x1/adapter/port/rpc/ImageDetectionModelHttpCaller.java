package ai.basic.x1.adapter.port.rpc;

import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.port.rpc.dto.ImageDetectionReqDTO;
import ai.basic.x1.adapter.port.rpc.dto.ImageDetectionRespDTO;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import cn.hutool.http.ContentType;
import cn.hutool.http.HttpStatus;
import cn.hutool.http.HttpUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

/**
 * @author zhujh
 */
@Component
public class ImageDetectionModelHttpCaller {

    @Autowired
    private ObjectMapper objectMapper;

    public ApiResult<List<ImageDetectionRespDTO>> callPredImageModel(ImageDetectionReqDTO requestBody, String url) throws IOException {
        var requestBodyStr = objectMapper.writeValueAsString(requestBody);
        var httpRequest = HttpUtil.createPost(url)
                .body(requestBodyStr, ContentType.JSON.getValue());
        var httpResponse = httpRequest.execute();
        ApiResult<List<ImageDetectionRespDTO>> result;
        if (httpResponse.getStatus() == HttpStatus.HTTP_OK) {
            result = objectMapper.readValue(httpResponse.bodyBytes(),
                    new TypeReference<ApiResult<List<ImageDetectionRespDTO>>>() {
            });
        } else {
            throw new UsecaseException(UsecaseCode.UNKNOWN, httpResponse.body());
        }
        return result;
    }

}
