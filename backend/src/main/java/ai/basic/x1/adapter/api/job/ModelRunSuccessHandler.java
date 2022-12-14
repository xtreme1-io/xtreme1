package ai.basic.x1.adapter.api.job;

import ai.basic.x1.entity.ModelMessageBO;

/**
 * @author butterflyzh
 */
public interface ModelRunSuccessHandler<T> {

    /**
     * Called when a model service has been successfully called.
     * @param response - the response body of model service
     * @param message - model message
     */
    void onModelRunSuccess(T response, ModelMessageBO message);

}
