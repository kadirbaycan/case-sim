// Kullanım: node scripts/build-data.mjs [crates.json] [skins.json]
// Dosya verilmezse ByMykel/CSGO-API'den indirir. Çıktı: src/data/game.json
import fs from 'node:fs';

const BASE = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en';
async function load(arg, name) {
  if (arg) return JSON.parse(fs.readFileSync(arg, 'utf8'));
  const r = await fetch(`${BASE}/${name}`);
  if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
  return r.json();
}

const crates = await load(process.argv[2], 'crates.json');
const skinsAll = await load(process.argv[3], 'skins.json');
const skinById = new Map(skinsAll.map((s) => [s.id, s]));

// tier: 1 Mil-Spec, 2 Restricted, 3 Classified, 4 Covert, 5 Rare Special (bıçak/eldiven)
const RARITY = {
  rarity_common_weapon: 0, rarity_uncommon_weapon: 0,
  rarity_rare_weapon: 1, rarity_mythical_weapon: 2,
  rarity_legendary_weapon: 3, rarity_ancient_weapon: 4,
};

const skins = {};
const cases = [];

function addSkin(it, tier) {
  if (skins[it.id]) return;
  const full = skinById.get(it.id);
  const name = it.name;
  const isVanilla = it.id.includes('vanilla');
  skins[it.id] = {
    n: name,
    t: tier,
    img: it.image,
    min: full ? full.min_float : 0,
    max: full ? full.max_float : 1,
    st: full ? !!full.stattrak : /★/.test(name), // StatTrak bıçaklarda mümkün
    v: isVanilla ? 1 : 0, // vanilla = aşınma yok
    ph: full && full.phase ? full.phase : null,
  };
}

for (const c of crates) {
  if (c.type !== 'Case') continue;
  const items = [];
  for (const it of c.contains || []) {
    const t = RARITY[it.rarity?.id];
    if (!t) continue;
    addSkin(it, t);
    items.push(it.id);
  }
  const rare = [];
  for (const it of c.contains_rare || []) {
    addSkin(it, 5);
    rare.push(it.id);
  }
  if (!items.length) continue;
  cases.push({
    id: c.id,
    name: c.name,
    date: c.first_sale_date || '',
    img: c.image,
    key: c.name, // anahtar fiyatı sabit: aşağıda
    items,
    rare,
  });
}
cases.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/game.json', JSON.stringify({ cases, skins }));
console.log(`kasa: ${cases.length}, skin: ${Object.keys(skins).length}`);
