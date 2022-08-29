package ai.basic.x1.adapter.api.filter;

import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.dto.LoggedUserDTO;
import ai.basic.x1.entity.UserBO;
import ai.basic.x1.usecase.UserUseCase;
import ai.basic.x1.usecase.exception.UsecaseCode;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.AntPathMatcher;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * @author Jagger Wang
 */
@Slf4j
public class JwtAuthenticationFilter implements Filter {

    private JwtHelper jwtHelper;
    private UserUseCase userUseCase;
    private List<String> excludeUris;
    private final static AntPathMatcher antPathMatcher = new AntPathMatcher();

    public JwtAuthenticationFilter(JwtHelper jwtHelper, UserUseCase userUseCase, List<String> excludeUris) {
        this.jwtHelper = jwtHelper;
        this.userUseCase = userUseCase;
        this.excludeUris = excludeUris;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        String token = null;
        var req = (HttpServletRequest) request;
        var authorization = req.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorization != null && authorization.startsWith("Bearer ")) {
            token = authorization.split(" ")[1].trim();
        }
        String requestURI = req.getRequestURI();
        if (requestURI.endsWith("/") && requestURI.length() > 1) {
            requestURI = requestURI.substring(0, requestURI.length() - 1);
        }
        boolean excludeUriAntMatchResult = false;
        for (String excludeUri : excludeUris) {
            if (antPathMatcher.match(excludeUri, requestURI)) {
                excludeUriAntMatchResult = true;
                break;
            }
        }

        if (token == null) {
            token = req.getParameter("token");
        }

        if (excludeUriAntMatchResult) {
            if (!StrUtil.isEmpty(token)) {
                var payload = jwtHelper.getPayload(token);
                if (payload == null) {
                    chain.doFilter(request, response);
                    return;
                }
                var userBO = userUseCase.findById(payload.getUserId());
                if (ObjectUtil.isNotNull(userBO)) {
                    setSecurityContext(userBO);
                }
            }
            chain.doFilter(request, response);
            return;
        }

        var payload = jwtHelper.getPayload(token);
        if (payload == null) {
            responseJson(response, new ApiResult<>(UsecaseCode.LOGIN_STATUS_TIMEOUT, UsecaseCode.LOGIN_STATUS_TIMEOUT.getMessage()));
            return;
        }
        var userBO = userUseCase.findById(payload.getUserId());
        if (ObjectUtil.isNull(userBO)) {
            responseJson(response, new ApiResult<>(UsecaseCode.LOGIN_STATUS_TIMEOUT, UsecaseCode.LOGIN_STATUS_TIMEOUT.getMessage()));
            return;
        }
        setSecurityContext(userBO);
        chain.doFilter(request, response);
        return;
    }

    @Override
    public void destroy() {
        SecurityContextHolder.clearContext();
    }

    private void setSecurityContext(UserBO userBO) {
        var loggedUser = new LoggedUserDTO(userBO.getUsername(), userBO.getPassword(), userBO.getId());
        var authentication = new UsernamePasswordAuthenticationToken(
                loggedUser, loggedUser.getPassword(), loggedUser.getAuthorities());
        var securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);

    }

    private <T> void responseJson(ServletResponse servletResponse, ApiResult<T> apiResult) throws IOException {
        PrintWriter out = servletResponse.getWriter();
        servletResponse.setContentType("application/json");
        servletResponse.setCharacterEncoding("UTF-8");
        out.print(JSONUtil.parseObj(apiResult, false));
        out.flush();
        out.close();
    }

}
