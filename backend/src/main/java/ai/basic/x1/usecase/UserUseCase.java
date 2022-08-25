package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.FileDAO;
import ai.basic.x1.adapter.port.dao.UserDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.File;
import ai.basic.x1.adapter.port.dao.mybatis.model.User;
import ai.basic.x1.entity.UserBO;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HttpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * @author Jagger Wang、Zhujh
 */
@Slf4j
public class UserUseCase {

    private static final Integer DEFAULT_PAGE_SIZE = 10;

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private FileDAO fileDAO;

    public UserBO create(String username, String password, Boolean isSubscribeNewsLetter) {
        var existUser = findByUsername(username);
        if (existUser != null) {
            throw new UsecaseException(UsecaseCode.UNKNOWN, "User already existed");
        }
        var newUser = User.builder().username(username)
                .nickname(StrUtil.subBefore(username, "@", false))
                .password(passwordEncoder.encode(password)).build();
        userDAO.save(newUser);
        if (Boolean.TRUE.equals(isSubscribeNewsLetter)) {
            subscribeNewsLetterAsync(username);
        }
        return findByUsername(username);
    }

    public UserBO deleteById(Long id) {
        var user = findById(id);
        if (user == null) {
            throw new UsecaseException(UsecaseCode.UNKNOWN, "not found user");
        }
        userDAO.removeById(id);
        return user;
    }

    public UserBO update(UserBO user) {
        Assert.notNull(user, "user is null");
        Assert.notNull(user.getId(), "userId is null");
        userDAO.updateById(User.fromBO(user));
        return findById(user.getId());
    }

    public ai.basic.x1.util.Page<UserBO> findByPage(String nickname, Integer pageNo,
                                                 Integer pageSize) {
        pageNo = pageNo == null || pageNo < 1 ? 1 : pageNo;
        pageSize = pageSize == null || pageSize < DEFAULT_PAGE_SIZE ? DEFAULT_PAGE_SIZE : pageSize;

        var wrapper = new LambdaQueryWrapper<User>();
        if (StringUtils.hasLength(nickname)) {
            wrapper.like(User::getNickname, nickname);
        }
        wrapper.orderByDesc(User::getId);
        return DefaultConverter.convert(userDAO.page(new Page<>(pageNo, pageSize), wrapper),
                UserBO.class);
    }

    public UserBO findById(Long id) {
        var user = userDAO.getById(id);
        if (user == null) {
            return null;
        }

        return wrapUser(user.toBO());
    }

    public UserBO findByUsername(String username) {
        var user = userDAO.getOne(new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        if (user == null) {
            return null;
        }

        return wrapUser(user.toBO());
    }

    public void loginSuccessProcess(UserBO user) {
        Assert.notNull(user, "user is null");
        Assert.notNull(user.getId(), "userId is null");
        var updateUser = User.builder().id(user.getId()).lastLoginAt(OffsetDateTime.now()).build();
        userDAO.updateById(updateUser);
    }

    private UserBO wrapUser(UserBO user) {
        return wrapUsers(List.of(user)).get(0);
    }

    private List<UserBO> wrapUsers(List<UserBO> users) {
        var avatarIds = users.stream().map(UserBO::getAvatarId).filter(Objects::nonNull)
                .collect(Collectors.toList());
        if (avatarIds.isEmpty()) {
            return users;
        }
        var avatarIdMap = fileDAO.listByIds(avatarIds).stream()
                .collect(Collectors.toMap(File::getId, File::getPath));
        users.forEach(user -> user.setAvatarUrl(avatarIdMap.get(user.getAvatarId())));
        return users;
    }

    private void subscribeNewsLetterAsync(String email) {
        CompletableFuture.runAsync(() -> {
            log.info("submit email to basicAI");
            HttpUtil.post("", Map.of("email", email));
        });
    }

}
