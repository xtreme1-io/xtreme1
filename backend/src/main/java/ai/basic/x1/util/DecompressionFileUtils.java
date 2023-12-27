package ai.basic.x1.util;

import ai.basic.x1.usecase.exception.UsecaseException;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.URLUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.compress.archivers.tar.TarArchiveEntry;
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream;
import org.apache.commons.compress.archivers.zip.ZipFile;
import org.apache.commons.compress.compressors.bzip2.BZip2CompressorInputStream;
import org.apache.commons.compress.compressors.gzip.GzipCompressorInputStream;
import org.apache.commons.compress.utils.IOUtils;
import org.springframework.http.HttpStatus;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

import static ai.basic.x1.entity.enums.UploadStatusEnum.FAILED;
import static ai.basic.x1.usecase.exception.UsecaseCode.DATASET_DATA_FILE_URL_ERROR;
import static ai.basic.x1.util.Constants.*;
import static cn.hutool.core.util.CharsetUtil.GBK;
import static cn.hutool.core.util.CharsetUtil.UTF_8;

/**
 * @author : fyb
 * @date : 2022/2/9 11:45
 */
@Slf4j
public class DecompressionFileUtils {

    /**
     * Unzip the zip file
     *
     * @param filePath  File path。
     * @param unZipPath The storage path of the generated files after decompression
     */
    public static void zipDecompress(String filePath, String unZipPath) throws IOException {
        var zfile = FileUtil.file(filePath);
        ZipFile zipFile;
        try {
            zipFile = new ZipFile(zfile, UTF_8, true);
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
            //write file
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
     * Extract TAR class files, including .TAR .TAR.BZ2 .TAR.GZ
     *
     * @param inputStream Each TAR file uses a different input stream, which is indicated in the unCompress method
     * @param unTarPath   The storage path of the decompressed TAR file
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
            // Decompressed .TAR package The .TAR package is read with a normal FileInputStream stream
            tarDecompress(new FileInputStream(filePath), decompressPath);
        } else if (fileType.endsWith(TAR_GZ)) {
            // Decompressed .TAR.GZ package .TAR.GZ package should be read with GzipCompressorInputStream
            tarDecompress(new GzipCompressorInputStream(new FileInputStream(filePath)), decompressPath);
        } else if (fileType.endsWith(TAR_BZ2)) {
            // Decompressed .TAR.BZ2 package
            tarDecompress(new BZip2CompressorInputStream(new FileInputStream(filePath)), decompressPath);
        } else if (fileType.endsWith(ZIP)) {
            // Decompressed .ZIP package
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
        var boo = validateUrlS(urlStr);
        if (!boo) {
            return validateUrlS(URLUtil.encode(urlStr));
        }
        return true;
    }

    private static boolean validateUrlS(String urlStr) {
        try {
            var url = new URL(urlStr);
            var oc = (HttpURLConnection) url.openConnection();
            oc.setUseCaches(false);
            oc.setConnectTimeout(1000);
            if (HttpStatus.OK.value() == oc.getResponseCode()) {
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("url error", e);
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
        if (fileUrl.contains(QUESTION_MARK)) {
            fileUrl = fileUrl.substring(0, fileUrl.indexOf(QUESTION_MARK));
        }
        return fileUrl;
    }

}
