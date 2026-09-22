package ai.basic.x1.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Only cases that resolve without DNS: IP literals, and hosts that are rejected before any
 * lookup happens.
 *
 * <p>The "host does not resolve, so refuse it" branch is deliberately not covered. Whether a
 * name fails to resolve is a property of the machine running the test, not of this class: on a
 * developer machine behind a fake-IP proxy every name resolves, including {@code .invalid}
 * ones, so an assertion about it passes in CI and fails locally. That is a test of the
 * resolver, and it would only ever be flaky here.
 *
 * <p>{@link UploadUrlValidator#resolve} is covered in {@link UploadUrlValidatorRedirectTest},
 * which stands up a server rather than relying on the network.
 */
class UploadUrlValidatorTest {

    private static final String STORAGE = "http://minio:9000/xtreme1/";

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
        // Objects, not the origin. MinIO's admin API answers on the same host and port, and a
        // whole-origin exemption would hand it over -- including past a configured whitelist.
        assertFalse(allowed("http://minio:9000/minio/admin/v3/list-buckets"));
        assertFalse(allowed("http://minio:9000/some-other-bucket/d.zip"));
        assertFalse(UploadUrlValidator.isAllowed("http://minio:9000/minio/admin/v3/list-buckets",
                "example.com", STORAGE, false));
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
    void aWhitelistedHostIsAllowedEvenOnTheLocalNetwork() {
        // The setting exists so an installation can import from its own file server. Running a
        // whitelisted host through the address rule afterwards would reject exactly those.
        assertTrue(UploadUrlValidator.isAllowed("http://192.168.1.10/d.zip", "192.168.1.10", STORAGE, false));
        assertFalse(UploadUrlValidator.isAllowed("http://192.168.1.11/d.zip", "192.168.1.10", STORAGE, false));
    }

    @Test
    void whitelistEntriesSurviveTheOldSubstringFormat() {
        // This setting used to mean "the URL contains this string", so entries in the wild carry
        // a scheme, a port or a path. Reduced to the host rather than silently matching nothing.
        for (var entry : new String[]{"https://files.acme.com/datasets", "files.acme.com:8443",
                                      ".files.acme.com", "FILES.ACME.COM"}) {
            assertTrue(UploadUrlValidator.isAllowed("https://files.acme.com/d.zip", entry, STORAGE, true),
                    "entry should have been read as a host: " + entry);
        }
    }

    @Test
    void privateNetworkCanBeOptedBackIn() {
        assertTrue(UploadUrlValidator.isAllowed("http://192.168.1.10/d.zip", "", STORAGE, true));
        // the scheme rule is not negotiable
        assertFalse(UploadUrlValidator.isAllowed("file:///etc/passwd", "", STORAGE, true));
    }
}
