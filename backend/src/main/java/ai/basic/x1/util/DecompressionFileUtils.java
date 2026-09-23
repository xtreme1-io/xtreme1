package ai.basic.x1.util;

import ai.basic.x1.usecase.exception.UsecaseException;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
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

    // One second was too short for a TLS handshake to a bucket on another continent (#316).
    // upload() is @Transactional, so whatever is spent here is spent holding a pooled database
    // connection: measured at 5.1s for an address that blackholes, against 1s before. There is
    // one probe per upload, not two -- see describeUrlProblem for why the second one went.
    private static final int CONNECT_TIMEOUT_MS = 5000;
    private static final int READ_TIMEOUT_MS = 5000;

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
     * Why this URL cannot be fetched, or null if it can. The text ends up in the upload
     * record, because "File url error" on its own tells the user nothing they can act on.
     *
     * <p>The previous version retried with {@code URLUtil.encode(url)} when the first probe
     * failed. That form is fetched by nothing: the download uses {@code URLUtil.decode}. And
     * encode() escapes the '?' as well, so for any url carrying a query string — every
     * presigned url — the retry asked about {@code /x%3Fk=a%252Fb} rather than {@code /x?k=a%2Fb},
     * and reported that url's diagnosis as if it were this one's. It could only turn a real
     * answer into a misleading one, or pass a url the download would then fail on, at the cost
     * of a second timeout inside the caller's transaction.
     */
    public static String describeUrlProblem(String urlStr) {
        try {
            var url = new URL(urlStr);
            var oc = (HttpURLConnection) url.openConnection();
            oc.setUseCaches(false);
            oc.setConnectTimeout(CONNECT_TIMEOUT_MS);
            oc.setReadTimeout(READ_TIMEOUT_MS);
            // Do not follow redirects: UploadUrlValidator checks every hop of the chain, and
            // following one here would reach a host nothing has checked. A redirect still counts
            // as reachable, which is what this method is asked.
            oc.setInstanceFollowRedirects(false);
            try {
                var status = oc.getResponseCode();
                if (status < HttpStatus.BAD_REQUEST.value()) {
                    return null;
                }
                return "the server answered HTTP " + status;
            } finally {
                oc.disconnect();
            }
        } catch (Exception e) {
            log.warn("Upload url not reachable: {} ({})", urlStr, e.toString());
            var message = e.getMessage();
            return e.getClass().getSimpleName() + (StrUtil.isEmpty(message) ? "" : ": " + message);
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
