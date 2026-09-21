package ai.basic.x1.util;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

/**
 * {@link UploadUrlValidator#resolve} against a loopback server, because the point of the method
 * is that it checks every hop and not just the URL the user typed. A public URL answering 302
 * is otherwise a way into the network the backend sits in, and nothing else here exercises that.
 */
class UploadUrlValidatorRedirectTest {

    private static final String STORAGE = "http://minio:9000/";

    private HttpServer server;
    private int port;

    @BeforeEach
    void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(InetAddress.getLoopbackAddress(), 0), 0);
        port = server.getAddress().getPort();
        server.createContext("/final", exchange -> {
            exchange.sendResponseHeaders(200, -1);
            exchange.close();
        });
        server.createContext("/once", exchange -> {
            exchange.getResponseHeaders().add("Location", base() + "/final");
            exchange.sendResponseHeaders(302, -1);
            exchange.close();
        });
        server.createContext("/to-other-host", exchange -> {
            exchange.getResponseHeaders().add("Location", "http://127.0.0.1:" + port + "/final");
            exchange.sendResponseHeaders(302, -1);
            exchange.close();
        });
        server.createContext("/loop", exchange -> {
            exchange.getResponseHeaders().add("Location", base() + "/loop");
            exchange.sendResponseHeaders(302, -1);
            exchange.close();
        });
        server.start();
    }

    @AfterEach
    void stop() {
        server.stop(0);
    }

    private String base() {
        return "http://localhost:" + port;
    }

    @Test
    void followsARedirectAndReturnsWhereItLanded() {
        // allowPrivateNetwork, because a loopback server is a private address by definition.
        var resolved = UploadUrlValidator.resolve(base() + "/once", "", STORAGE, true);
        assertEquals(base() + "/final", resolved);
    }

    @Test
    void returnsTheUrlItselfWhenThereIsNoRedirect() {
        assertEquals(base() + "/final",
                UploadUrlValidator.resolve(base() + "/final", "", STORAGE, true));
    }

    @Test
    void checksEveryHopAndNotOnlyTheFirst() {
        // The whitelist admits 'localhost' but not '127.0.0.1'. The first hop passes and the
        // redirect target does not, so the chain must be refused rather than followed.
        assertNull(UploadUrlValidator.resolve(base() + "/to-other-host", "localhost", STORAGE, true));
        // Same first hop, no redirect away from it: allowed, which shows the rejection above
        // came from the second hop.
        assertEquals(base() + "/final",
                UploadUrlValidator.resolve(base() + "/final", "localhost", STORAGE, true));
    }

    @Test
    void refusesTheFirstHopWhenItIsInternal() {
        // Same server, now without the private-network opt-in: loopback is refused outright.
        assertNull(UploadUrlValidator.resolve(base() + "/once", "", STORAGE, false));
    }

    @Test
    void givesUpOnAnEndlessChain() {
        assertNull(UploadUrlValidator.resolve(base() + "/loop", "", STORAGE, true));
    }
}
