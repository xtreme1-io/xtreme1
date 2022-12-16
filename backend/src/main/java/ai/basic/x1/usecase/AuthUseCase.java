package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.UserDAO;
import ai.basic.x1.entity.UserBO;
import ai.basic.x1.util.DefaultConverter;
import org.springframework.beans.factory.annotation.Autowired;

public class AuthUseCase {

    @Autowired
    private UserDAO userDAO;

    public UserBO findById(Long userId) {
        return DefaultConverter.convert(userDAO.getById(userId), UserBO.class);
    }

}
