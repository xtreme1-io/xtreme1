package ai.basic.x1.adapter.api.context;


/**
 * @author andy
 */
public class RequestContextImpl implements RequestContext {

    private UserInfo userInfo;
    private RequestInfo requestInfo;

    public RequestContextImpl() {
    }

    public RequestContextImpl( UserInfo userInfo, String xUser, RequestInfo requestInfo) {
        this.userInfo = userInfo;
        this.requestInfo = requestInfo;
    }

    @Override
    public UserInfo getUserInfo() {
        return this.userInfo;
    }

    @Override
    public void setUserInfo(UserInfo userInfo) {
        this.userInfo = userInfo;
    }


    @Override
    public RequestInfo getRequestInfo() {
        return this.requestInfo;
    }

    @Override
    public void setRequestInfo(RequestInfo requestInfo) {
        this.requestInfo = requestInfo;
    }
}
