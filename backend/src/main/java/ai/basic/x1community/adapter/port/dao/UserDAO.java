package ai.basic.x1community.adapter.port.dao;

import ai.basic.x1community.adapter.port.dao.mybatis.mapper.UserMapper;
import ai.basic.x1community.adapter.port.dao.mybatis.model.User;
import org.springframework.stereotype.Component;

/**
 * @author Jagger Wang
 */
@Component
public class UserDAO extends AbstractDAO<UserMapper, User> {
}
