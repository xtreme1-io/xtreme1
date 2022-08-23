package ai.basic.x1.adapter.api.context;


import com.alibaba.ttl.TransmittableThreadLocal;

public class ThreadLocalRequestContextHolderStrategy implements RequestContextHolderStrategy {
    private static final TransmittableThreadLocal<RequestContext> contextHolder = new TransmittableThreadLocal<>();

    @Override
    public void cleanContext() {
        contextHolder.remove();
    }

    @Override
    public RequestContext getContext() {
        RequestContext ctx = contextHolder.get();
        return ctx;
    }

    @Override
    public void setContext(RequestContext context) {
        contextHolder.set(context);
    }

    @Override
    public RequestContext createEmptyContext() {
        return new RequestContextImpl();
    }
}
