package ai.basic.x1.adapter.api.annotation.user;

import ai.basic.x1.adapter.dto.LoggedUserDTO;
import org.springframework.core.MethodParameter;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/**
 * @author andy
 */
public class LoggedUserArgumentResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter methodParameter) {
        if (methodParameter.getParameterAnnotation(LoggedUser.class) != null && methodParameter.getParameterType() == LoggedUserDTO.class) {
            return true;
        }
        return false;
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer, NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
        var securityContext = SecurityContextHolder.getContext();
        var authentication = securityContext.getAuthentication();
        if (authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }

        return authentication.getPrincipal();
    }
}
