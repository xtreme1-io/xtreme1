package ai.basic.x1.adapter.api.filter;

import ai.basic.x1.adapter.dto.LoggedUserDTO;
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

    private JwtHelper jwtHelper;

    private UserUseCase userUseCase;

    public JwtAuthenticationFilter(JwtHelper jwtHelper, UserUseCase userUseCase) {
        this.jwtHelper = jwtHelper;
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

        // 为方便调试，如果从请求头里获取 Token 失败，会再尝试从 Query 参数获取
        if (token == null) {
            token = req.getParameter("token");
        }

        if (token == null) {
            chain.doFilter(request, response);
            return;
        }

        var payload = jwtHelper.getPayload(token);
        if (payload == null) {
            chain.doFilter(request, response);
            return;
        }

        var userBO = userUseCase.findById(payload.getUserId());
        if (userBO == null) {
            chain.doFilter(request, response);
            return;
        }

        var loggedUser = new LoggedUserDTO(userBO);
        var authentication = new UsernamePasswordAuthenticationToken(
                loggedUser, loggedUser.getPassword(), loggedUser.getAuthorities());
        // 显示创建 SecutiryContext，避免多线程之间的条件竞争
        var securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);

        chain.doFilter(request, response);
        return;
    }

}
