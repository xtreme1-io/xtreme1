package ai.basic.x1.adapter.api.filter;

import io.jsonwebtoken.*;

import java.time.OffsetDateTime;
import java.util.Date;
import java.util.Map;

/**
 * @author Jagger Wang
 */
public class JwtHelper {

    private JwtParser jwtParser;

    private JwtBuilder jwtBuilder;

    private Integer jwtExpireHours;

    public JwtHelper(String jwtSecret, String jwtIssuer, Integer jwtExpireHours) {
        this.jwtParser = Jwts.parser().setSigningKey(jwtSecret);
        this.jwtExpireHours = jwtExpireHours;
        if (jwtIssuer != null && jwtExpireHours != null) {
            this.jwtBuilder = Jwts.builder()
                    .setIssuer(jwtIssuer)
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() +
                            jwtExpireHours * 60 * 60 * 1000))
                    .signWith(SignatureAlgorithm.HS512, jwtSecret);
        }
    }

    public JwtHelper(String jwtSecret) {
        this(jwtSecret, null, null);
    }

    public String generateToken(JwtPayload payload) {
        return jwtBuilder.setSubject(payload.getUserId().toString())
                .setExpiration(payload.getExpireTime())
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            jwtParser.parseClaimsJws(token);
        } catch (JwtException e) {
            return false;
        }

        return true;
    }

    public JwtPayload getPayload(String token) {
        Claims claims;
        try {
            claims = jwtParser.parseClaimsJws(token).getBody();
        } catch (JwtException e) {
            return null;
        }

        return JwtPayload.builder()
                .userId(Long.parseLong(claims.getSubject()))
                .build();
    }

    public JwtPayload parseToken(String token) {
        Claims claims = jwtParser.parseClaimsJws(token).getBody();
        return JwtPayload.builder()
                .userId(Long.parseLong(claims.getSubject()))
                .build();
    }

    public OffsetDateTime getDefaultExpireTime() {
        return OffsetDateTime.now().plusHours(jwtExpireHours);
    }
}
