package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.api.annotation.user.LoggedUser;
import ai.basic.x1.adapter.api.filter.JwtPayload;
import ai.basic.x1.adapter.dto.LoggedUserDTO;
import ai.basic.x1.adapter.dto.UserDTO;
import ai.basic.x1.adapter.dto.request.UserLoginRequestDTO;
import ai.basic.x1.adapter.dto.response.UserLoginResponseDTO;
import ai.basic.x1.usecase.UserUseCase;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * @author Jagger Wang
 */
@RestController
@RequestMapping("/user")
public class UserController extends BaseController {

    @Autowired
    private UserUseCase userUseCase;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public UserDTO create(@RequestBody UserDTO userDTO) {
        userUseCase.create(userDTO.toBO());

        var user = userUseCase.findByUsername(userDTO.getUsername());
        return UserDTO.fromBO(user);
    }

    @PostMapping("/login")
    public UserLoginResponseDTO login(@RequestBody UserLoginRequestDTO requestDTO) {
        var user = userUseCase.findByUsername(requestDTO.getUsername());
        if (user == null ||
                !passwordEncoder.matches(requestDTO.getPassword(), user.getPassword())) {
            throw new UsecaseException(UsecaseCode.USERNAME_AND_PASSWORD_NOT_MATCH);
        }

        return UserLoginResponseDTO.builder()
                .token(jwtHelper.generateToken(JwtPayload.builder()
                        .userId(user.getId())
                        .build()))
                .user(UserDTO.fromBO(user))
                .build();
    }

    @GetMapping("/logged")
    public LoggedUserDTO logged(@LoggedUser LoggedUserDTO loggedUserDTO) {
        return loggedUserDTO;
    }

    @GetMapping("/info/{id}")
    public UserDTO info(@PathVariable Long id) {
        var user = userUseCase.findById(id);
        return UserDTO.fromBO(user);
    }

}
