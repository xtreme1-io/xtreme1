package ai.basic.x1.adapter.api.context;


/**
 * @author andy
 */
public interface RequestContextHolderStrategy {

    /**
     * Clean request context data
     */
    void cleanContext();

    /**
     * Get current context
     * @return
     */
    RequestContext getContext();

    /**
     * Set current context
     * @param context
     */
    void setContext(RequestContext context);

    /**
     * Create empty context
     * @return
     */
    RequestContext createEmptyContext();
}
