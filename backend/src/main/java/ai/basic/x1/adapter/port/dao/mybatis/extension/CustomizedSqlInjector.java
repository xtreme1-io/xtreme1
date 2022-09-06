package ai.basic.x1.adapter.port.dao.mybatis.extension;

import com.baomidou.mybatisplus.core.injector.AbstractMethod;
import com.baomidou.mybatisplus.core.injector.DefaultSqlInjector;
import com.baomidou.mybatisplus.core.metadata.TableInfo;
import com.baomidou.mybatisplus.extension.injector.methods.LogicDeleteBatchByIds;

import java.util.List;

/**
 * @author andy
 */
public class CustomizedSqlInjector extends DefaultSqlInjector {
    @Override
    public List<AbstractMethod> getMethodList(Class<?> mapperClass, TableInfo tableInfo) {
        List<AbstractMethod> methodList = super.getMethodList(mapperClass, tableInfo);
        methodList.add(new InsertBatchMethod("insertBatch"));
        methodList.add(new MysqlInsertOrUpdateBatch("mysqlInsertOrUpdateBatch"));
        methodList.add(new LogicDeleteBatchByIds("logicDeleteBatchByIdsWithFill"));
        methodList.add(new InsertIgnoreMethod("insertIgnore"));
        methodList.add(new InsertIgnoreBatchMethod("insertIgnoreBatch"));
        methodList.add(new ReplaceMethod("replace"));
        return methodList;
    }

}
