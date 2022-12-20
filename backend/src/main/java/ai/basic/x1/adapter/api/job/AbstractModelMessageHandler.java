package ai.basic.x1.adapter.api.job;

import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.entity.ModelMessageBO;
import ai.basic.x1.entity.enums.ModelCodeEnum;
import ai.basic.x1.usecase.exception.UsecaseCode;
import cn.hutool.core.date.StopWatch;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.json.JSONUtil;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import javax.annotation.PostConstruct;

/**
 * @author andy
 */
@Slf4j
public abstract class AbstractModelMessageHandler<T> {

    @Autowired
    private Jackson2ObjectMapperBuilder jackson2ObjectMapperBuilder;
    protected ObjectMapper objectMapper;


    @PostConstruct
    public void init() {
        objectMapper = jackson2ObjectMapperBuilder.build();
        objectMapper.activateDefaultTyping(objectMapper.getPolymorphicTypeValidator(),
                ObjectMapper.DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY);
    }

    private static final Integer RETRY_COUNT = 3;

    /**
     * model run implement by subClass
     *
     * @param modelMessageBO
     * @return
     */
    public abstract boolean modelRun(ModelMessageBO modelMessageBO);

    /**
     * call remote model service implement by subClass
     *
     * @param modelMessageBO
     * @return
     */
    abstract ApiResult<T> callRemoteService(ModelMessageBO modelMessageBO);

    /**
     * model code implement by subClass
     *
     * @return
     */
    public abstract ModelCodeEnum getModelCodeEnum();

    public ApiResult<T> getRetryAbleApiResult(ModelMessageBO modelMessageBO) {
        ApiResult<T> apiResult = null;
        int count = 0;
        while (count <= RETRY_COUNT && ObjectUtil.isNull(apiResult)) {
            try {
                apiResult = callRemoteService(modelMessageBO);
                break;
            } catch (Throwable throwable) {
                log.error("call remote service is error", throwable);
            }
            count++;
        }
        if (apiResult != null && apiResult.getCode() == UsecaseCode.OK) {
            return apiResult;
        } else {
            log.warn("call remote service is error.result is {}", JSONUtil.toJsonStr(apiResult));
            if (apiResult != null) {
                return new ApiResult<>(apiResult.getCode(), apiResult.getMessage());
            } else {
                return new ApiResult<>(UsecaseCode.UNKNOWN, "service is busy");
            }
        }
    }

}
