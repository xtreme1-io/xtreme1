package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.api.filter.JwtHelper;
import ai.basic.x1.adapter.dto.LoggedUserDTO;
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

    protected LoggedUserDTO loggedUser() {
        var securityContext = SecurityContextHolder.getContext();
        var authentication = securityContext.getAuthentication();
        if (authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }

        return  (LoggedUserDTO) authentication.getPrincipal();
    }

}
