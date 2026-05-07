const http = require("http");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const host = "0.0.0.0";
const port = 4173;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".json": "application/json; charset=utf-8"
};

function send(res, status, body, type) {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const requested = urlPath === "/" ? "/index.html" : urlPath;
  const safePath = path.normalize(path.join(root, requested));

  if (!safePath.startsWith(root)) {
    send(res, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  fs.readFile(safePath, (err, data) => {
    if (err) {
      send(res, 404, "Not Found", "text/plain; charset=utf-8");
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    send(res, 200, data, mimeTypes[ext] || "application/octet-stream");
  });
}).listen(port, host, () => {
  console.log(`Local server running at http://localhost:${port}`);
});
