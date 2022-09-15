package ai.basic.x1.adapter.api.context;


import com.alibaba.ttl.TransmittableThreadLocal;

/**
 * @author andy
 */
public class ThreadLocalRequestContextHolderStrategy implements RequestContextHolderStrategy {
    private static final TransmittableThreadLocal<RequestContext> CONTEXT_HOLDER = new TransmittableThreadLocal<>();

    @Override
    public void cleanContext() {
        CONTEXT_HOLDER.remove();
    }

    @Override
    public RequestContext getContext() {
        RequestContext ctx = CONTEXT_HOLDER.get();
        return ctx;
    }

    @Override
    public void setContext(RequestContext context) {
        CONTEXT_HOLDER.set(context);
    }

    @Override
    public RequestContext createEmptyContext() {
        return new RequestContextImpl();
    }
}
