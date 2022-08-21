package ai.basic.x1community.adapter.api.filter;

import ai.basic.x1community.entity.UserBO;
import org.springframework.security.core.userdetails.User;

import java.util.List;


/**
 * @author Jagger Wang
 */
public class LoggedUser extends User {

    private UserBO user;

    public LoggedUser(UserBO user) {
        super(user.getUsername(), user.getPassword(), List.of());

        this.user = user;
    }

    public UserBO getUser() {
        return user;
    }

}
