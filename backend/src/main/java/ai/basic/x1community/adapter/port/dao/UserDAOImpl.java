package ai.basic.x1community.adapter.port.dao;

import ai.basic.x1community.adapter.port.dao.mybatis.mapper.UserMapper;
import ai.basic.x1community.adapter.port.dao.mybatis.model.User;
import ai.basic.x1community.usecase.port.dao.UserDAO;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Component;

/**
 * @author Jagger Wang
 */
@Component
public class UserDAOImpl extends ServiceImpl<UserMapper, User> implements UserDAO {
}
