import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, FlatList, Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SKINS, TIER_COLOR, WEARS, basePrice, itemPrice, levelFromXp, upgradeChance, Item } from '../engine/game';
import { CLICK_UPGRADES, clickCost, useGame } from '../store/game';
import { usePrices } from '../store/prices';
import { useNav } from '../nav';
import { play, winSfx, haptic } from '../sound';
import { Bar, Btn, C, Chip, ItemTile, Sheet, Text, money, st } from '../ui';

const W = Dimensions.get('window').width;

export default function Games() {
  const sub = useNav((n) => n.games);
  if (sub === 'upgrade') return <Upgrader />;
  if (sub === 'coin') return <Coinflip />;
  if (sub === 'click') return <Clicker />;
  return <Hub />;
}

function Hub() {
  const xp = useGame((x) => x.xp);
  const openGame = useNav((n) => n.openGame);
  const setTab = useNav((n) => n.setTab);
  const setContracts = useNav((n) => n.setContracts);
  const lvl = levelFromXp(xp).level;
  const say = useGame((x) => x.say);
  const tiles: { icon: string; name: string; sub: string; lock: number; colors: [string, string]; on: () => void }[] = [
    { icon: '⚡', name: 'Upgrade', sub: 'Eşyanı yükselt', lock: 5, colors: ['#3a1b1b', '#1b1218'], on: () => openGame('upgrade') },
    { icon: '🔁', name: 'Takas', sub: '10 → 1 kontrat', lock: 3, colors: ['#2a2415', '#15130c'], on: () => { setContracts('trade'); setTab('contracts'); } },
    { icon: '🪙', name: 'Coinflip', sub: 'Yazı mı tura mı', lock: 10, colors: ['#122241', '#0e1424'], on: () => openGame('coin') },
    { icon: '👆', name: 'Tıklayıcı', sub: 'Para bitince', lock: 1, colors: ['#12301a', '#0d1b11'], on: () => openGame('click') },
    { icon: '⚔️', name: 'Case Battle', sub: 'Botlara karşı · yakında', lock: 99, colors: ['#2b1530', '#150e1d'], on: () => say('Case Battle bir sonraki güncellemede') },
  ];
  return (
    <ScrollView contentContainerStyle={{ padding: 9, flexDirection: 'row', flexWrap: 'wrap' }}>
      {tiles.map((t) => {
        const locked = lvl < t.lock && t.lock < 99;
        return (
          <Pressable key={t.name} disabled={locked} onPress={t.on} style={{ width: '50%', padding: 4 }}>
            <LinearGradient colors={t.colors} style={{ height: 150, borderRadius: 16, alignItems: 'center', justifyContent: 'center', opacity: locked ? 0.5 : 1, borderWidth: 1, borderColor: C.line }}>
              <Text style={{ fontSize: 50 }}>{t.icon}</Text>
              <Text style={{ fontWeight: '700', fontSize: 20, marginTop: 4 }}>{t.name}</Text>
              <Text style={{ color: C.dim, fontSize: 13 }}>{locked ? `🔒 Sv.${t.lock}'te açılır` : t.sub}</Text>
            </LinearGradient>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ---------------------------------------------------------------- Upgrader
const MULTS = [1.5, 2, 3, 5, 10, 25, 50];
type Cand = { id: string; float: number; price: number; wear: number };

function Upgrader() {
  const inv = useGame((x) => x.inv);
  const upgrade = useGame((x) => x.upgrade);
  const prices = usePrices((x) => x.p);
  const preset = useNav((n) => n.upgraderUid);
  const [inp, setInp] = useState<Item | null>(null);
  const [pick, setPick] = useState(false);
  const [mult, setMult] = useState(2);
  const [target, setTarget] = useState<Cand | null>(null);
  const [res, setRes] = useState<{ win: boolean; chance: number; item?: Item } | null>(null);
  const [busy, setBusy] = useState(false);
  const pos = useRef(new Animated.Value(0)).current;

  useEffect(() => { if (preset) { const it = inv.find((i) => i.uid === preset); if (it) setInp(it); useNav.setState({ upgraderUid: null }); } }, [preset]);
  const value = inp ? itemPrice(inp, prices).p : 0;

  const cands = useMemo<Cand[]>(() => {
    if (!inp) return [];
    const want = value * mult;
    const out: Cand[] = [];
    for (const [id, sk] of Object.entries(SKINS)) {
      if (sk.t < 3) continue;
      for (let w = 0; w < 5; w++) {
        const wlo = w === 0 ? 0 : WEARS[w - 1].max;
        const lo = Math.max(wlo, sk.min), hi = Math.min(WEARS[w].max, sk.max);
        if (!sk.v && lo >= hi) continue;
        if (sk.v && w > 0) continue;
        const float = sk.v ? 0 : (lo + hi) / 2;
        const p = basePrice(sk, float, false, prices);
        if (p.est) continue;
        if (p.p > want * 0.75 && p.p < want * 1.3) out.push({ id, float, price: p.p, wear: w });
      }
    }
    return out.sort((a, b) => Math.abs(a.price - want) - Math.abs(b.price - want)).slice(0, 25);
  }, [inp, mult, prices, value]);

  const chance = target ? upgradeChance(value, target.price) : 0;

  const go = () => {
    if (!inp || !target || busy) return;
    const r = upgrade(inp.uid, target.id, target.float, prices);
    if (!r) return;
    setBusy(true); setRes(null); pos.setValue(0);
    const final = r.win ? Math.random() * r.chance * 0.96 + 0.01 : r.chance + (1 - r.chance) * (0.04 + Math.random() * 0.92);
    play('unlock');
    Animated.sequence([
      Animated.timing(pos, { toValue: 1, duration: 600, easing: Easing.linear, useNativeDriver: false }),
      Animated.timing(pos, { toValue: 0.05, duration: 600, easing: Easing.linear, useNativeDriver: false }),
      Animated.timing(pos, { toValue: final, duration: 2600, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start(() => {
      setBusy(false); setRes(r);
      if (r.win && r.item) { play(winSfx(SKINS[r.item.skinId].t)); haptic('success'); } else { play('lose'); haptic('heavy'); }
      setInp(null); setTarget(null);
    });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 40 }}>
      <Text style={st.h2}>1) Yükseltilecek eşya</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 6 }}>
        {inp ? <ItemTile item={inp} prices={prices} w={150} /> : <View style={{ width: 150, height: 130, borderRadius: 12, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 40, color: C.dim }}>+</Text></View>}
        <View style={{ flex: 1, paddingLeft: 12 }}>
          <Btn small kind="ghost" label={inp ? 'Değiştir' : 'Envanterden seç'} disabled={busy} onPress={() => setPick(true)} />
        </View>
      </View>

      {inp && (
        <>
          <Text style={[st.h2, { marginTop: 8 }]}>2) Hedef çarpanı</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6, flexGrow: 0 }}>
            {MULTS.map((m) => <Chip key={m} label={`x${m}`} on={mult === m} onPress={() => { setMult(m); setTarget(null); }} />)}
          </ScrollView>
          {cands.length === 0 && <Text style={st.dim}>Bu çarpan için gerçek fiyatlı hedef bulunamadı.</Text>}
          {cands.map((cd) => {
            const sk = SKINS[cd.id];
            const on = target?.id === cd.id && target.wear === cd.wear;
            return (
              <Pressable key={cd.id + cd.wear} onPress={() => setTarget(cd)} style={[st.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 6, padding: 8, borderWidth: on ? 2 : 0, borderColor: C.blue, borderBottomWidth: on ? 2 : 3, borderBottomColor: on ? C.blue : TIER_COLOR[sk.t] }]}>
                <Image source={{ uri: sk.img }} style={{ width: 64, height: 46 }} contentFit="contain" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={{ fontWeight: '700' }}>{sk.n}</Text>
                  <Text style={st.dim}>{sk.v ? '' : WEARS[cd.wear].name}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: C.green, fontWeight: '700' }}>{money(cd.price)}</Text>
                  <Text style={st.dim}>%{(upgradeChance(value, cd.price) * 100).toFixed(1)}</Text>
                </View>
              </Pressable>
            );
          })}
        </>
      )}

      {inp && target && (
        <View style={{ marginTop: 10 }}>
          <View style={{ height: 24, backgroundColor: C.red + '55', borderRadius: 12, overflow: 'hidden' }}>
            <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${chance * 100}%`, backgroundColor: C.green }} />
            <Animated.View style={{ position: 'absolute', top: 0, bottom: 0, width: 4, backgroundColor: '#fff', left: pos.interpolate({ inputRange: [0, 1], outputRange: ['0%', '99%'] }) }} />
          </View>
          <Text style={[st.dim, { textAlign: 'center', marginVertical: 6 }]}>Kazanma şansı %{(chance * 100).toFixed(2)} (ev payı %5)</Text>
          <Btn kind="gold" hold={value >= 30} label={busy ? 'Dönüyor…' : 'Yükselt'} icon="⚡" disabled={busy} onPress={go} />
          <Text style={[st.dim, { textAlign: 'center', marginTop: 6 }]}>Kaybedersen eşya yanar ({money(value)})</Text>
        </View>
      )}

      <Sheet visible={pick} onClose={() => setPick(false)} full>
        <Text style={st.h1}>Eşya seç</Text>
        <FlatList style={{ marginVertical: 8 }} data={[...inv].sort((a, b) => itemPrice(b, prices).p - itemPrice(a, prices).p)} numColumns={2} keyExtractor={(i) => i.uid}
          renderItem={({ item }) => <ItemTile item={item} prices={prices} w={(W - 52) / 2} onPress={() => { setInp(item); setTarget(null); setPick(false); }} />} />
      </Sheet>

      <Sheet visible={!!res} onClose={() => setRes(null)}>
        <Text style={[st.h1, { textAlign: 'center', color: res?.win ? C.green : C.red }]}>{res?.win ? 'KAZANDIN!' : 'Kaybettin'}</Text>
        {res?.item && <View style={{ alignItems: 'center', marginVertical: 8 }}><ItemTile item={res.item} prices={prices} w={W * 0.6} /></View>}
        {res && !res.win && <Text style={[st.dim, { textAlign: 'center', marginVertical: 14 }]}>Eşya yandı. Şans %{(res.chance * 100).toFixed(1)} idi.</Text>}
        <Btn label="Tamam" onPress={() => setRes(null)} />
      </Sheet>
    </ScrollView>
  );
}

// ---------------------------------------------------------------- Coinflip
function Coinflip() {
  const balance = useGame((x) => x.balance);
  const flip = useGame((x) => x.coinflip);
  const stats = useGame((x) => x.stats);
  const [bet, setBet] = useState(1);
  const [heads, setHeads] = useState(true);
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<{ win: boolean; heads: boolean } | null>(null);
  const rot = useRef(new Animated.Value(0)).current;
  const spins = useRef(0);

  const go = () => {
    if (busy) return;
    const r = flip(bet, heads);
    if (!r) return;
    setBusy(true); setLast(null);
    play('unlock');
    spins.current += 6 + (r.heads ? 0 : 1);
    Animated.timing(rot, { toValue: spins.current, duration: 1800, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => {
      setBusy(false); setLast(r);
      if (r.win) { play('winMid'); haptic('success'); } else { play('lose'); haptic('heavy'); }
    });
  };

  const rotateY = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const bets = [0.5, 1, 5, 10, 25, 100];
  return (
    <ScrollView contentContainerStyle={{ padding: 14, alignItems: 'center' }}>
      <View style={{ height: 190, justifyContent: 'center' }}>
        <Animated.View style={{ width: 130, height: 130, borderRadius: 65, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center', borderWidth: 6, borderColor: '#b78a1e', transform: [{ perspective: 600 }, { rotateY }] }}>
          <Text style={{ fontSize: 56, color: '#5a3d00' }}>{last ? (last.heads ? '🦅' : '🔰') : '🪙'}</Text>
        </Animated.View>
      </View>
      {last && <Text style={{ fontSize: 28, fontWeight: '700', color: last.win ? C.green : C.red }}>{last.win ? `+${money(bet * 0.9)}` : `-${money(bet)}`}</Text>}
      <View style={{ flexDirection: 'row', gap: 10, marginVertical: 12 }}>
        <Chip label="🦅 YAZI" on={heads} onPress={() => setHeads(true)} />
        <Chip label="🔰 TURA" on={!heads} onPress={() => setHeads(false)} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
        {bets.map((b) => <Chip key={b} label={`$${b}`} on={bet === b} onPress={() => setBet(b)} />)}
        <Chip label="Hepsi" on={false} onPress={() => setBet(Math.floor(balance * 100) / 100)} />
      </View>
      <Btn kind="gold" hold={bet > balance * 0.25 && bet >= 1} label={`Çevir · ${money(bet)}`} disabled={busy || balance < bet || bet <= 0} onPress={go} style={{ alignSelf: 'stretch', marginTop: 16 }} />
      <Text style={[st.dim, { marginTop: 10, textAlign: 'center' }]}>Kazanırsan bahsin x1.9 ödenir (%5 ev payı). Sanal para.{'\n'}Toplam: {stats.flips} atış, {stats.flipWins} galibiyet.</Text>
    </ScrollView>
  );
}

// ---------------------------------------------------------------- Tıklayıcı
function Clicker() {
  const g = useGame();
  const tapMany = useGame((x) => x.tapMany);
  const collect = useGame((x) => x.collectAuto);
  const buy = useGame((x) => x.buyClick);
  const pend = useRef(0);
  const [shown, setShown] = useState(0);
  const [offline, setOffline] = useState(0);
  const scale = useRef(new Animated.Value(1)).current;

  const flush = () => { if (pend.current > 0) { tapMany(pend.current); pend.current = 0; } };
  useEffect(() => {
    const x = collect(); if (x > 0) setOffline(x);
    const t = setInterval(flush, 500);
    return () => { clearInterval(t); flush(); };
  }, []);
  useEffect(() => {
    if (!g.click.auto) return;
    const t = setInterval(() => collect(), 1000);
    return () => clearInterval(t);
  }, [g.click.auto]);

  const per = 0.01 * (1 + g.click.tap);
  const tap = () => {
    pend.current++; setShown((s) => s + 1);
    scale.setValue(0.93);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start();
    play('tick'); haptic('light');
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 14 }}>
      {offline > 0 && <Text style={{ color: C.green, textAlign: 'center', fontWeight: '700' }}>Çevrimdışı kazanç: +{money(offline)}</Text>}
      <Pressable onPress={tap} style={{ alignItems: 'center', marginVertical: 14 }}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <LinearGradient colors={['#6c9a3c', '#3f6a22']} style={{ width: 220, height: 220, borderRadius: 110, alignItems: 'center', justifyContent: 'center', borderWidth: 6, borderColor: '#2b4c17' }}>
            <Text style={{ fontSize: 60 }}>💵</Text>
            <Text style={{ fontWeight: '700', fontSize: 26 }}>+{money(per)}</Text>
            <Text style={{ color: '#d6efbd' }}>Bu oturum: {shown}</Text>
          </LinearGradient>
        </Animated.View>
      </Pressable>
      {CLICK_UPGRADES.map((u) => {
        const lvl = g.click[u.id as 'tap' | 'auto'];
        const cost = clickCost(u.id as 'tap' | 'auto', lvl);
        return (
          <View key={u.id} style={[st.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 8 }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: 17 }}>{u.name} · Sv.{lvl}</Text>
              <Text style={st.dim}>{u.desc}</Text>
            </View>
            <Btn small label={money(cost)} disabled={g.balance < cost} onPress={() => buy(u.id as 'tap' | 'auto')} style={{ width: 110 }} />
          </View>
        );
      })}
    </ScrollView>
  );
}
