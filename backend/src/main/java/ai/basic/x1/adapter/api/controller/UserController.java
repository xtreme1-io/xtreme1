package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.api.annotation.user.LoggedUser;
import ai.basic.x1.adapter.api.context.RequestContextHolder;
import ai.basic.x1.adapter.api.filter.JwtPayload;
import ai.basic.x1.adapter.dto.LoggedUserDTO;
import ai.basic.x1.adapter.dto.UserDTO;
import ai.basic.x1.adapter.dto.UserTokenDTO;
import ai.basic.x1.adapter.dto.request.CreateApiTokenRequestDTO;
import ai.basic.x1.adapter.dto.request.UserAuthRequestDTO;
import ai.basic.x1.adapter.dto.request.UserDeleteRequestDTO;
import ai.basic.x1.adapter.dto.request.UserUpdateRequestDTO;
import ai.basic.x1.adapter.dto.response.UserLoginResponseDTO;
import ai.basic.x1.entity.UserBO;
import ai.basic.x1.usecase.UserTokenUseCase;
import ai.basic.x1.usecase.UserUseCase;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.util.StrUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalTime;
import java.time.OffsetDateTime;

/**
 * @author Jagger Wang、Zhujh
 */
@RestController
@RequestMapping("/user")
@Validated
@Slf4j
public class UserController extends BaseController {

    @Autowired
    private UserUseCase userUseCase;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserTokenUseCase userTokenUseCase;

    @Value("${auth.register.enabled}")
    private Boolean enabledRegister;

    @PostMapping("/register")
    public UserLoginResponseDTO register(@Validated @RequestBody UserAuthRequestDTO authDto) {
        var user = UserDTO.fromBO(userUseCase.create(authDto.getUsername(),
                authDto.getPassword()));
        if (Boolean.FALSE.equals(enabledRegister)) {
            throw new UsecaseException(UsecaseCode.PARAM_ERROR, "Registration is temporarily closed");
        }
        return UserLoginResponseDTO.builder()
                .token(userTokenUseCase.generateGatewayToken(user.getId()).getToken())
                .user(user)
                .build();
    }

    @PostMapping("/login")
    public UserLoginResponseDTO login(@Validated @RequestBody UserAuthRequestDTO requestDTO) {
        var user = userUseCase.findByUsername(requestDTO.getUsername());
        if (user == null) {
            throw new UsecaseException(UsecaseCode.USER_NOT_REGISTER);
        }
        if (!passwordEncoder.matches(requestDTO.getPassword(), user.getPassword())) {
            throw new UsecaseException(UsecaseCode.USERNAME_AND_PASSWORD_NOT_MATCH);
        }
        userUseCase.loginSuccessProcess(user);

        var token = userTokenUseCase.generateGatewayToken(user.getId()).getToken();
        return UserLoginResponseDTO.builder()
                .token(token)
                .user(UserDTO.fromBO(user))
                .build();
    }

    @PostMapping("/delete")
    public void delete(@RequestBody UserDeleteRequestDTO deleteRequestDTO,
                       @LoggedUser LoggedUserDTO loggedUser) {
        userUseCase.deleteOtherUsers(deleteRequestDTO.getUserIds(), loggedUser.getId());
    }

    @PostMapping("/update")
    public UserDTO update(@Validated @RequestBody UserUpdateRequestDTO updateRequestDTO,
                          @LoggedUser LoggedUserDTO loggedUser) {
        var user = DefaultConverter.convert(updateRequestDTO, UserBO.class);
        user.setId(loggedUser.getId());
        if (StrUtil.isNotEmpty(updateRequestDTO.getNewPassword())) {
            user.setPassword(passwordEncoder.encode(updateRequestDTO.getNewPassword()));
        }
        return UserDTO.fromBO(userUseCase.update(user));
    }

    @PostMapping(value = "/uploadAvatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Long uploadAvatar(@RequestPart(value = "file") MultipartFile file,
                             @LoggedUser LoggedUserDTO loggedUser) {
        return userUseCase.uploadAvatar(file, loggedUser.getId());
    }

    @GetMapping("/list")
    public Page<UserDTO> list(@RequestParam(required = false) String nickname,
                              @RequestParam(defaultValue = "1") Integer pageNo,
                              @RequestParam(defaultValue = "10") Integer pageSize) {
        return DefaultConverter.convert(userUseCase.findByPage(nickname, pageNo, pageSize),
                UserDTO.class);
    }

    @GetMapping("/logged")
    public UserDTO logged(@LoggedUser LoggedUserDTO loggedUserDTO) {
        return UserDTO.fromBO(userUseCase.findById(loggedUserDTO.getId()));
    }

    @GetMapping("/logout")
    public void logout() {
    }

    @GetMapping("/info/{id}")
    public UserDTO info(@PathVariable Long id) {
        var user = userUseCase.findById(id);
        return UserDTO.fromBO(user);
    }

    @GetMapping("/api/token/info")
    public UserTokenDTO findApiToken() {
        var userId = RequestContextHolder.getContext().getUserInfo().getId();
        return DefaultConverter.convert(userTokenUseCase.getApiToken(userId), UserTokenDTO.class);
    }

    @PostMapping("/api/token/create")
    public UserTokenDTO createApiToken(@RequestBody CreateApiTokenRequestDTO createApiToken) {
        var userId = RequestContextHolder.getContext().getUserInfo().getId();
        OffsetDateTime expireAt = null;
        if (StringUtils.hasLength(createApiToken.getExpireAt())) {
            try {
                expireAt = OffsetDateTime.parse(createApiToken.getExpireAt());
                expireAt = OffsetDateTime.of(expireAt.toLocalDate(), LocalTime.MIDNIGHT,
                        expireAt.getOffset());
            } catch (Exception e) {
                throw new UsecaseException(UsecaseCode.UNKNOWN, "The date format is incorrect");
            }
        }
        var result = userTokenUseCase.generateApiToken(userId, expireAt);
        return DefaultConverter.convert(result, UserTokenDTO.class);
    }

    @PostMapping("/api/token/delete/{id}")
    public void deleteApiToken(@PathVariable("id") Long id) {
        var userId = RequestContextHolder.getContext().getUserInfo().getId();
        userTokenUseCase.deleteApiToken(id, userId);
    }

}
