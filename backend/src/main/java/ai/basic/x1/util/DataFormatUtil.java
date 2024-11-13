package ai.basic.x1.util;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import lombok.extern.slf4j.Slf4j;

import java.io.BufferedReader;
import java.io.InputStreamReader;

@Slf4j
public class DataFormatUtil {

    public static void convert(String type, String srcPath, String outPath, String respPath) {
        try {
            FileUtil.mkParentDirs(respPath);
            ProcessBuilder builder = new ProcessBuilder();
            FileUtil.mkParentDirs(respPath);
            String command = String.format("script_ctl --mode '%s' --src '%s' --dst '%s' --rps '%s' --fmt=coco", type, srcPath, outPath, respPath);
            builder.command("sh", "-c", command);
            Process process = builder.start();
            BufferedReader in = new BufferedReader(new InputStreamReader(process.getErrorStream()));
            String line = null;
            StringBuilder stringBuilder = new StringBuilder();
            while ((line = in.readLine()) != null) {
                stringBuilder.append(line);
            }
            if (StrUtil.isNotEmpty(stringBuilder.toString())) {
                log.error("convert file error：{}", stringBuilder);
            }
            in.close();
            int exitCode = process.waitFor();
            assert exitCode == 0;
            FileUtil.del(srcPath);
        } catch (Exception e) {
            log.error("convert file error", e);
        }
     }
}
