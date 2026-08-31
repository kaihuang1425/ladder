/* Captures the README screenshots from the real UI.
   Starts the fixture server, drives headless Chrome through each scenario,
   and writes PNGs into docs/media/.

   Run: node tools/shots.js */
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const { spawn, spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'media');
const PORT = 5191;
const BASE = 'http://localhost:' + PORT;
const DPR = 2;

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
  for (const p of CANDIDATES) {
    if (p && fs.existsSync(p)) return p;
  }
  throw new Error('No Chrome or Edge found. Set CHROME_PATH.');
}

/* name, url path, viewport */
const LC = '/tools/fixture/leetcode.html?adapter=leetcode&w=520';
const CF = '/tools/fixture/codeforces.html?adapter=codeforces&w=520';

const SHOTS = [
  ['hero',           LC + '&shot=hint1&scroll=top',            1440, 900],
  ['solution',       LC + '&shot=solution&scroll=reveal',      1440, 900],
  ['learn',          LC + '&shot=learn',                       1440, 900],
  ['code',           LC + '&shot=code',                        1440, 900],
  ['dark',           LC + '&shot=hint1&theme=dark',            1440, 900],
  ['codeforces',     CF + '&shot=ladder',                      1440, 900],
  ['zh-tw',          LC + '&shot=ladder&locale=zh-TW',         1440, 900],
  ['zh-cn',          LC + '&shot=learn&locale=zh-CN',          1440, 900],
  ['es',             LC + '&shot=ladder&locale=es',            1440, 900],
  ['settings',       '/src/options/options.html?shim=1',        1240, 1400],
  ['banner',         '/tools/banner.html',                     1280, 400],
  ['banner-dark',    '/tools/banner.html?theme=dark',          1280, 400]
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

function capture(browser, url, file, w, h) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ladder-shot-'));
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + profile,
    '--force-device-scale-factor=' + DPR,
    '--window-size=' + w + ',' + h,
    '--virtual-time-budget=9000',
    '--screenshot=' + file,
    url
  ];
  // spawnSync blocks until the child has flushed the PNG, which Start-Process
  // style launching does not.
  const r = spawnSync(browser, args, { stdio: 'ignore' });
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch (_) {}
  return r.status === 0 && fs.existsSync(file);
}

(async function main() {
  const browser = process.env.CHROME_PATH || findBrowser();
  fs.mkdirSync(OUT, { recursive: true });

  const server = spawn(process.execPath, [path.join(__dirname, 'serve.js'), String(PORT)], {
    stdio: 'ignore'
  });

  try {
    await waitForServer();
    console.log('browser:', browser);
    let ok = 0;
    for (const [name, urlPath, w, h] of SHOTS) {
      const file = path.join(OUT, name + '.png');
      if (fs.existsSync(file)) fs.unlinkSync(file);
      const good = capture(browser, BASE + urlPath, file, w, h);
      const size = good ? fs.statSync(file).size : 0;
      console.log((good ? '  ok   ' : '  FAIL ') + name + '.png' +
        (good ? '  ' + Math.round(size / 1024) + 'KB' : ''));
      if (good) ok++;
    }
    console.log(ok + '/' + SHOTS.length + ' screenshots written to docs/media/');
  } finally {
    server.kill();
  }
})().catch(function (e) {
  console.error(e.message);
  process.exit(1);
});
