package ai.basic.x1.usecase;

import ai.basic.x1.adapter.api.filter.JwtHelper;
import ai.basic.x1.adapter.api.filter.JwtPayload;
import ai.basic.x1.adapter.port.dao.UserTokenDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.UserToken;
import ai.basic.x1.entity.UserTokenBO;
import ai.basic.x1.entity.enums.TokenType;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

import javax.annotation.Nullable;
import java.time.OffsetDateTime;
import java.util.Date;
import java.util.concurrent.CompletableFuture;

/**
 * @author zhujh
 */
@Slf4j
public class UserTokenUseCase {

    @Autowired
    private UserTokenDAO userTokenDAO;

    @Autowired
    private JwtHelper jwtHelper;

    public JwtPayload getPayload(String token) {
        if (!isExist(token)) {
            log.info("token not found. " + StrUtil.sub(token, 0, 50));
            return null;
        }
        JwtPayload payload;
        try {
            payload = jwtHelper.parseToken(token);
        } catch (ExpiredJwtException ex) {
            var userId = Long.parseLong(ex.getClaims().getSubject());
            deleteExpireTokenAsync(userId);
            log.info("token is expire. " + StrUtil.sub(token, 0, 50));
            return null;
        } catch (JwtException ex) {
            return null;
        }
        return payload;
    }

    private boolean isExist(String token) {
        var query = new LambdaQueryWrapper<UserToken>();
        query.eq(UserToken::getToken, token);
        return userTokenDAO.getBaseMapper().exists(query);
    }

    public UserTokenBO generateGatewayToken(Long userId) {
        return generateToken(userId, jwtHelper.getDefaultExpireTime(), TokenType.GATEWAY);
    }

    public UserTokenBO generateApiToken(Long userId, @Nullable OffsetDateTime expireAt) {
        return generateToken(userId, expireAt, TokenType.API);
    }

    private UserTokenBO generateToken(Long userId, @Nullable OffsetDateTime expireAt,
                                TokenType tokenType) {
        Date expireDate = null;
        if (expireAt != null) {
            expireDate = new Date(expireAt.toInstant().toEpochMilli());
        }

        UserToken userToken = UserToken.builder()
            .token(jwtHelper.generateToken(JwtPayload.builder()
                    .userId(userId)
                    .expireTime(expireDate)
                    .build())
            )
            .tokenType(tokenType)
            .createdBy(userId)
            .expireAt(expireAt)
            .build();

        userTokenDAO.save(userToken);
        return DefaultConverter.convert(userToken, UserTokenBO.class);
    }

    public UserTokenBO getApiToken(Long userId) {
        return DefaultConverter.convert(userTokenDAO.getOne(new LambdaQueryWrapper<UserToken>()
                .eq(UserToken::getCreatedBy, userId)
                .eq(UserToken::getTokenType, TokenType.API)
        , false), UserTokenBO.class);
    }

    public void deleteApiToken(Long id, Long userId) {
        userTokenDAO.remove(new LambdaQueryWrapper<UserToken>()
                .eq(UserToken::getId, id)
                .eq(UserToken::getTokenType, TokenType.API)
                .eq(UserToken::getCreatedBy, userId));
    }

    private void deleteExpireTokenAsync(Long userId) {
        CompletableFuture.runAsync(() -> userTokenDAO.remove(new LambdaQueryWrapper<UserToken>()
                .eq(UserToken::getCreatedBy, userId)
                .isNotNull(UserToken::getExpireAt)
                .lt(UserToken::getExpireAt, OffsetDateTime.now())
        )).exceptionally(ex -> {
            log.error("delete user's token fail. user id is {}. Exception: {}", userId, ex);
            return null;
        });
    }

}
