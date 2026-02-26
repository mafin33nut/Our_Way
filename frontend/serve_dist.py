from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


WEB_ROOT = Path("/srv/www/dist").resolve()


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

    def do_GET(self) -> None:  # noqa: N802
        self._rewrite_for_spa()
        super().do_GET()

    def do_HEAD(self) -> None:  # noqa: N802
        self._rewrite_for_spa()
        super().do_HEAD()

    def end_headers(self) -> None:
        if self.path.startswith("/assets/"):
            self.send_header("Cache-Control", "public, max-age=2592000, immutable")
        super().end_headers()


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", 80), SPAHandler)
    server.serve_forever()
