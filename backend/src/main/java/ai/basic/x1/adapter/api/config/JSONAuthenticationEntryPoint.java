package ai.basic.x1.adapter.api.config;

import ai.basic.x1.adapter.dto.ApiResult;
import cn.hutool.json.JSONUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * @author andy
 */
public class JSONAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private ApiResult apiResult;
    private HttpStatus httpStatus;

    public JSONAuthenticationEntryPoint(ApiResult apiResult, HttpStatus httpStatus) {
        this.apiResult = apiResult;
        this.httpStatus = httpStatus;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        response.setStatus(httpStatus.value());
        PrintWriter out = response.getWriter();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        out.print(JSONUtil.parseObj(apiResult, false));
        out.flush();
        out.close();
    }
}
