package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.api.annotation.user.LoggedUser;
import ai.basic.x1.adapter.api.filter.JwtPayload;
import ai.basic.x1.adapter.dto.LoggedUserDTO;
import ai.basic.x1.adapter.dto.UserDTO;
import ai.basic.x1.adapter.dto.request.UserAuthRequestDTO;
import ai.basic.x1.adapter.dto.request.UserDeleteRequestDTO;
import ai.basic.x1.adapter.dto.request.UserUpdateRequestDTO;
import ai.basic.x1.adapter.dto.response.UserLoginResponseDTO;
import ai.basic.x1.entity.DataInfoBO;
import ai.basic.x1.entity.ModelMessageBO;
import ai.basic.x1.entity.UserBO;
import ai.basic.x1.entity.enums.ModelCodeEnum;
import ai.basic.x1.usecase.ModelUseCase;
import ai.basic.x1.usecase.UserUseCase;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.stream.ObjectRecord;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.connection.stream.StreamRecords;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    private ModelUseCase modelUseCase;

    @PostMapping("/register")
    public UserLoginResponseDTO register(@Validated @RequestBody UserAuthRequestDTO authDto) {
        var user =  UserDTO.fromBO(userUseCase.create(authDto.getUsername(),
                authDto.getPassword()));
        return UserLoginResponseDTO.builder()
                .token(jwtHelper.generateToken(JwtPayload.builder()
                        .userId(user.getId())
                        .build()))
                .user(user)
                .build();
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

    @GetMapping("/test")
    public void test() {
        ModelMessageBO modelMessageBO = ModelMessageBO.builder()
                .modelCode(ModelCodeEnum.PRE_LABEL)
                .datasetId(1l)
                .dataId(1l)
                .dataInfo(DataInfoBO.builder().build())
                .build();
        modelUseCase.sendModelMessageToMQ(modelMessageBO);
    }

}
