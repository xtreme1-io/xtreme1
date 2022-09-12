package ai.basic.x1.adapter.api.job;


import lombok.extern.slf4j.Slf4j;
import org.springframework.util.ErrorHandler;

/**
 * @author andy
 */
@Slf4j
public class ModelRunErrorHandler implements ErrorHandler {
    @Override
    public void handleError(Throwable t) {
        log.error("model run error", t);
    }
}
