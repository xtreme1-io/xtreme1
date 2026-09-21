package ai.basic.x1.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Only cases that resolve without DNS: IP literals, and hosts that are rejected before any
 * lookup happens. {@code resolve} is not covered here because it makes a request.
 */
class UploadUrlValidatorTest {

    private static final String STORAGE = "http://minio:9000/";

    private static boolean allowed(String url) {
        return UploadUrlValidator.isAllowed(url, "", STORAGE, false);
    }

    @Test
    void rejectsSchemesOtherThanHttp() {
        assertFalse(allowed("file:///etc/passwd"));
        assertFalse(allowed("gopher://127.0.0.1:6379/_FLUSHALL"));
        assertFalse(allowed("ftp://example.com/dataset.zip"));
        assertFalse(allowed("not a url at all"));
    }

    @Test
    void rejectsTheNetworkTheBackendSitsIn() {
        assertFalse(allowed("http://127.0.0.1:8080/actuator/env"));
        assertFalse(allowed("http://169.254.169.254/latest/meta-data/"));
        assertFalse(allowed("http://10.0.0.5/dataset.zip"));
        assertFalse(allowed("http://192.168.1.10/dataset.zip"));
        assertFalse(allowed("http://172.16.0.1/dataset.zip"));
        assertFalse(allowed("http://100.64.0.1/dataset.zip"));
        assertFalse(allowed("http://[::1]/dataset.zip"));
        assertFalse(allowed("http://[fd00::1]/dataset.zip"));
        assertFalse(allowed("http://0.0.0.0/dataset.zip"));
    }

    @Test
    void allowsAPublicHost() {
        assertTrue(allowed("https://8.8.8.8/dataset.zip"));
    }

    @Test
    void allowsTheProductsOwnObjectStore() {
        // Every browser upload comes back as a presigned URL on this endpoint, which is on the
        // private network the rule above rejects.
        assertTrue(allowed("http://minio:9000/xtreme1/1/2/abc/dataset.zip?X-Amz-Signature=x"));
        assertFalse(allowed("http://minio:9001/xtreme1/dataset.zip"));
    }

    @Test
    void whitelistMatchesHostsNotSubstrings() {
        // allowPrivateNetwork short-circuits after the whitelist check, so this exercises the
        // host matching on its own -- no name has to resolve for the assertions to mean what
        // they say.
        var list = "example.com";
        assertTrue(UploadUrlValidator.isAllowed("https://example.com/d.zip", list, STORAGE, true));
        assertTrue(UploadUrlValidator.isAllowed("https://files.example.com/d.zip", list, STORAGE, true));
        // the substring match this replaces let both of these through
        assertFalse(UploadUrlValidator.isAllowed("https://8.8.8.8/?x=example.com", list, STORAGE, true));
        assertFalse(UploadUrlValidator.isAllowed("https://notexample.com/d.zip", list, STORAGE, true));
    }

    @Test
    void rejectsAHostThatDoesNotResolve() {
        assertFalse(allowed("https://no-such-host.invalid/d.zip"));
    }

    @Test
    void privateNetworkCanBeOptedBackIn() {
        assertTrue(UploadUrlValidator.isAllowed("http://192.168.1.10/d.zip", "", STORAGE, true));
        // the scheme rule is not negotiable
        assertFalse(UploadUrlValidator.isAllowed("file:///etc/passwd", "", STORAGE, true));
    }
}
