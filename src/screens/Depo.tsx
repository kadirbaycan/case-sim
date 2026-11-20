import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { CASES, CASE_BY_ID, casePrice } from '../engine/game';
import { MISSION_ICON, STARS_PER_TIER, SEASON_TIERS, dayKey, fmtTime, missionName } from '../engine/extra';
import { caseRtp, rtpColor, rtpSym } from '../engine/rtp';
import { useGame } from '../store/game';
import { usePrices } from '../store/prices';
import { useNav } from '../nav';
import { play, haptic } from '../sound';
import { Bar, Btn, Card, Text, money, C } from '../ui';
import { Icon, IconName } from '../icons';

const GUT = 14;

function Sec({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 20, marginBottom: 8, marginHorizontal: 2 }}>
      <Text accessibilityRole="header" style={{ color: C.dim, fontSize: 15, fontWeight: '700', letterSpacing: 2.4, textTransform: 'uppercase' }}>{title}</Text>
      {action ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={10}>
          <Text style={{ color: C.amber, fontSize: 13, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// "Sıradaki hamle": uygulamayı açan kişiye ne yapacağını söyler
type Rec = { tag: string; title: string; sub: string; cta: string; img?: string; go: () => void };

export default function Depo() {
  const prices = usePrices((x) => x.p);
  const g = useGame();
  const claimSupply = useGame((x) => x.claimSupply);
  const claimMission = useGame((x) => x.claimMission);
  const nav = useNav();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  const supplyReady = now >= g.supplyAt;
  const wheelReady = g.spinDay !== dayKey();
  const freeEntries = Object.entries(g.freeCases).filter(([, n]) => n > 0);
  const freeTotal = freeEntries.reduce((a, [, n]) => a + n, 0);
  const doneMissions = g.missions.list.filter((m) => m.progress >= m.target && !m.claimed);
  const tierNow = Math.min(SEASON_TIERS, Math.floor(g.stars / STARS_PER_TIER));
  const tiersReady = Math.max(0, tierNow - g.seasonClaimed.length);

  const ranked = useMemo(
    () => CASES.map((c) => ({ c, price: casePrice(c, prices), rtp: caseRtp(c, prices) })).sort((a, b) => b.rtp.pct - a.rtp.pct),
    [prices],
  );
  const cheapest = useMemo(() => Math.min(...CASES.map((c) => casePrice(c, prices))), [prices]);

  const rec: Rec = useMemo(() => {
    if (doneMissions.length || tiersReady) {
      return { tag: 'Ödül hazır', title: `${doneMissions.length + tiersReady} ödül\nbekliyor`, sub: 'Görevlerden ve sezondan topla.', cta: 'Ödülleri al', go: () => { nav.setContracts('daily'); nav.setTab('contracts'); } };
    }
    if (freeEntries.length) {
      const [cid, n] = freeEntries[0];
      const c = CASE_BY_ID[cid];
      return { tag: 'Ücretsiz', title: `${freeTotal} ücretsiz\nkasa bekliyor`, sub: `${c.name} · bakiye harcamadan aç.`, cta: 'Hemen aç', img: c.img, go: () => nav.openCase(cid) };
    }
    if (wheelReady) return { tag: 'Günlük', title: 'Çark\nhazır', sub: 'Günde bir bedava çevirme.', cta: 'Çevir', go: () => nav.setTab('store') };
    if (g.balance < cheapest) {
      return { tag: 'Para az', title: 'Bakiye\nbitti', sub: 'Eşya sat ya da Tıklayıcı ile para kazan.', cta: 'Tıklayıcı', go: () => nav.openGame('click') };
    }
    const best = ranked.find((r) => r.price <= g.balance) || ranked[0];
    return { tag: 'Öneri', title: `${best.c.name}\naç`, sub: `Geri dönüşü en iyilerden biri: ~%${Math.round(best.rtp.pct * 100)}.`, cta: 'Kasaya git', img: best.c.img, go: () => nav.openCase(best.c.id) };
  }, [doneMissions.length, tiersReady, freeTotal, wheelReady, g.balance, cheapest, ranked]);

  const lastLvPct = g.stats.opened;

  return (
    <ScrollView contentContainerStyle={{ padding: GUT, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
      {/* Kahraman kart */}
      <Card accent={C.amber + '55'} style={{ padding: 16, minHeight: 190 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="bolt" size={14} color={C.amber} />
          <Text style={{ color: C.amber, fontSize: 13, fontWeight: '700', letterSpacing: 2.2, textTransform: 'uppercase' }}>Sıradaki hamle · {rec.tag}</Text>
        </View>
        <Text accessibilityRole="header" style={{ fontSize: 32, lineHeight: 33, fontWeight: '800', textTransform: 'uppercase', marginTop: 8, width: '58%', letterSpacing: 0.5 }}>{rec.title}</Text>
        <Text style={{ color: C.dim, fontSize: 15, marginTop: 4, marginBottom: 14, width: '58%' }}>{rec.sub}</Text>
        {rec.img ? <Image source={{ uri: rec.img }} contentFit="contain" style={{ position: 'absolute', right: -6, top: 26, width: '44%', height: 130, transform: [{ rotate: '6deg' }] }} /> : (
          <View style={{ position: 'absolute', right: 20, top: 40, opacity: 0.9 }}><Icon name={rec.tag === 'Para az' ? 'coin' : rec.tag === 'Günlük' ? 'wheel' : 'star'} size={96} color={C.amber} stroke={1.5} /></View>
        )}
        <Btn label={rec.cta} onPress={rec.go} style={{ width: '60%' }} />
      </Card>

      {/* Supply + çark */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <Card style={{ flex: 1, padding: 12 }} onPress={() => {
          if (!supplyReady) return g.say(`Sonraki drop: ${fmtTime(g.supplyAt - now)}`);
          claimSupply(); play('coin'); haptic('success');
        }}>
          <Text style={{ color: C.faint, fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' }}>Supply Drop</Text>
          <Text style={{ fontSize: 30, fontWeight: '800', color: supplyReady ? C.green : C.text }}>{supplyReady ? 'AL' : fmtTime(g.supplyAt - now)}</Text>
          <Bar v={supplyReady ? 1 : Math.max(0, 1 - (g.supplyAt - now) / (2 * 3600 * 1000))} h={6} />
        </Card>
        <Card style={{ flex: 1, padding: 12 }} onPress={() => nav.setTab('store')}>
          <Text style={{ color: C.faint, fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' }}>Günlük çark</Text>
          <Text style={{ fontSize: 30, fontWeight: '800', color: wheelReady ? C.green : C.dim }}>{wheelReady ? 'HAZIR' : 'YARIN'}</Text>
          <Bar v={wheelReady ? 1 : 0} h={6} />
        </Card>
      </View>

      {/* Hedefler */}
      <Sec title="Hedefler" action="Tümü" onAction={() => { nav.setContracts('daily'); nav.setTab('contracts'); }} />
      {g.missions.list.slice(0, 3).map((m) => {
        const done = m.progress >= m.target;
        return (
          <Card key={m.id} style={{ flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: 8, gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.card2, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={MISSION_ICON[m.type] as IconName} size={18} color={C.amber} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: 16, textTransform: 'uppercase', letterSpacing: 0.6 }}>{missionName(m)}</Text>
              <Bar v={m.progress / m.target} h={6} style={{ marginTop: 5 }} />
            </View>
            {m.claimed ? <Text style={{ color: C.dim, fontWeight: '700' }}>ALINDI</Text> : done ? (
              <Btn small label="Al" onPress={() => { claimMission(m.id); play('coin'); haptic('success'); }} />
            ) : <Text style={{ color: C.dim, fontWeight: '700', fontSize: 15 }}>{Math.min(m.progress, m.target)}/{m.target}</Text>}
          </Card>
        );
      })}

      {/* Önerilen kasalar */}
      <Sec title="Geri dönüşü iyi kasalar" action="Tümü" onAction={() => nav.setTab('cases')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -GUT }} contentContainerStyle={{ paddingHorizontal: GUT, gap: 10 }}>
        {ranked.slice(0, 8).map(({ c, price, rtp }) => (
          <Card key={c.id} style={{ width: 150, padding: 10 }} onPress={() => nav.openCase(c.id)}>
            <View style={{ position: 'absolute', left: 8, top: 8, zIndex: 2, backgroundColor: '#05080ccc', borderRadius: 8, paddingHorizontal: 8, borderWidth: 1, borderColor: C.line }}>
              <Text style={{ color: C.green, fontWeight: '700', fontSize: 14, lineHeight: 22 }}>{money(price)}</Text>
            </View>
            <Image source={{ uri: c.img }} contentFit="contain" style={{ width: '100%', height: 84, marginTop: 18 }} />
            <Text numberOfLines={1} style={{ fontWeight: '700', fontSize: 16, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{c.name}</Text>
            <Text style={{ color: rtpColor(rtp.pct), fontWeight: '700', fontSize: 13 }}>{rtpSym(rtp.pct)} geri dönüş ~%{Math.round(rtp.pct * 100)}</Text>
          </Card>
        ))}
      </ScrollView>

      {/* Karne özeti */}
      <Sec title="Karne" action="Profil" onAction={() => nav.setProfile(true)} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Card style={{ flex: 1, padding: 12 }}>
          <Text style={{ color: C.faint, fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' }}>Açılan kasa</Text>
          <Text style={{ fontSize: 30, fontWeight: '800' }}>{lastLvPct}</Text>
        </Card>
        <Card style={{ flex: 1, padding: 12 }}>
          <Text style={{ color: C.faint, fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' }}>En iyi çıkan</Text>
          <Text style={{ fontSize: 30, fontWeight: '800', color: C.gold }}>{money(g.stats.best)}</Text>
        </Card>
      </View>
    </ScrollView>
  );
}
