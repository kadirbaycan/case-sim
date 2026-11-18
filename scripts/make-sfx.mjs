// Ses efektlerini sentezler: node scripts/make-sfx.mjs  -> assets/sfx/*.wav
import fs from 'node:fs';

const SR = 22050;
function wav(samples) {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + samples.length * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((s, i) => buf.writeInt16LE(Math.max(-1, Math.min(1, s)) * 32000, 44 + i * 2));
  return buf;
}
const gen = (dur, fn) => Array.from({ length: Math.floor(SR * dur) }, (_, i) => fn(i / SR));
const env = (t, a, d) => Math.min(1, t / a) * Math.exp(-t / d);

const tick = gen(0.045, (t) => (Math.sin(2 * Math.PI * 1900 * t) * 0.6 + (Math.random() * 2 - 1) * 0.4) * env(t, 0.001, 0.008));
const unlock = gen(0.5, (t) =>
  Math.sin(2 * Math.PI * 85 * t) * env(t, 0.002, 0.12) * 0.9 +
  Math.sin(2 * Math.PI * 760 * t) * env(t, 0.001, 0.03) * 0.5 +
  (Math.random() * 2 - 1) * env(t, 0.001, 0.02) * 0.3);

function arp(notes, step, len) {
  return gen(step * notes.length + len, (t) => {
    let v = 0;
    notes.forEach((f, i) => {
      const tt = t - i * step;
      if (tt >= 0) v += (Math.sin(2 * Math.PI * f * tt) + 0.4 * Math.sin(4 * Math.PI * f * tt)) * env(tt, 0.004, len / 3);
    });
    return v * 0.35;
  });
}
const winLow = arp([392, 523], 0.09, 0.25);
const winMid = arp([523, 659, 784], 0.08, 0.35);
const winRare = arp([523, 659, 784, 1047], 0.08, 0.45);
const winGold = arp([523, 659, 784, 1047, 1319, 1568], 0.075, 0.9);
const lose = gen(0.5, (t) => Math.sin(2 * Math.PI * (300 - 180 * t) * t) * env(t, 0.005, 0.2) * 0.6);
const coin = gen(0.18, (t) => Math.sin(2 * Math.PI * (t < 0.06 ? 1320 : 1760) * t) * env(t, 0.002, 0.06) * 0.5);

fs.mkdirSync('assets/sfx', { recursive: true });
for (const [n, s] of Object.entries({ tick, unlock, winLow, winMid, winRare, winGold, lose, coin })) {
  fs.writeFileSync(`assets/sfx/${n}.wav`, wav(s));
}
console.log('sfx hazır');
