package ai.basic.x1.adapter.api.context;


public interface RequestContextHolderStrategy {

    void cleanContext();

    RequestContext getContext();

    void setContext(RequestContext context);

    RequestContext createEmptyContext();
}
