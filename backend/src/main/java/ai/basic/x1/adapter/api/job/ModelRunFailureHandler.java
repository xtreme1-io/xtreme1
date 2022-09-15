package ai.basic.x1.adapter.api.job;

import ai.basic.x1.entity.ModelMessageBO;

/**
 * @author butterflyzh
 */
public interface ModelRunFailureHandler {

    /**
     * Called when model service has been fails.
     * @param message - model message
     * @param exception – the exception which was thrown to fail the model service.
     */
    void onModelRunFailure(ModelMessageBO message, Exception exception);

}
