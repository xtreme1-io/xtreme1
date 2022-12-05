package ai.basic.x1.adapter.port.dao;

import ai.basic.x1.adapter.port.dao.mybatis.mapper.UserTokenMapper;
import ai.basic.x1.adapter.port.dao.mybatis.model.UserToken;
import org.springframework.stereotype.Component;

/**
 * @author zhujh
 */
@Component
public class UserTokenDAO extends AbstractDAO<UserTokenMapper, UserToken> {
}
