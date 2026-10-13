import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const W = 1200, H = 630;

// Brand: El Mo3adla (= "the equation"). Blue→cyan diagonal gradient with a
// centered white "=" mark. 1200x630 is the standard Open-Graph card size.
function px(x, y) {
  const t = (x / W + y / H) / 2;
  const r = Math.round(37 + (6 * t));
  const g = Math.round(99 + (140 * t));
  const b = Math.round(235 + (20 * t));
  return [r, g, b, 255];
}

const raw = Buffer.alloc(H * (1 + W * 4));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 4)] = 0; // PNG filter: None
  for (let x = 0; x < W; x++) {
    const [r, g, b, a] = px(x, y);
    const o = y * (1 + W * 4) + 1 + x * 4;
    raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
  }
}

// Centered white "=" — two rounded bars.
function bar(cx, cy, halfW, halfH, radius) {
  for (let y = cy - halfH; y < cy + halfH; y++) {
    for (let x = cx - halfW; x < cx + halfW; x++) {
      const dx = Math.max(Math.abs(x - cx) - (halfW - radius), 0);
      const dy = Math.max(Math.abs(y - cy) - (halfH - radius), 0);
      if (dx * dx + dy * dy > radius * radius) continue;
      const o = y * (1 + W * 4) + 1 + x * 4;
      raw[o] = 255; raw[o + 1] = 255; raw[o + 2] = 255; raw[o + 3] = 255;
    }
  }
}
const cx = W / 2, cy = H / 2, halfW = 170, halfH = 26, radius = 26, gap = 74;
bar(cx, cy - gap, halfW, halfH, radius);
bar(cx, cy + gap, halfW, halfH, radius);

const table = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  table[n] = c;
}
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;  // bit depth
ihdr[9] = 6;  // colour type: RGBA

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const out = join(dirname(dirname(fileURLToPath(import.meta.url))), 'public', 'og-image.png');
writeFileSync(out, png);
console.log(`wrote ${out} (${png.length} bytes)`);