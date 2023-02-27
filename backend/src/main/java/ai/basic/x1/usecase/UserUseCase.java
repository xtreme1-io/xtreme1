package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.UserDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.User;
import ai.basic.x1.adapter.port.minio.MinioProp;
import ai.basic.x1.adapter.port.minio.MinioService;
import ai.basic.x1.entity.FileBO;
import ai.basic.x1.entity.UserBO;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import static ai.basic.x1.util.Constants.IMAGE_DATA_TYPE;

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
    private FileUseCase fileUseCase;

    @Autowired
    private MinioService minioService;

    @Autowired
    private MinioProp minioProp;

    @Autowired
    private DataAnnotationRecordUseCase dataAnnotationRecordUseCase;

    public UserBO create(String username, String password) {
        var existUser = findByUsername(username);
        if (existUser != null) {
            throw new UsecaseException(UsecaseCode.USER_EXIST);
        }
        var newUser = User.builder().username(username)
                .nickname(StrUtil.subBefore(username, "@", false))
                .password(passwordEncoder.encode(password)).build();
        userDAO.save(newUser);
        return findByUsername(username);
    }

    @CacheEvict(cacheNames = "user", allEntries = true)
    public void deleteOtherUsers(Set<Long> ids, Long currentUserId) {
        if (CollUtil.isNotEmpty(ids)) {
            ids.remove(currentUserId);
            userDAO.removeByIds(ids);
            dataAnnotationRecordUseCase.unLockByUserIds(ids);
        }
    }

    @CacheEvict(cacheNames = "user", key = "#user.id", condition = "#user.id != null ")
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

    @Cacheable(cacheNames = "user", key = "#id", unless = "#result == null ")
    public UserBO findById(Long id) {
        var user = userDAO.getById(id);
        if (user == null) {
            return null;
        }

        return wrapUser(user.toBO());
    }

    public List<UserBO> findByIds(List<Long> userIds) {
        if (CollUtil.isEmpty(userIds)) {
            return List.of();
        }
        return wrapUsers(userDAO.listByIds(userIds).stream().map(User::toBO).collect(Collectors.toList()));
    }

    @CachePut(cacheNames = "user", key = "#result.id", condition = "#result != null ")
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

    public Long uploadAvatar(MultipartFile multipartFile, Long userId) {
        var mimeType = FileUtil.getMimeType(multipartFile.getOriginalFilename());
        var originalFilename = multipartFile.getOriginalFilename();
        var path = String.format("user/avatar/%s/%s-%s", userId, System.currentTimeMillis(),
                originalFilename);
        var bucketName = minioProp.getBucketName();
        var fileSize = multipartFile.getSize();
        if (mimeType == null || !IMAGE_DATA_TYPE.contains(mimeType)) {
            log.error("not support avatar type upload: " + mimeType);
            throw new UsecaseException(UsecaseCode.FILE_TYPE_NOT_SUPPORT, "Only support image type upload");
        }
        try(InputStream inputStream = multipartFile.getInputStream()) {
            log.info("start uploadAvatar. path: {}, contentType: {}", path, mimeType);
            minioService.uploadFile(bucketName, path, inputStream, mimeType, fileSize);

            var fileBO = FileBO.builder().bucketName(bucketName).name(originalFilename)
                    .originalName(originalFilename).path(path).type(mimeType).size(fileSize)
                    .build();
            return fileUseCase.saveBatchFile(userId, List.of(fileBO)).get(0).getId();
        } catch (Exception e) {
            log.error("uploadAvatar fail: " + e);
            throw new UsecaseException(UsecaseCode.UNKNOWN, "Upload fail.Please try again");
        }
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

        var avatarIdMap = new HashMap<Long, String>(avatarIds.size());
        try {
            fileUseCase.findByIds(avatarIds).forEach(file -> avatarIdMap.put(file.getId(), file.getUrl()));
        } catch (Exception e) {
            log.error("get user avatar url fail" + e);
        }
        users.forEach(user -> user.setAvatarUrl(avatarIdMap.get(user.getAvatarId())));
        return users;
    }

}
