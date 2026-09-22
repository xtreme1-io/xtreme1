"""A server that passes the check and then redirects, to prove the download refuses it.

UploadUrlValidator.resolve() probes the URL first; this answers 200 to that probe so every
hop check passes. The real download arrives second and gets a 302 into the compose network.
Before the fix, hutool's downloadFileFromUrl followed it.

Runs inside the compose network so the backend can reach it. Not a public address, so the
stack is started with upload.url.allowPrivateNetwork=true -- the point under test is the
redirect, not the address rule.
"""
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

TARGET = "http://169.254.169.254/latest/meta-data/"
seen = {"n": 0}


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        seen["n"] += 1
        # Two probes run before the download: DecompressionFileUtils.validateUrl and
        # UploadUrlValidator.redirectTarget. Feed both a clean 200 so resolve() hands the
        # download this URL, then redirect only the download -- the chain no check has seen.
        probe = seen["n"] <= 2
        print(f"request {seen['n']} -> {'200 (a probe)' if probe else '302 ' + TARGET + '  <- the download'}", flush=True)
        if probe:
            body = b"not a redirect, nothing to see here"
            self.send_response(200)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(302)
            self.send_header("Location", TARGET)
            self.send_header("Content-Length", "0")
            self.end_headers()

    def log_message(self, *args):
        pass


ThreadingHTTPServer(("0.0.0.0", 9999), Handler).serve_forever()
