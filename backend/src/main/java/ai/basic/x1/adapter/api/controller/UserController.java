package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.api.annotation.user.LoggedUser;
import ai.basic.x1.adapter.api.filter.JwtPayload;
import ai.basic.x1.adapter.dto.LoggedUserDTO;
import ai.basic.x1.adapter.dto.UserDTO;
import ai.basic.x1.adapter.dto.request.UserAuthRequestDTO;
import ai.basic.x1.adapter.dto.request.UserUpdateRequestDTO;
import ai.basic.x1.adapter.dto.response.UserLoggedResponseDTO;
import ai.basic.x1.adapter.dto.response.UserLoginResponseDTO;
import ai.basic.x1.entity.UserBO;
import ai.basic.x1.usecase.UserUseCase;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author Jagger Wang、Zhujh
 */
@RestController
@RequestMapping("/user")
@Validated
public class UserController extends BaseController {

    @Autowired
    private UserUseCase userUseCase;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public UserDTO create(@Validated @RequestBody UserAuthRequestDTO authDto) {
        return UserDTO.fromBO(userUseCase.create(authDto.getUsername(), authDto.getPassword()
                , authDto.getIsSubscribeNewsLetter()));
    }

    @PostMapping("/login")
    public UserLoginResponseDTO login(@Validated @RequestBody UserAuthRequestDTO requestDTO) {
        var user = userUseCase.findByUsername(requestDTO.getUsername());
        if (user == null ||
                !passwordEncoder.matches(requestDTO.getPassword(), user.getPassword())) {
            throw new UsecaseException(UsecaseCode.USERNAME_AND_PASSWORD_NOT_MATCH);
        }
        userUseCase.loginSuccessProcess(user);

        return UserLoginResponseDTO.builder()
                .token(jwtHelper.generateToken(JwtPayload.builder()
                        .userId(user.getId())
                        .build()))
                .user(UserDTO.fromBO(user))
                .build();
    }

    @PostMapping("/delete/{userId}")
    public UserDTO delete(@PathVariable Long userId) {
        return UserDTO.fromBO(userUseCase.deleteById(userId));
    }

    @PostMapping("/update")
    public UserDTO update(@Validated @RequestBody UserUpdateRequestDTO updateRequestDTO,
                          @LoggedUser LoggedUserDTO loggedUser) {
        var user = DefaultConverter.convert(updateRequestDTO, UserBO.class);
        return UserDTO.fromBO(userUseCase.update(user));
    }

    @GetMapping("/list")
    public Page<UserDTO> list(@RequestParam(required = false) String nickname,
                              @RequestParam(defaultValue = "1") Integer pageNo,
                              @RequestParam(defaultValue = "10") Integer pageSize) {
        return DefaultConverter.convert(userUseCase.findByPage(nickname, pageNo, pageSize),
                UserDTO.class);
    }

    @GetMapping("/logged")
    public UserLoggedResponseDTO logged() {
        if (loggedUser() == null) {
            return null;
        }

        return UserLoggedResponseDTO.builder()
                .user(UserDTO.fromBO(loggedUser().getUser()))
                .build();
    }

    @GetMapping("/info/{id}")
    public UserDTO info(@PathVariable Long id) {
        var user = userUseCase.findById(id);
        return UserDTO.fromBO(user);
    }

}
