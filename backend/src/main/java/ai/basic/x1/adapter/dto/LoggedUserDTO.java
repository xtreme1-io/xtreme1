package ai.basic.x1.adapter.dto;

import ai.basic.x1.entity.UserBO;
import org.springframework.security.core.userdetails.User;

import java.util.List;


/**
 * @author Jagger Wang
 */
public class LoggedUserDTO extends User {

    private UserBO user;

    public LoggedUserDTO(UserBO user) {
        super(user.getUsername(), user.getPassword(), List.of());

        this.user = user;
    }

    public UserBO getUser() {
        return user;
    }

}
