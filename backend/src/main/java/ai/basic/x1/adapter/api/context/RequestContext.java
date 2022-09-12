package ai.basic.x1.adapter.api.context;

/**
 * @author andy
 */
public interface RequestContext {

    UserInfo getUserInfo();

    void setUserInfo(UserInfo userInfo);

    RequestInfo getRequestInfo();

    void setRequestInfo(RequestInfo requestInfo);


}
