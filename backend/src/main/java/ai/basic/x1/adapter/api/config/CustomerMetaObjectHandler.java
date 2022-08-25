package ai.basic.x1.adapter.api.config;


import ai.basic.x1.adapter.api.context.RequestContextHolder;
import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import org.apache.ibatis.reflection.MetaObject;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * @author Jagger Wang
 */
public class CustomerMetaObjectHandler implements MetaObjectHandler {
    private static final String CREATED_AT = "createdAt";
    private static final String UPDATED_AT = "updatedAt";
    private static final String CREATED_BY = "createdBy";
    private static final String UPDATED_BY = "updatedBy";

    @Override
    public void insertFill(MetaObject metaObject) {
        Set<String> fieldNames = new HashSet<>(Arrays.asList(metaObject.getGetterNames()));
        this.strictInsertFill(metaObject, CREATED_AT, OffsetDateTime.class, OffsetDateTime.now());
        if (fieldNames.contains(CREATED_BY)) {
            Long createdBy = 0L;
            if (metaObject.getValue(CREATED_BY) != null) {
                createdBy = (Long) metaObject.getValue(CREATED_BY);
            } else {
                createdBy = RequestContextHolder.getContext().getUserInfo().getId();
            }
            this.strictInsertFill(metaObject, CREATED_BY, Long.class, createdBy);
        }
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        Set<String> fieldNames = new HashSet<>(Arrays.asList(metaObject.getGetterNames()));
        this.strictUpdateFill(metaObject, UPDATED_AT, OffsetDateTime.class, OffsetDateTime.now());
        if (fieldNames.contains(UPDATED_BY)) {
            Long updateBy = 0L;
            if (metaObject.getValue(UPDATED_BY) != null) {
                updateBy = (Long) metaObject.getValue(UPDATED_BY);
            } else {
                updateBy = RequestContextHolder.getContext().getUserInfo().getId();
            }
            this.strictUpdateFill(metaObject, UPDATED_BY, Long.class, updateBy);
        }
    }
}
