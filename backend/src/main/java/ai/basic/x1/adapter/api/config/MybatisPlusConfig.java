package ai.basic.x1.adapter.api.config;

import ai.basic.x1.adapter.port.dao.mybatis.extension.CustomizedSqlInjector;
import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.core.injector.ISqlInjector;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @author Jagger Wang
 */
@Configuration
@MapperScan("ai.basic.x1.adapter.port.dao.mybatis.mapper")
public class MybatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }

    @Bean
    public ISqlInjector iSqlInjector() {
        return new CustomizedSqlInjector();
    }

    @Bean
    public CustomerMetaObjectHandler customerMetaObjectHandler() {
        return new CustomerMetaObjectHandler();
    }
}