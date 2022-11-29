package ai.basic.x1.adapter.api.filter;

import ai.basic.x1.adapter.dto.LoggedUserDTO;
import ai.basic.x1.usecase.UserTokenUseCase;
import ai.basic.x1.usecase.UserUseCase;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

/**
 * @author Jagger Wang
 */
@Slf4j
public class JwtAuthenticationFilter implements Filter {

    private UserTokenUseCase userTokenUseCase;

    private UserUseCase userUseCase;

    public JwtAuthenticationFilter(UserTokenUseCase userTokenUseCase, UserUseCase userUseCase) {
        this.userTokenUseCase = userTokenUseCase;
        this.userUseCase = userUseCase;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        String token = null;
        var req = (HttpServletRequest) request;
        var authorization = req.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorization != null && authorization.startsWith("Bearer ")) {
            token = authorization.split(" ")[1].trim();
        }

        if (token == null) {
            token = req.getParameter("token");
        }

        if (token == null) {
            chain.doFilter(request, response);
            return;
        }

        var payload = userTokenUseCase.getPayload(token);
        if (payload == null) {
            chain.doFilter(request, response);
            return;
        }

        var userBO = userUseCase.findById(payload.getUserId());
        if (userBO == null) {
            chain.doFilter(request, response);
            return;
        }

        var loggedUserDTO = new LoggedUserDTO(userBO.getUsername(), userBO.getPassword(), userBO.getId());
        var authentication = new UsernamePasswordAuthenticationToken(
                loggedUserDTO, loggedUserDTO.getPassword(), loggedUserDTO.getAuthorities());
        var securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);

        chain.doFilter(request, response);
        return;
    }

}
