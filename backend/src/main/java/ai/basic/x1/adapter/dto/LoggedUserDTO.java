package ai.basic.x1.adapter.dto;

import org.springframework.security.core.userdetails.User;
import java.util.List;


/**
 * @author Jagger Wang
 */

public class LoggedUserDTO extends User {

    private Long id;

    public LoggedUserDTO(String username, String password, Long id) {
        super(username, password, List.of());
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
