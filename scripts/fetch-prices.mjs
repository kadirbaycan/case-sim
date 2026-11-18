// Gerçek piyasa fiyatlarını Skinport'tan çeker -> prices.json
// Kullanım: node scripts/fetch-prices.mjs   (GitHub Actions'ta otomatik çalışır)
import fs from 'node:fs';

const game = JSON.parse(fs.readFileSync('src/data/game.json', 'utf8'));
const WEARS = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];

// Oyunun kullanabileceği tüm market adları (src/engine/game.ts marketName ile aynı mantık)
const wanted = new Set();
for (const c of game.cases) wanted.add(c.name);
for (const s of Object.values(game.skins)) {
  for (const st of s.st ? [false, true] : [false]) {
    let base = s.n;
    if (st) base = base.startsWith('★ ') ? `★ StatTrak™ ${base.slice(2)}` : `StatTrak™ ${base}`;
    if (s.v) wanted.add(base);
    else for (const w of WEARS) wanted.add(`${base} (${w})`);
  }
}

const res = await fetch('https://api.skinport.com/v1/items?app_id=730&currency=USD&tradable=0', {
  headers: { 'Accept-Encoding': 'br, gzip, deflate', 'User-Agent': 'cs-case-sim-price-bot' },
});
if (!res.ok) {
  console.error('Skinport HTTP', res.status);
  process.exit(1);
}
const items = await res.json();
const p = {};
for (const it of items) {
  if (!wanted.has(it.market_hash_name)) continue;
  const v = it.min_price ?? it.median_price ?? it.suggested_price;
  if (v && v > 0) p[it.market_hash_name] = Math.round(v * 100) / 100;
}
const out = { updated: Date.now(), source: 'skinport', count: Object.keys(p).length, p };
fs.writeFileSync('prices.json', JSON.stringify(out));
console.log(`fiyat: ${out.count}/${wanted.size}`);
if (out.count < 500) {
  console.error('Beklenenden az fiyat geldi, dosya yazıldı ama kontrol et.');
}
