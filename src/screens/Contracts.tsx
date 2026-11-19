import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { CASE_BY_ID, SKINS } from '../engine/game';
import { MISSION_ICON, SEASON_DAYS, SEASON_TIERS, STARS_PER_TIER, fmtTime, missionName, seasonReward } from '../engine/extra';
import { useGame } from '../store/game';
import { useNav } from '../nav';
import { play, haptic } from '../sound';
import Trade from './Trade';
import { Bar, Btn, C, Chip, Text, money, st } from '../ui';

export default function Contracts() {
  const sub = useNav((n) => n.contracts);
  const setSub = useNav((n) => n.setContracts);
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', paddingHorizontal: 12, marginBottom: 6 }}>
        <Chip label="GÜNLÜK" on={sub === 'daily'} onPress={() => setSub('daily')} />
        <Chip label="TAKAS" on={sub === 'trade'} onPress={() => setSub('trade')} />
      </View>
      {sub === 'daily' ? <Daily /> : <Trade />}
    </View>
  );
}

function Daily() {
  const g = useGame();
  const claimTier = useGame((x) => x.claimTier);
  const claimMission = useGame((x) => x.claimMission);
  const ensure = useGame((x) => x.ensureDaily);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { ensure(); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  const seasonLeft = g.seasonStart + SEASON_DAYS * 86400000 - now;
  const midnight = new Date(); midnight.setHours(24, 0, 0, 0);
  const total = SEASON_TIERS * STARS_PER_TIER;
  const tierNow = Math.min(SEASON_TIERS, Math.floor(g.stars / STARS_PER_TIER));
  const claimable = Array.from({ length: SEASON_TIERS }, (_, i) => i + 1).filter((t) => t <= tierNow && !g.seasonClaimed.includes(t)).length;

  return (
    <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 40 }}>
      <Text style={{ textAlign: 'center', color: C.dim, fontWeight: '700', fontSize: 15 }}>Sezon bitişine {Math.floor(seasonLeft / 86400000)}g {Math.floor((seasonLeft % 86400000) / 3600000)}s</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
        <Bar v={g.stars / total} h={16} style={{ flex: 1 }} />
        <Text style={{ fontWeight: '700', fontSize: 18, marginLeft: 8 }}>★ {g.stars}/{total}</Text>
      </View>
      {claimable > 0 && <Text style={{ color: C.green, fontWeight: '700', textAlign: 'center', marginBottom: 6 }}>{claimable} ödül alınmayı bekliyor — basamağa dokun</Text>}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        <View>
          <View style={{ flexDirection: 'row' }}>
            {Array.from({ length: SEASON_TIERS }, (_, i) => i + 1).map((t) => (
              <TierCell key={t} tier={t} stars={g.stars} claimed={g.seasonClaimed.includes(t)} onClaim={() => { claimTier(t); play('coin'); haptic('success'); }} />
            ))}
          </View>
          <View style={{ flexDirection: 'row' }}>
            {Array.from({ length: SEASON_TIERS }, (_, i) => i + 1).map((t) => (
              <View key={t} style={{ width: 92, alignItems: 'center', marginTop: 4 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: t <= tierNow ? '#2f8a3f' : C.card2, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontWeight: '700', fontSize: 13 }}>{t}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={st.h2}>Günlük Görevler</Text>
        <Text style={{ color: C.dim, fontWeight: '700' }}>⏱ {fmtTime(midnight.getTime() - now)}</Text>
      </View>
      {g.missions.list.map((m) => {
        const done = m.progress >= m.target;
        return (
          <View key={m.id} style={[st.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 8, opacity: m.claimed ? 0.5 : 1 }]}>
            <Text style={{ fontSize: 28, marginRight: 10 }}>{MISSION_ICON[m.type]}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: 17 }}>{missionName(m)}</Text>
              <Text style={st.dim}>+{m.stars}★  +{money(m.cash)}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Bar v={m.progress / m.target} h={6} style={{ flex: 1 }} />
                <Text style={{ marginLeft: 8, fontWeight: '700' }}>{m.progress}/{m.target}</Text>
              </View>
            </View>
            <Btn small label={m.claimed ? 'Alındı' : 'Tamamla'} disabled={!done || m.claimed} style={{ marginLeft: 10, width: 96 }}
              onPress={() => { claimMission(m.id); play('coin'); haptic('success'); }} />
          </View>
        );
      })}
      <Text style={[st.dim, { textAlign: 'center', marginTop: 6 }]}>Her {STARS_PER_TIER} yıldız bir sezon basamağı açar. Görevler her gece yenilenir.</Text>
    </ScrollView>
  );
}

function TierCell({ tier, stars, claimed, onClaim }: { tier: number; stars: number; claimed: boolean; onClaim: () => void }) {
  const r = seasonReward(tier);
  const unlocked = stars >= tier * STARS_PER_TIER;
  let img: string | null = null, label = '', color = C.green;
  if (r.kind === 'cash') label = money(r.amount);
  if (r.kind === 'case') { img = CASE_BY_ID[r.caseId].img; label = `${r.n}× kasa`; color = C.blue; }
  if (r.kind === 'skin') { img = SKINS[r.skinId].img; label = 'Covert'; color = '#eb4b4b'; }
  return (
    <Pressable disabled={!unlocked || claimed} onPress={onClaim} style={{ width: 92, padding: 3 }}>
      <View style={{ height: 118, borderRadius: 12, backgroundColor: C.card, borderWidth: unlocked && !claimed ? 2 : 0, borderColor: C.green, alignItems: 'center', justifyContent: 'center', opacity: unlocked ? 1 : 0.55, overflow: 'hidden' }}>
        {img ? <Image source={{ uri: img }} style={{ width: 78, height: 58 }} contentFit="contain" /> : <Text style={{ fontSize: 34 }}>💵</Text>}
        <Text style={{ color, fontWeight: '700', fontSize: 15, marginTop: 4 }}>{label}</Text>
        {claimed && <View style={{ position: 'absolute', inset: 0, backgroundColor: '#000a', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 30 }}>✅</Text></View>}
        {!unlocked && <Text style={{ position: 'absolute', right: 6, top: 4 }}>🔒</Text>}
      </View>
    </Pressable>
  );
}
