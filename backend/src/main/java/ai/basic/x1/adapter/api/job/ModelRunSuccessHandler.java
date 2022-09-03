package ai.basic.x1.adapter.api.job;

import ai.basic.x1.entity.ModelMessageBO;

public interface ModelRunSuccessHandler<T> {

    /**
     * Called when a model service has been successfully called.
     * @param requestParam - the request body of model service
     * @param message - model message
     */
    void onModelRunSuccess(T requestParam, ModelMessageBO message);

}
