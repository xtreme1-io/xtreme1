package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.entity.BaseQueryBO;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.Page;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.date.DatePattern;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.json.JSONConfig;
import cn.hutool.json.JSONUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.function.Function;

public abstract class BaseExportController<T, Q extends BaseQueryBO> {

    private Logger logger = LoggerFactory.getLogger(getClass());

    /**
     * export json file
     *
     * @param response
     * @param filename file name
     * @param query    query condition
     * @param fun      query data that need export
     */
    public void syncExportJson(HttpServletResponse response, String filename, Q query, Function<Q, Page<T>> fun) {
        response.setContentType("application/json;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        try (var os = response.getOutputStream()) {
            var contentDisposition = "attachment;filename=" + URLEncoder.encode(filename + ".json", "UTF-8")
                    + ";filename*=UTF-8''" + URLEncoder.encode(filename + ".json", "UTF-8");
            response.setHeader("Content-Disposition", contentDisposition);
            // write file header utf-8
            os.write(new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF});
            os.flush();
            int i = 1;
            while (true) {
                query.setPageNo(i);
                var page = fun.apply(query);
                i++;
                if (ObjectUtil.isNull(page) || CollectionUtil.isEmpty(page.getList())) {
                    break;
                }
                var jsonConfig = JSONConfig.create().setDateFormat(DatePattern.NORM_DATETIME_PATTERN);
                var str = JSONUtil.toJsonStr(page.getList(), jsonConfig);
                os.write(str.substring(1, str.length() - 1).getBytes());
                os.flush();
            }
        } catch (UnsupportedEncodingException e) {
            logger.error("export data error", e);
            throw new UsecaseException("export data error,message:" + e.getMessage() + "");
        } catch (IOException e) {
            logger.error("export data error", e);
            throw new UsecaseException("export data error,message:" + e.getMessage() + "");
        }
    }

}
