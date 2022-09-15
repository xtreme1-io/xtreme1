package ai.basic.x1.adapter.api.context;

/**
 * @author andy
 */
public interface RequestContext {

    /**
     * Get the user information of the current request
     *
     * @return
     */
    UserInfo getUserInfo();

    /**
     * Set the user information of the current request
     *
     * @param userInfo
     */
    void setUserInfo(UserInfo userInfo);

    /**
     * Get the request info of the current request
     *
     * @return
     */
    RequestInfo getRequestInfo();

    /**
     * Set the request info of the current request
     *
     * @param requestInfo
     */
    void setRequestInfo(RequestInfo requestInfo);


}
