package ai.basic.x1.adapter.port.rpc;

import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.port.rpc.dto.PreModelReqDTO;
import ai.basic.x1.adapter.port.rpc.dto.PreModelRespDTO;
import ai.basic.x1.usecase.exception.UsecaseException;
import cn.hutool.core.date.StopWatch;
import cn.hutool.http.*;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.List;

@Component
@Slf4j
public class PreLabelModelHttpCaller {


    private static final String preModelUrl = "http://pre/pointcloud/3dbox";

    @Autowired
    private Jackson2ObjectMapperBuilder jackson2ObjectMapperBuilder;
    private ObjectMapper objectMapper;

    @PostConstruct
    public void init() {
        objectMapper = jackson2ObjectMapperBuilder.build();
        objectMapper.activateDefaultTyping(objectMapper.getPolymorphicTypeValidator(),
                ObjectMapper.DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY);
    }


    public ApiResult<List<PreModelRespDTO>> callPreLabelModel(PreModelReqDTO preModelReqDTO) {
        try {
            StopWatch stopWatch = new StopWatch();
            String requestBody = objectMapper.writeValueAsString(preModelReqDTO);
            HttpRequest httpRequest = HttpUtil.createPost(preModelUrl)
                    .body(requestBody, ContentType.JSON.getValue());
            HttpResponse httpResponse = httpRequest.execute();
            stopWatch.stop();
            log.info(String.format("call trackingModelService took: %dms,req:%s ,resp:%s", stopWatch.getLastTaskTimeMillis(), requestBody, httpResponse.body()));
            if (httpResponse.getStatus() == HttpStatus.HTTP_OK) {
                ApiResult<List<PreModelRespDTO>> apiResult = objectMapper.readValue(httpResponse.body(), new TypeReference<>() {
                });
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
