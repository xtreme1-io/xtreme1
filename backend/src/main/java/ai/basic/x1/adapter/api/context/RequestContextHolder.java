package ai.basic.x1.adapter.api.context;

/**
 * @author andy
 */
public class RequestContextHolder {
    private static RequestContextHolderStrategy strategy;

    static {
        initialize();
    }

    private static void initialize() {
        initializeStrategy();
    }

    private static void initializeStrategy() {
        strategy = new ThreadLocalRequestContextHolderStrategy();
    }

    public static void cleanContext() {
        strategy.cleanContext();
    }

    public static RequestContext getContext() {
        return strategy.getContext();
    }

    public static void setContext(RequestContext tenantContext) {
        strategy.setContext(tenantContext);
    }

    public static RequestContext createEmptyContent() {
        return strategy.createEmptyContext();
    }
}
