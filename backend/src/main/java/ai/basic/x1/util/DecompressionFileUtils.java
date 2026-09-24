package ai.basic.x1.util;

import ai.basic.x1.usecase.exception.UsecaseException;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
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
import java.nio.charset.StandardCharsets;
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

    // upload() runs inside a transaction and probes twice, so this is paid up to four times
    // over before the caller hears anything. One second was too short for a TLS handshake to a
    // bucket on another continent (#316); five is several times that and keeps the worst case
    // near where it was.
    /** The printable ASCII characters a url may not carry literally (RFC 3986 "unwise" plus '"'). */
    private static final String NOT_ALLOWED_IN_A_URL = "\"<>\\^`{|}";

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
     */
    public static String describeUrlProblem(String urlStr) {
        var problem = probe(urlStr);
        if (problem == null) {
            return null;
        }
        // A url carrying a raw space or a non-ASCII name is rejected by the server as it
        // stands and accepted once those characters are escaped, and the download escapes
        // them too, so it is worth a second look. Not URLUtil.encode: that also escapes '?'
        // and '%', which turns a query string into part of the path and double-escapes an
        // already-encoded url -- for http://h/x?k=a%2Fb it asked about /x%3Fk=a%252Fb.
        var escaped = escapeIllegalCharacters(urlStr);
        if (escaped.equals(urlStr) || probe(escaped) != null) {
            // Report the url the caller gave us, not the one we tried on their behalf.
            return problem;
        }
        return null;
    }

    /**
     * Percent-escapes the characters that cannot appear literally in a url, and nothing else.
     * An already-escaped url comes back unchanged, so this never runs twice over the same
     * character and never rewrites a url that was already valid.
     */
    private static String escapeIllegalCharacters(String urlStr) {
        var out = new StringBuilder(urlStr.length());
        for (var b : urlStr.getBytes(StandardCharsets.UTF_8)) {
            var c = (char) (b & 0xff);
            if (c > 0x20 && c < 0x7f && NOT_ALLOWED_IN_A_URL.indexOf(c) < 0) {
                out.append(c);
            } else {
                out.append('%').append(String.format("%02X", b & 0xff));
            }
        }
        return out.toString();
    }

    private static String probe(String urlStr) {
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
