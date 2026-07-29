/* ==========================================================================
   Loxley Roofing and Construction — local website server
   Zero dependencies (Node.js built-ins only). Serves this folder over http so
   the site's JavaScript modules load correctly (they can't run from file://).

   Start it by double-clicking "Start Loxley Website.bat", or run:
       node serve.mjs
   Then open the URL it prints (default http://localhost:5187).
   Keep the window open while using the site; close it to stop the server.
   ========================================================================== */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const START_PORT = 5187;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".glb": "model/gltf-binary",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2"
};

function send(res, fp, pathname) {
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end("Not found: " + pathname); return; }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(fp).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (pathname === "/") pathname = "/index.html";
  const filePath = path.resolve(ROOT, "." + pathname);
  const rel = path.relative(ROOT, filePath);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    res.writeHead(403); res.end("Forbidden"); return;
  }
  // Clean URLs: a directory or an extensionless path resolves to its index.html
  // (or <path>.html), so real routes like /roofing/storm-damage/ serve full HTML.
  fs.stat(filePath, (err, st) => {
    if (!err && st.isDirectory()) return send(res, path.join(filePath, "index.html"), pathname);
    if (!err && st.isFile()) return send(res, filePath, pathname);
    if (path.extname(filePath) === "") {
      const asIndex = path.join(filePath, "index.html");
      return fs.access(asIndex, fs.constants.F_OK, e1 =>
        e1 ? send(res, filePath + ".html", pathname) : send(res, asIndex, pathname));
    }
    return send(res, filePath, pathname); // 404s honestly
  });
});

function listen(port, triesLeft) {
  server.once("error", (e) => {
    if (e.code === "EADDRINUSE" && triesLeft > 0) {
      listen(port + 1, triesLeft - 1);
    } else {
      console.error("Could not start the server:", e.message);
      process.exit(1);
    }
  });
  server.listen(port, () => {
    const link = "http://localhost:" + port + "/";
    console.log("");
    console.log("  Loxley Roofing website is running.");
    console.log("");
    console.log("  Open in your browser:  " + link);
    console.log("");
    console.log("  Keep this window open while you use the site.");
    console.log("  Close this window (or press Ctrl+C) to stop.");
    console.log("");
    // Open the default browser automatically (Windows / macOS / Linux).
    const opener = process.platform === "win32" ? `start "" "${link}"`
      : process.platform === "darwin" ? `open "${link}"`
      : `xdg-open "${link}"`;
    exec(opener, () => {});
  });
}

listen(START_PORT, 15);
