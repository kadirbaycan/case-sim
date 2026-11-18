import crypto from 'node:crypto';
import { hmacHex, sha256Hex } from '../src/engine/sha256';
import { CASES, Rng, rollCase, tierWeights, SKINS, tradeOutcomes } from '../src/engine/game';

for (const s of ['', 'abc', 'x'.repeat(200), 'ğüş€😀']) {
  const a = sha256Hex(s), b = crypto.createHash('sha256').update(s).digest('hex');
  if (a !== b) throw new Error('sha mismatch ' + s.slice(0, 5));
  const h = hmacHex(s + 'k'.repeat(70), 'msg:' + s), h2 = crypto.createHmac('sha256', s + 'k'.repeat(70)).update('msg:' + s).digest('hex');
  if (h !== h2) throw new Error('hmac mismatch');
}
console.log('SHA256/HMAC OK');

const c = CASES.find((x) => x.name === 'Kilowatt Case')!;
console.log('weights', tierWeights(c));
const N = 200000, cnt: Record<number, number> = {};
const fair = { serverSeed: 'srv', clientSeed: 'cli', nonce: 0 };
for (let i = 0; i < N; i++) {
  const it = rollCase(c, new Rng(fair, i));
  const t = SKINS[it.skinId].t;
  cnt[t] = (cnt[t] || 0) + 1;
}
console.log(Object.fromEntries(Object.entries(cnt).map(([k, v]) => [k, +(v / N * 100).toFixed(2) + '%'])));
// determinism
const a = rollCase(c, new Rng(fair, 5)), b = rollCase(c, new Rng(fair, 5));
if (a.skinId !== b.skinId || a.float !== b.float) throw new Error('not deterministic');
console.log('deterministic OK', SKINS[a.skinId].n, a.float.toFixed(4));
