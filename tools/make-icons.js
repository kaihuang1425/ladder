/* Generates the extension icons as PNGs with no dependencies.
   Run: node tools/make-icons.js */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'icons');
const BG = [59, 91, 219];      // accent indigo
const FG = [255, 255, 255];

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = c ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // truecolour with alpha
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // no filter
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* Supersample 4x so the rounded corners and rungs are smooth. */
function render(size) {
  const S = 4;
  const w = size * S;
  const acc = new Float64Array(size * size * 4);

  const radius = w * 0.22;
  const railW = Math.max(1, w * 0.085);
  const rungH = Math.max(1, w * 0.075);
  const leftRail = w * 0.28;
  const rightRail = w * 0.72;
  const top = w * 0.14;
  const bottom = w * 0.86;
  const rungYs = [0.30, 0.50, 0.70].map(function (t) { return w * t; });

  const inRounded = function (x, y) {
    const rx = Math.min(x, w - x);
    const ry = Math.min(y, w - y);
    if (rx >= radius || ry >= radius) return rx >= 0 && ry >= 0;
    const dx = radius - rx, dy = radius - ry;
    return dx * dx + dy * dy <= radius * radius;
  };

  const onLadder = function (x, y) {
    if (y < top || y > bottom) return false;
    if (Math.abs(x - leftRail) <= railW / 2) return true;
    if (Math.abs(x - rightRail) <= railW / 2) return true;
    if (x < leftRail || x > rightRail) return false;
    for (const ry of rungYs) if (Math.abs(y - ry) <= rungH / 2) return true;
    return false;
  };

  for (let py = 0; py < w; py++) {
    for (let px = 0; px < w; px++) {
      if (!inRounded(px + 0.5, py + 0.5)) continue;
      const colour = onLadder(px + 0.5, py + 0.5) ? FG : BG;
      const i = (Math.floor(py / S) * size + Math.floor(px / S)) * 4;
      acc[i] += colour[0];
      acc[i + 1] += colour[1];
      acc[i + 2] += colour[2];
      acc[i + 3] += 255;
    }
  }

  const out = Buffer.alloc(size * size * 4);
  const samples = S * S;
  for (let i = 0; i < size * size; i++) {
    const a = acc[i * 4 + 3] / samples;
    const cover = a / 255;
    out[i * 4] = cover ? Math.round(acc[i * 4] / samples / cover) : 0;
    out[i * 4 + 1] = cover ? Math.round(acc[i * 4 + 1] / samples / cover) : 0;
    out[i * 4 + 2] = cover ? Math.round(acc[i * 4 + 2] / samples / cover) : 0;
    out[i * 4 + 3] = Math.round(a);
  }
  return png(size, size, out);
}

fs.mkdirSync(OUT, { recursive: true });
for (const size of [16, 32, 48, 128]) {
  const file = path.join(OUT, 'icon' + size + '.png');
  fs.writeFileSync(file, render(size));
  console.log('wrote', path.relative(process.cwd(), file), fs.statSync(file).size + 'B');
}
