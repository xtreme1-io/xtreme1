package ai.basic.x1.util;

import ai.basic.x1.usecase.exception.UsecaseException;
import cn.hutool.core.io.FileUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.compress.archivers.tar.TarArchiveEntry;
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream;
import org.apache.commons.compress.archivers.zip.ZipFile;
import org.apache.commons.compress.compressors.bzip2.BZip2CompressorInputStream;
import org.apache.commons.compress.compressors.gzip.GzipCompressorInputStream;
import org.apache.commons.compress.utils.IOUtils;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

import static ai.basic.x1.util.Constants.*;
import static cn.hutool.core.util.CharsetUtil.GBK;

/**
 * @author : fyb
 * @date : 2022/2/9 11:45
 */
@Slf4j
public class DecompressionFileUtils {

    /**
     * 对zip文件进行解压。
     *
     * @param filePath  需要解压的zip文件的完成路径。
     * @param unZipPath 解压过后生成文件的存放路径
     */
    public static void zipDecompress(String filePath, String unZipPath) throws IOException {
        var zfile = FileUtil.file(filePath);
        ZipFile zipFile;
        try {
            zipFile = new ZipFile(zfile, GBK, true);
        } catch (IOException e) {
            zipFile = new ZipFile(zfile);
        }
        for (var enumeration = zipFile.getEntries(); enumeration.hasMoreElements(); ) {
            var zae = enumeration.nextElement();
            var dir = unZipPath + File.separator + zae.getName();
            if (dir.contains(MACOSX)) {
                continue;
            }
            log.info("Decompressing......{}", dir);
            var file = new File(dir);
            if (zae.isDirectory()) {
                file.mkdir();
                continue;
            }
            FileUtil.mkParentDirs(file);
            //写文件
            try (var zis = zipFile.getInputStream(zae);
                 var fos = new FileOutputStream(file);
                 var bos = new BufferedOutputStream(fos)) {
                IOUtils.copy(zis, bos);
            } catch (IOException e) {
                log.error(e.getMessage());
            }
        }
        zfile.delete();
    }

    /**
     * 解压TAR类文件，包括.TAR .TAR.BZ2 .TAR.GZ
     *
     * @param inputStream 每种TAR文件用不同的输入流，unCompress方法中已注明
     * @param unTarPath   TAR文件解压后的存放路径
     */
    public static void tarDecompress(InputStream inputStream, String unTarPath) {
        try (var tis = new TarArchiveInputStream(inputStream)) {
            TarArchiveEntry nte;
            while ((nte = tis.getNextTarEntry()) != null) {
                var dir = unTarPath + File.separator + nte.getName();
                if (dir.contains(MACOSX)) {
                    continue;
                }
                var file = new File(dir);
                log.info("Decompressing......{}", dir);
                if (nte.isDirectory()) {
                    file.mkdirs();
                } else {
                    FileUtil.mkParentDirs(file);
                    try (var fos = new FileOutputStream(file);
                         var bos = new BufferedOutputStream(fos)) {
                        IOUtils.copy(tis, bos);
                    } catch (IOException e) {
                        log.error(e.getMessage());
                    }
                }
            }
        } catch (IOException e) {
            log.error(e.getMessage());
        }
    }

    public static void decompress(String filePath, String decompressPath) throws IOException {
        String fileType = filePath.toUpperCase();
        if (fileType.endsWith(TAR)) {
            //解压的.TAR包 .TAR包用一般的FileInputStream流读取
            tarDecompress(new FileInputStream(filePath), decompressPath);
        } else if (fileType.endsWith(TAR_GZ)) {
            //解压的.TAR.GZ包 .TAR.GZ包要用GzipCompressorInputStream读取
            tarDecompress(new GzipCompressorInputStream(new FileInputStream(filePath)), decompressPath);
        } else if (fileType.endsWith(TAR_BZ2)) {
            //解压的.TAR.BZ2包
            tarDecompress(new BZip2CompressorInputStream(new FileInputStream(filePath)), decompressPath);
        } else if (fileType.endsWith(ZIP)) {
            //解压的.ZIP包
            zipDecompress(filePath, decompressPath);
        } else {
            throw new UsecaseException("The decompression of files in this format is not currently supported");
        }
    }

    /**
     * Verify that the url address can be connected
     *
     * @param urlStr url
     * @return boolean
     */
    public static boolean validateUrl(String urlStr) {
        try {
            var url = new URL(urlStr);
            var oc = (HttpURLConnection) url.openConnection();
            oc.setUseCaches(false);
            // 设置超时时间
            oc.setConnectTimeout(1000);
            if (200 == oc.getResponseCode()) {
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Remove url parameter
     *
     * @param fileUrl File url
     * @return File url
     */
    public static String removeUrlParameter(String fileUrl) {
        if (fileUrl.contains("?")) {
            fileUrl = fileUrl.substring(0, fileUrl.indexOf("?"));
        }
        return fileUrl;
    }

}
