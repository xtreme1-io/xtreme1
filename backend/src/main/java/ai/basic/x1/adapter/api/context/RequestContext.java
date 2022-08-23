package ai.basic.x1.adapter.api.context;

public interface RequestContext {

    UserInfo getUserInfo();

    void setUserInfo(UserInfo userInfo);

    RequestInfo getRequestInfo();

    void setRequestInfo(RequestInfo requestInfo);


}
