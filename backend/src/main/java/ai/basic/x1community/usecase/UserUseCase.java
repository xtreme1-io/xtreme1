package ai.basic.x1community.usecase;

import ai.basic.x1community.adapter.port.dao.UserDAOImpl;
import ai.basic.x1community.adapter.port.dao.mybatis.model.User;
import ai.basic.x1community.entity.UserBO;
import ai.basic.x1community.usecase.exception.UsecaseCode;
import ai.basic.x1community.usecase.exception.UsecaseException;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * @author Jagger Wang
 */
public class UserUseCase {

    @Autowired
    private UserDAOImpl userDAOImpl;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void create(UserBO user) {
        var existUser = findByUsername(user.getUsername());
        if (existUser != null) {
            throw new UsecaseException(UsecaseCode.UNKNOWN, "User already existed");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userDAOImpl.save(User.fromBO(user));
    }

    public UserBO findById(Long id) {
        var user = userDAOImpl.getById(id);
        if (user == null) {
            return null;
        }

        return user.toBO();
    }

    public UserBO findByUsername(String username) {
        var user = userDAOImpl.getOne(new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        if (user == null) {
            return null;
        }

        return user.toBO();
    }

}
