package ai.basic.x1community.adapter.api.filter;

import io.jsonwebtoken.*;

import java.util.Date;

/**
 * @author Jagger Wang
 */
public class JwtHelper {

    private JwtParser jwtParser;

    private JwtBuilder jwtBuilder;

    public JwtHelper(String jwtSecret, String jwtIssuer, Integer jwtExpireHours) {
        this.jwtParser = Jwts.parser().setSigningKey(jwtSecret);

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
        var claims = Jwts.claims()
                .setSubject(payload.getUserId().toString());
        return jwtBuilder.setClaims(claims).compact();
    }

    public boolean validateToken(String token) {
        try {
            jwtParser.parseClaimsJws(token);
        } catch (ExpiredJwtException e) {
            return false;
        }

        return true;
    }

    public JwtPayload getPayload(String token) {
        Claims claims;
        try {
            claims = jwtParser.parseClaimsJws(token).getBody();
        } catch (ExpiredJwtException e) {
            return null;
        }

        return JwtPayload.builder()
                .userId(Long.parseLong(claims.getSubject()))
                .build();
    }
}
