import { serve } from "bun";
import { statSync } from "fs";

function getContentType(path){
  if (path.endsWith(".html")) return "text/html";
  if (path.endsWith(".js")) return "application/javascript";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".json")) return "application/json";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

serve({
  port: 3000,
  fetch(req) {
    try {
      const url = new URL(req.url);
      let path = url.pathname === "/" ? "/index.html" : url.pathname;
      const file = Bun.file(`./dist${path}`);
      // optionally check exists
      statSync(`./dist${path}`);
      return new Response(file.stream(), {
        headers: { "content-type": getContentType(path) }
      });
    } catch (err) {
      return new Response("Not found", { status: 404 });
    }
  }
});
