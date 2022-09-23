package ai.basic.x1.adapter.api.context;

import ai.basic.x1.adapter.dto.LoggedUserDTO;
import cn.hutool.core.util.ObjectUtil;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import static ai.basic.x1.util.Constants.*;

/**
 * @author andy
 */
public class RequestContextInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (ObjectUtil.isNull(RequestContextHolder.getContext())) {
            RequestContext requestContext = RequestContextHolder.createEmptyContent();
            LoggedUserDTO loggedUserDTO = getLoggedUserDTO();
            if (ObjectUtil.isNotNull(loggedUserDTO)) {
                requestContext.setUserInfo(UserInfo.builder().id(loggedUserDTO.getId()).build());
            }
            requestContext.setRequestInfo(RequestInfo.builder().host(request.getHeader(HOST)).forwardedProto(request.getHeader(X_FORWARDED_PROTO))
                    .realIp(request.getHeader(X_REAL_IP)).forwardedFor(request.getHeader(X_FORWARDED_FOR)).userAgent(request.getHeader(X_UA)).build());
            RequestContextHolder.setContext(requestContext);
        }
        return true;
    }


    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        RequestContextHolder.cleanContext();
    }

    private LoggedUserDTO getLoggedUserDTO() {
        var securityContext = SecurityContextHolder.getContext();
        var authentication = securityContext.getAuthentication();
        if (authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }

        return (LoggedUserDTO) authentication.getPrincipal();
    }
}
