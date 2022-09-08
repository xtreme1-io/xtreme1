package ai.basic.x1.adapter.port.dao.mybatis.extension;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.springframework.core.ResolvableType;
import org.springframework.util.Assert;

import java.io.IOException;
import java.lang.reflect.Type;
import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * @author andy
 */
public class BaseAttributeTypeHandler<T> extends BaseTypeHandler<Object> {

    private JavaType javaType;

    /**
     * ObjectMapper
     */
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public BaseAttributeTypeHandler() {
        ResolvableType resolvableType = ResolvableType.forClass(getClass());
        Type type = resolvableType.as(BaseAttributeTypeHandler.class).getGeneric().getType();
        javaType = constructType(type);
    }

    public static JavaType constructType(Type type) {
        Assert.notNull(type, "[Assertion failed] - type is required; it must not be null");
        return TypeFactory.defaultInstance().constructType(type);
    }

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, Object parameter, JdbcType jdbcType)
            throws SQLException {
        ps.setString(i, JSONUtil.toJsonStr(parameter));
    }

    @Override
    public Object getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return convertToEntityAttribute(value);
    }


    @Override
    public Object getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return convertToEntityAttribute(rs.getString(columnIndex));
    }


    @Override
    public Object getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return convertToEntityAttribute(value);
    }


    public Object convertToEntityAttribute(String dbData) {
        if (StrUtil.isEmpty(dbData)) {
            if (List.class.isAssignableFrom(javaType.getRawClass())) {
                return Collections.emptyList();
            } else if (Set.class.isAssignableFrom(javaType.getRawClass())) {
                return Collections.emptySet();
            } else if (Map.class.isAssignableFrom(javaType.getRawClass())) {
                return Collections.emptyMap();
            } else {
                return null;
            }
        }
        return toObject(dbData, javaType);
    }


    public static <T> T toObject(String json, JavaType javaType) {
        Assert.hasText(json, "[Assertion failed] - this json must have text; it must not be null, empty, or blank");
        Assert.notNull(javaType, "[Assertion failed] - javaType is required; it must not be null");
        try {
            return OBJECT_MAPPER.readValue(json, javaType);
        } catch (com.fasterxml.jackson.core.JsonParseException e) {
            throw new RuntimeException(e.getMessage(), e);
        } catch (JsonMappingException e) {
            throw new RuntimeException(e.getMessage(), e);
        } catch (IOException e) {
            throw new RuntimeException(e.getMessage(), e);
        }
    }
}
