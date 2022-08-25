package ai.basic.x1.adapter.api.context;


import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class RequestInfo {
    private String realIp;
    private String userAgent;
    private String host;
    private String forwardedFor;
}
