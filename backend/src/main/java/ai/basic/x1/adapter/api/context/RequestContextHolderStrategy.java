package ai.basic.x1.adapter.api.context;


/**
 * @author andy
 */
public interface RequestContextHolderStrategy {

    void cleanContext();

    RequestContext getContext();

    void setContext(RequestContext context);

    RequestContext createEmptyContext();
}
