package ai.basic.x1community.adapter.api.controller;

import ai.basic.x1community.adapter.api.filter.JwtHelper;
import ai.basic.x1community.adapter.api.filter.LoggedUser;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * @author Jagger Wang
 */
public abstract class BaseController {

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected JwtHelper jwtHelper;

    protected LoggedUser loggedUser() {
        var securityContext = SecurityContextHolder.getContext();
        var authentication = securityContext.getAuthentication();
        if (authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }

        return  (LoggedUser) authentication.getPrincipal();
    }

}
