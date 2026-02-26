import http.client
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


WEB_ROOT = Path("/srv/www/dist").resolve()
BACKEND_HOST = os.getenv("BACKEND_HOST", "backend")
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8000"))
SERVER_PORT = int(os.getenv("PORT", "80"))

HOP_BY_HOP_HEADERS = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
}
PROXY_PREFIXES = ("/api/", "/admin/", "/static/", "/media/")


class SPAHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_ROOT), **kwargs)

    def _candidate_path(self) -> Path:
        request_path = unquote(urlparse(self.path).path).lstrip("/")
        candidate = (WEB_ROOT / request_path).resolve()
        if WEB_ROOT not in candidate.parents and candidate != WEB_ROOT:
            return WEB_ROOT / "index.html"
        return candidate

    def _rewrite_for_spa(self) -> None:
        candidate = self._candidate_path()
        if self.path == "/" or not candidate.exists() or candidate.is_dir():
            self.path = "/index.html"

    def _is_proxy_path(self) -> bool:
        path = urlparse(self.path).path
        return any(path.startswith(prefix) for prefix in PROXY_PREFIXES)

    def _proxy_request(self) -> None:
        body = None
        content_length = self.headers.get("Content-Length")
        if content_length is not None:
            body = self.rfile.read(int(content_length))

        original_host = self.headers.get("Host")
        original_proto = self.headers.get("X-Forwarded-Proto", "http")
        client_ip = self.client_address[0]
        prior_xff = self.headers.get("X-Forwarded-For")

        request_headers = {}
        for key, value in self.headers.items():
            if key.lower() in HOP_BY_HOP_HEADERS:
                continue
            request_headers[key] = value

        if original_host:
            request_headers["Host"] = original_host
            request_headers["X-Forwarded-Host"] = original_host
        request_headers["X-Forwarded-Proto"] = original_proto
        request_headers["X-Forwarded-Port"] = "443" if original_proto == "https" else "80"
        request_headers["X-Forwarded-For"] = (
            f"{prior_xff}, {client_ip}" if prior_xff else client_ip
        )

        connection = None
        try:
            connection = http.client.HTTPConnection(BACKEND_HOST, BACKEND_PORT, timeout=30)
            connection.request(self.command, self.path, body=body, headers=request_headers)
            response = connection.getresponse()
            response_body = response.read()

            self.send_response(response.status, response.reason)
            for key, value in response.getheaders():
                if key.lower() in HOP_BY_HOP_HEADERS:
                    continue
                if key.lower() == "content-length":
                    continue
                self.send_header(key, value)
            self.send_header("Content-Length", str(len(response_body)))
            self.end_headers()

            if self.command != "HEAD":
                self.wfile.write(response_body)
        except Exception as exc:
            self.send_error(502, f"Bad gateway to backend: {exc}")
        finally:
            try:
                if connection is not None:
                    connection.close()
            except Exception:
                pass

    def do_GET(self) -> None:  # noqa: N802
        if self._is_proxy_path():
            self._proxy_request()
            return
        self._rewrite_for_spa()
        super().do_GET()

    def do_HEAD(self) -> None:  # noqa: N802
        if self._is_proxy_path():
            self._proxy_request()
            return
        self._rewrite_for_spa()
        super().do_HEAD()

    def do_POST(self) -> None:  # noqa: N802
        if self._is_proxy_path():
            self._proxy_request()
            return
        self.send_error(404, "Not found")

    def do_PUT(self) -> None:  # noqa: N802
        if self._is_proxy_path():
            self._proxy_request()
            return
        self.send_error(404, "Not found")

    def do_PATCH(self) -> None:  # noqa: N802
        if self._is_proxy_path():
            self._proxy_request()
            return
        self.send_error(404, "Not found")

    def do_DELETE(self) -> None:  # noqa: N802
        if self._is_proxy_path():
            self._proxy_request()
            return
        self.send_error(404, "Not found")

    def do_OPTIONS(self) -> None:  # noqa: N802
        if self._is_proxy_path():
            self._proxy_request()
            return
        self.send_error(404, "Not found")

    def end_headers(self) -> None:
        if self.path.startswith("/assets/"):
            self.send_header("Cache-Control", "public, max-age=2592000, immutable")
        super().end_headers()


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", SERVER_PORT), SPAHandler)
    server.serve_forever()
