package ai.basic.x1.util;

import cn.hutool.core.util.StrUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * Decides whether the backend is willing to fetch a URL a user handed it.
 *
 * <p>{@code /data/upload} exists to fetch a URL, so the check cannot be "make no outbound
 * requests". What it can refuse is the part that is not the feature: a scheme other than http(s),
 * and a host that resolves into the network the backend itself sits in — the metadata service, the
 * database, the object store's admin port, anything else on the compose network or the operator's
 * LAN. Redirects are checked at every hop, because a public URL answering 302 is otherwise a way
 * straight back in.
 *
 * <p>Two settings change it. {@code upload.url.whitelist}, when set, restricts uploads to the
 * hosts listed and nothing else — and a listed host is allowed even on this network, because
 * naming it is the operator vouching for it; the address rule does not run for a host that
 * matched. {@code upload.url.allowPrivateNetwork} turns the address rule off altogether, for an
 * installation that imports from a file server on its own LAN without wanting a whitelist.
 *
 * <p>What this does not stop: DNS rebinding. The name is resolved here and resolved again by the
 * download, so a host whose record has a short TTL can answer with a public address for the check
 * and a private one for the fetch. Closing that means pinning the address this class resolved and
 * connecting to it directly with an explicit Host header, which is a larger change than the one
 * this fix is. Anyone tightening this later should start there.
 *
 * <p>The unit tests here cover the decision; they do not cover what the download then does with
 * the answer, which is where the first version of this went wrong. {@code
 * .github/ci-verify/attack_ssrf.py} runs the attacks against a live stack. Run it by hand when
 * changing this class or the download in {@code UploadDataUseCase}.
 */
public final class UploadUrlValidator {

    private static final Logger log = LoggerFactory.getLogger(UploadUrlValidator.class);
    private static final int MAX_REDIRECTS = 5;
    private static final int PROBE_TIMEOUT_MS = 5000;

    private UploadUrlValidator() {
    }

    /**
     * Whether this exact URL may be fetched. Does not look at redirects; see
     * {@link #resolve(String, String, String, boolean)}.
     */
    public static boolean isAllowed(String rawUrl, String whitelist, String storageObjectPrefix,
                                    boolean allowPrivateNetwork) {
        URL url;
        try {
            url = new URL(rawUrl);
        } catch (MalformedURLException e) {
            log.warn("Upload url rejected, not a url: {}", rawUrl);
            return false;
        }
        var scheme = url.getProtocol().toLowerCase(Locale.ROOT);
        if (!"http".equals(scheme) && !"https".equals(scheme)) {
            log.warn("Upload url rejected, scheme is {}: {}", scheme, rawUrl);
            return false;
        }
        // The product's own object store is where every browser upload lands, and it sits on the
        // private compose network by design. Checked first because an operator setting a
        // whitelist cannot be expected to know they have to list their own MinIO. Objects only:
        // exempting the whole origin would also exempt MinIO's admin API, which shares the port.
        if (isStorageObject(url, storageObjectPrefix)) {
            return true;
        }
        var allowedHosts = hosts(whitelist);
        if (!allowedHosts.isEmpty()) {
            if (matchesHost(url.getHost(), allowedHosts)) {
                // Naming a host in the whitelist is the operator vouching for it, including a
                // file server on their own LAN. Running it through the address rule afterwards
                // would reject exactly the hosts the setting exists to allow.
                return true;
            }
            log.warn("Upload url rejected, host is not in upload.url.whitelist: {}", rawUrl);
            return false;
        }
        if (allowPrivateNetwork) {
            return true;
        }
        InetAddress[] addresses;
        try {
            addresses = InetAddress.getAllByName(url.getHost());
        } catch (UnknownHostException e) {
            log.warn("Upload url rejected, host does not resolve: {}", rawUrl);
            return false;
        }
        for (InetAddress address : addresses) {
            if (isInternal(address)) {
                log.warn("Upload url rejected, {} resolves to the internal address {}",
                        url.getHost(), address.getHostAddress());
                return false;
            }
        }
        return true;
    }

    /**
     * Walks the redirect chain, checking every hop, and returns the URL the download should
     * actually use. Returns null if any hop is not allowed, or the chain does not end.
     */
    public static String resolve(String rawUrl, String whitelist, String storageObjectPrefix,
                                 boolean allowPrivateNetwork) {
        var current = rawUrl;
        for (var hop = 0; hop <= MAX_REDIRECTS; hop++) {
            if (!isAllowed(current, whitelist, storageObjectPrefix, allowPrivateNetwork)) {
                return null;
            }
            String next;
            try {
                next = redirectTarget(current);
            } catch (IOException e) {
                // Refuse rather than hand back an unexamined URL. This branch has been observed
                // returning the redirect target of a hop whose own probe then failed, which is
                // the address the download would have used.
                log.warn("Upload url rejected, could not check {} for a redirect ({})", current, e.toString());
                return null;
            }
            if (next == null) {
                return current;
            }
            current = next;
        }
        log.warn("Upload url rejected, more than {} redirects: {}", MAX_REDIRECTS, rawUrl);
        return null;
    }

    private static String redirectTarget(String urlStr) throws IOException {
        var connection = (HttpURLConnection) new URL(urlStr).openConnection();
        connection.setInstanceFollowRedirects(false);
        connection.setUseCaches(false);
        connection.setConnectTimeout(PROBE_TIMEOUT_MS);
        connection.setReadTimeout(PROBE_TIMEOUT_MS);
        try {
            var status = connection.getResponseCode();
            if (status < 300 || status >= 400) {
                return null;
            }
            var location = connection.getHeaderField("Location");
            if (StrUtil.isEmpty(location)) {
                return null;
            }
            return new URL(new URL(urlStr), location).toString();
        } finally {
            connection.disconnect();
        }
    }

    /**
     * Whether this is a URL for an object in the store the product writes to. The prefix is
     * {@code minio.endpoint} joined with {@code minio.bucketName}, which is what
     * {@code generatePresignedUrl} hands the browser back as its access url.
     */
    private static boolean isStorageObject(URL url, String prefix) {
        if (StrUtil.isEmpty(prefix)) {
            return false;
        }
        try {
            var store = new URL(prefix);
            return url.getProtocol().equalsIgnoreCase(store.getProtocol())
                    && url.getHost().equalsIgnoreCase(store.getHost())
                    && port(url) == port(store)
                    && objectPath(url).startsWith(store.getPath());
        } catch (MalformedURLException e) {
            log.warn("minio.endpoint and minio.bucketName do not make a url: {}", prefix);
            return false;
        }
    }

    /**
     * The path with its dot segments resolved, because the server at the far end resolves them
     * too: without this {@code /<bucket>/../minio/admin/...} starts with the bucket here and
     * does not by the time it arrives. {@code %2e} is refused outright — it encodes a character
     * that never needs encoding, and the only use anyone has for it is hiding a dot from a check
     * like this one. Returns an empty path when it cannot tell, which fails the prefix test.
     */
    private static String objectPath(URL url) {
        var path = url.getPath();
        if (path.toLowerCase(Locale.ROOT).contains("%2e")) {
            return "";
        }
        try {
            return URI.create(path).normalize().getPath();
        } catch (IllegalArgumentException e) {
            return "";
        }
    }

    private static int port(URL url) {
        return url.getPort() == -1 ? url.getDefaultPort() : url.getPort();
    }

    private static List<String> hosts(String whitelist) {
        if (StrUtil.isEmpty(whitelist)) {
            return List.of();
        }
        return Arrays.stream(whitelist.split(","))
                .map(String::trim)
                .map(UploadUrlValidator::toHost)
                .filter(StrUtil::isNotEmpty)
                .collect(Collectors.toList());
    }

    /**
     * Before this setting meant hosts it meant "the URL contains this string", so entries in the
     * wild look like {@code https://files.acme.com/datasets} or {@code files.acme.com:8443}.
     * getHost() carries neither scheme, port nor path, so such an entry would match nothing and
     * silently reject every upload. Reduce each entry to the host it names.
     */
    private static String toHost(String entry) {
        var host = entry.toLowerCase(Locale.ROOT);
        var scheme = host.indexOf("://");
        if (scheme >= 0) {
            host = host.substring(scheme + 3);
        }
        host = StrUtil.subBefore(host, "/", false);
        host = StrUtil.subBefore(host, ":", false);
        return StrUtil.removePrefix(host, ".");
    }

    private static boolean matchesHost(String host, List<String> allowed) {
        var lower = host.toLowerCase(Locale.ROOT);
        for (String entry : allowed) {
            if (lower.equals(entry) || lower.endsWith("." + entry)) {
                return true;
            }
        }
        return false;
    }

    private static boolean isInternal(InetAddress address) {
        return address.isLoopbackAddress()
                || address.isAnyLocalAddress()
                || address.isLinkLocalAddress()
                || address.isSiteLocalAddress()
                || address.isMulticastAddress()
                || isUniqueLocalIpv6(address)
                || isSharedAddressSpace(address);
    }

    /** fc00::/7, which isSiteLocalAddress does not cover. */
    private static boolean isUniqueLocalIpv6(InetAddress address) {
        var bytes = address.getAddress();
        return bytes.length == 16 && (bytes[0] & 0xfe) == 0xfc;
    }

    /** 100.64.0.0/10, RFC 6598, used by carrier and cloud internal networks. */
    private static boolean isSharedAddressSpace(InetAddress address) {
        var bytes = address.getAddress();
        return bytes.length == 4 && (bytes[0] & 0xff) == 100 && (bytes[1] & 0xc0) == 64;
    }
}
