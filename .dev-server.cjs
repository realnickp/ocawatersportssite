// Local dev server that mimics this project's vercel.json:
//   - cleanUrls: true  (/jet-skis -> jet-skis.html)
// Static HTML site, no build step. Usage: node .dev-server.cjs [port]
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const ROOT = __dirname;
const PORT = parseInt(process.argv[2], 10) || 3001;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.cjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.gif': 'image/gif',
  '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml'
};

function send(res, status, body, headers = {}) { res.writeHead(status, headers); res.end(body); }

function serveFile(req, res, filePath) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) return send(res, 404, 'Not found');
    const type = TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    const total = stat.size;

    // Honor HTTP Range requests so <video>/<audio> can stream progressively
    // (browsers send "Range: bytes=..." and expect 206 Partial Content; without
    // it, the whole file must download before the first frame can render).
    const range = req.headers.range;
    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      if (m) {
        let start = m[1] === '' ? null : parseInt(m[1], 10);
        let end = m[2] === '' ? null : parseInt(m[2], 10);
        if (start === null) { start = total - end; end = total - 1; } // suffix range
        else if (end === null || end >= total) { end = total - 1; }
        if (isNaN(start) || start > end || start >= total) {
          return send(res, 416, '', { 'Content-Range': `bytes */${total}` });
        }
        res.writeHead(206, {
          'Content-Type': type,
          'Content-Range': `bytes ${start}-${end}/${total}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': end - start + 1,
          'Cache-Control': 'no-cache'
        });
        return fs.createReadStream(filePath, { start, end }).pipe(res);
      }
    }

    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': total,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  let pathname = decodeURIComponent(url.parse(req.url).pathname);

  if (pathname === '/') return serveFile(req, res, path.join(ROOT, 'index.html'));

  // prevent path traversal
  const safe = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let target = path.join(ROOT, safe);

  fs.stat(target, (err, stat) => {
    if (!err && stat.isFile()) return serveFile(req, res, target);
    if (!err && stat.isDirectory()) return serveFile(req, res, path.join(target, 'index.html'));
    // cleanUrls: try appending .html
    if (!path.extname(target)) return serveFile(req, res, target + '.html');
    return send(res, 404, 'Not found');
  });
});

server.listen(PORT, () => {
  console.log(`OCA dev server (cleanUrls) -> http://localhost:${PORT}`);
});
