/* Generate Chrome Web Store screenshots and the required small promo tile.
   Run: node tools/store-assets.js

   Output:
     docs/store/01-hints.png       1280x800
     docs/store/02-learn.png       1280x800
     docs/store/03-code-review.png 1280x800
     docs/store/04-solution.png     1280x800
     docs/store/05-codeforces.png   1280x800
     docs/store/small-promo.png      440x280
*/
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const { spawn, spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'store');
const PORT = 5192;
const BASE = 'http://localhost:' + PORT;

const CANDIDATES = [
  path.join(process.env['ProgramFiles'] || '', 'Google/Chrome/Application/chrome.exe'),
  path.join(process.env['ProgramFiles(x86)'] || '', 'Google/Chrome/Application/chrome.exe'),
  path.join(process.env['ProgramFiles(x86)'] || '', 'Microsoft/Edge/Application/msedge.exe'),
  path.join(process.env['ProgramFiles'] || '', 'Microsoft/Edge/Application/msedge.exe'),
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
];

function findBrowser() {
  for (const p of CANDIDATES) if (p && fs.existsSync(p)) return p;
  throw new Error('No Chrome or Edge found. Set CHROME_PATH.');
}

const LC = '/tools/fixture/leetcode.html?adapter=leetcode&w=500';
const CF = '/tools/fixture/codeforces.html?adapter=codeforces&w=500';

const SHOTS = [
  ['01-hints.png',       LC + '&shot=hint1&scroll=top',       1280, 800],
  ['02-learn.png',       LC + '&shot=learn',                  1280, 800],
  ['03-code-review.png', LC + '&shot=code',                   1280, 800],
  ['04-solution.png',    LC + '&shot=solution&scroll=reveal', 1280, 800],
  ['05-codeforces.png',  CF + '&shot=ladder',                 1280, 800],
  ['small-promo.png',    '/tools/store-tile.html',             440, 280]
];

function waitForServer(tries) {
  return new Promise(function (resolve, reject) {
    const attempt = function (left) {
      http.get(BASE + '/manifest.json', function (res) {
        res.resume();
        resolve();
      }).on('error', function (e) {
        if (left <= 0) return reject(e);
        setTimeout(function () { attempt(left - 1); }, 150);
      });
    };
    attempt(tries || 40);
  });
}

function capture(browser, url, file, width, height) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ladder-store-shot-'));
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + profile,
    '--force-device-scale-factor=1',
    '--window-size=' + width + ',' + height,
    '--virtual-time-budget=9000',
    '--screenshot=' + file,
    url
  ];
  const result = spawnSync(browser, args, { stdio: 'ignore' });
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch (_) {}
  return result.status === 0 && fs.existsSync(file);
}

(async function main() {
  const browser = process.env.CHROME_PATH || findBrowser();
  fs.mkdirSync(OUT, { recursive: true });
  const server = spawn(process.execPath, [path.join(__dirname, 'serve.js'), String(PORT)], {
    stdio: 'ignore'
  });

  try {
    await waitForServer();
    let ok = 0;
    for (const [name, urlPath, width, height] of SHOTS) {
      const file = path.join(OUT, name);
      if (fs.existsSync(file)) fs.unlinkSync(file);
      const good = capture(browser, BASE + urlPath, file, width, height);
      console.log((good ? 'ok   ' : 'FAIL ') + name + (good ? ' ' + fs.statSync(file).size + 'B' : ''));
      if (good) ok++;
    }
    if (ok !== SHOTS.length) process.exitCode = 1;
  } finally {
    server.kill();
  }
})().catch(function (e) {
  console.error(e.stack || e.message || e);
  process.exit(1);
});
