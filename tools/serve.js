/* Tiny static server for the fixture pages. Development only.
   Run: node tools/serve.js [port] */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT || process.argv[2] || 5178);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

http.createServer(function (req, res) {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/') rel = '/tools/fixture/leetcode.html';

  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end('forbidden');
    return;
  }

  fs.readFile(file, function (err, data) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('not found: ' + rel);
      return;
    }

    // ?shim=1 injects the fixture's fake chrome.* into an extension page so it
    // can be opened over plain http. Development only; the file on disk is
    // never modified.
    if (/shim=1/.test(req.url) && path.extname(file) === '.html') {
      data = Buffer.from(String(data).replace(
        '<script src="../shared/constants.js"></script>',
        '<script src="../shared/constants.js"></script>' +
        '<script src="/tools/fixture/shim.js"></script>'
      ), 'utf8');
    }

    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(data);
  });
}).listen(PORT, function () {
  console.log('fixture server on http://localhost:' + PORT);
  console.log('  /tools/fixture/leetcode.html');
  console.log('  /tools/fixture/codeforces.html');
  console.log('  /src/options/options.html');
});
