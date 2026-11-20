import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, FlatList, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CASES, CASE_BY_ID, Prices, CaseDef, Item, KEY_PRICE, Rng, SELL_RATE, SKINS, TIER_COLOR, TIER_NAME, WEARS, casePrice, itemPrice, marketName,
  rollCase, tierWeights, basePrice,
} from '../engine/game';
import { dropPercent, fmtRange, fmtTime, priceRange } from '../engine/extra';
import { useGame } from '../store/game';
import { usePrices } from '../store/prices';
import { useNav } from '../nav';
import { play, winSfx, haptic } from '../sound';
import { Reel } from '../components/Reel';
import { Bar, Btn, Card, Chip, ItemTile, RtpMeter, Segmented, Sheet, Text, Toggle, money, st, C } from '../ui';
import Svg, { Defs, LinearGradient as SvgGrad, Polygon, Stop } from 'react-native-svg';
import { Icon, IconName } from '../icons';
import { caseRtp, rtpColor, rtpSym } from '../engine/rtp';

const W = Dimensions.get('window').width;
const GUT = 12;
const loaded = new Set<string>();

export default function Cases() {
  const caseId = useNav((n) => n.caseId);
  return caseId ? <CaseDetail key={caseId} id={caseId} /> : <CaseList />;
}

// ---------------------------------------------------------------- Liste
type Filter = 'all' | 'free' | 'cheap' | 'pricey' | 'rtp' | 'fav';

function CaseList() {
  const prices = usePrices((x) => x.p);
  const { freeCases, favs, supplyAt, spinDay } = useGame();
  const claimSupply = useGame((x) => x.claimSupply);
  const toggleFav = useGame((x) => x.toggleFav);
  const say = useGame((x) => x.say);
  const openCase = useNav((n) => n.openCase);
  const setTab = useNav((n) => n.setTab);
  const [f, setF] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  const unseen = useGame((x) => x.unseen);
  const ready = now >= supplyAt;
  const freeTotal = Object.values(freeCases).reduce((a, b) => a + Math.max(0, b), 0);
  const wheelReady = spinDay !== `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;

  const list = useMemo(() => {
    let a = CASES.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
    if (f === 'free') a = a.filter((c) => (freeCases[c.id] || 0) > 0);
    if (f === 'fav') a = a.filter((c) => favs.includes(c.id));
    if (f === 'cheap') a = [...a].sort((x, y) => casePrice(x, prices) - casePrice(y, prices));
    if (f === 'pricey') a = [...a].sort((x, y) => casePrice(y, prices) - casePrice(x, prices));
    if (f === 'rtp') a = [...a].sort((x, y) => caseRtp(y, prices).pct - caseRtp(x, prices).pct);
    return a;
  }, [f, q, freeCases, favs, prices]);

  const cw = (W - GUT * 2 - 10) / 2;
  const header = (
    <View style={{ paddingHorizontal: GUT }}>
      {unseen && CASE_BY_ID[unseen.caseId] ? (
        <Card accent={C.gold} onPress={() => openCase(unseen.caseId)} style={{ marginBottom: 10, padding: 12, minHeight: 52, justifyContent: 'center' }}>
          <Text style={{ color: C.gold, fontWeight: '700', fontSize: 17 }}>Görmediğin sonuç var · {CASE_BY_ID[unseen.caseId].name} (gör)</Text>
        </Card>
      ) : null}
      {ready || wheelReady ? (
        <Card accent={C.amber + '66'} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 10, gap: 10 }}>
          <Icon name={ready ? 'box' : 'wheel'} size={34} color={C.teal} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '800', fontSize: 19, textTransform: 'uppercase', letterSpacing: 0.8 }}>{ready ? 'Supply Drop hazır' : 'Günlük çark hazır'}</Text>
            <Text style={{ color: C.dim, fontSize: 14 }}>{ready ? 'Bedava kasa ya da para.' : 'Bugünkü ödülü çevir.'}</Text>
          </View>
          <Btn small label={ready ? 'Al' : 'Çevir'} onPress={() => { if (ready) { claimSupply(); play('coin'); haptic('success'); } else setTab('store'); }} />
        </Card>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 12, height: 46, paddingHorizontal: 12, marginBottom: 10 }}>
        <Icon name="search" size={18} color={C.faint} />
        <TextInput value={q} onChangeText={setQ} placeholder="Kasa ara…" placeholderTextColor={C.faint} accessibilityLabel="Kasa ara"
          style={{ flex: 1, color: C.text, fontFamily: C.font, fontSize: 17, padding: 0 }} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -GUT, marginBottom: 10, flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: GUT }}>
        {([['all', 'Hepsi'], ['free', 'Ücretsiz'], ['cheap', 'Ucuz'], ['rtp', 'İyi geri dönüş'], ['pricey', 'Pahalı'], ['fav', 'Favori']] as [Filter, string][]).map(([k, l]) => (
          <Chip key={k} label={l} on={f === k} onPress={() => setF(k)} />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <FlatList
      data={list} numColumns={2} keyExtractor={(c) => c.id} ListHeaderComponent={header}
      contentContainerStyle={{ paddingBottom: 20 }} columnWrapperStyle={{ paddingHorizontal: GUT, gap: 10, marginBottom: 10 }}
      ListEmptyComponent={<Text style={{ color: C.dim, textAlign: 'center', marginTop: 30, fontSize: 16 }}>Bu filtrede kasa yok.</Text>}
      renderItem={({ item: c }) => {
        const free = freeCases[c.id] || 0;
        const r = caseRtp(c, prices);
        const rc = rtpColor(r.pct);
        return (
          <Pressable accessibilityRole="button" accessibilityLabel={`${c.name}, ${free ? free + ' ücretsiz' : money(casePrice(c, prices))}, tahmini geri dönüş yüzde ${Math.round(r.pct * 100)}`}
            onPress={() => openCase(c.id)} onLongPress={() => toggleFav(c.id)} style={{ width: cw }}>
            <Card style={{ padding: 10, paddingBottom: 14 }}>
              <View style={{ position: 'absolute', left: 8, top: 8, zIndex: 2 }}>
                {free > 0 ? (
                  <View style={{ backgroundColor: C.teal, borderRadius: 6, paddingHorizontal: 6 }}><Text style={{ color: '#032421', fontWeight: '800', fontSize: 13, lineHeight: 20, letterSpacing: 0.8 }}>ÜCRETSİZ ×{free}</Text></View>
                ) : (
                  <View style={{ backgroundColor: '#05080ccc', borderRadius: 8, paddingHorizontal: 8, borderWidth: 1, borderColor: C.line }}><Text style={{ color: C.green, fontWeight: '700', fontSize: 15, lineHeight: 23 }}>{money(casePrice(c, prices))}</Text></View>
                )}
              </View>
              {favs.includes(c.id) && <View style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}><Icon name="star" size={18} color={C.gold} fill={C.gold} /></View>}
              <Image source={{ uri: c.img }} style={{ width: '100%', height: cw * 0.6, marginTop: 20, marginBottom: 6 }} contentFit="contain" />
              <Text numberOfLines={2} style={{ fontWeight: '700', fontSize: 18, textTransform: 'uppercase', letterSpacing: 0.6, lineHeight: 20, minHeight: 40 }}>{c.name}</Text>
              <RtpMeter pct={r.pct} color={rc} />
              <View style={{ position: 'absolute', left: 14, right: 14, bottom: 0, height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: free ? C.teal : C.amber }} />
            </Card>
          </Pressable>
        );
      }}
    />
  );
}

// ---------------------------------------------------------------- Detay
type ReelDef = { ids: string[]; win: number };
const REEL_LEN = 42;
const WIN_AT = 34;

function CaseDetail({ id }: { id: string }) {
  const c = CASES.find((x) => x.id === id)!;
  const prices = usePrices((x) => x.p);
  const g = useGame();
  const open = useGame((x) => x.open);
  const sell = useGame((x) => x.sell);
  const setOpt = useGame((x) => x.setOpt);
  const setAutoSell = useGame((x) => x.setAutoSell);
  const say = useGame((x) => x.say);
  const clearUnseen = useGame((x) => x.clearUnseen);

  const [count, setCount] = useState(1);
  const [busy, setBusy] = useState(false);
  const [reels, setReels] = useState<ReelDef[] | null>(null);
  const [run, setRun] = useState(0);
  const [pending, setPending] = useState<Item[] | null>(null);
  const [sheet, setSheet] = useState<{ kept: Item[]; sold: number; soldN: number; free: number } | null>(null);
  const [selSheet, setSelSheet] = useState<Set<string>>(new Set());
  const [info, setInfo] = useState<string | null>(null);
  const [rare, setRare] = useState(false);
  const [asOpen, setAsOpen] = useState(false);
  const [tab, setTab2] = useState<'items' | 'odds' | 'hist'>('items');
  const [need, setNeed] = useState(false);
  const openCaseNav = useNav((n) => n.openCase);
  const setTabNav = useNav((n) => n.setTab);
  const openGameNav = useNav((n) => n.openGame);
  const [load, setLoad] = useState<{ n: number; t: number } | null>(loaded.has(id) ? null : { n: 0, t: 1 });
  const doneCount = useRef(0);
  const infoRef = useRef<{ items: Item[]; free: number; n: number } | null>(null);
  const goRef = useRef<() => void>(() => {});
  const mounted = useRef(true);
  const autoTimer = useRef<any>(null);
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => () => { mounted.current = false; clearTimeout(autoTimer.current); }, []);
  // D2: sonuç hiçbir koşulda görünmeden kaybolmaz — ekran yeniden açılınca sonuç sheet'i gelir
  useEffect(() => {
    const u = useGame.getState().unseen;
    if (!u || u.caseId !== id) return;
    const kept = useGame.getState().inv.filter((i) => u.uids.includes(i.uid));
    if (kept.length) setSheet({ kept, sold: 0, soldN: 0, free: 0 });
    else clearUnseen();
  }, []);
  const closeSheet = () => { setSheet(null); clearUnseen(); };
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(bob, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ])).start();
  }, []);

  // Görselleri önyükle
  const urls = useMemo(() => [c.img, ...[...new Set([...c.items, ...c.rare])].slice(0, 60).map((s) => SKINS[s].img)], [c]);
  useEffect(() => {
    if (loaded.has(id)) return;
    let cancelled = false;
    const t0 = Date.now();
    (async () => {
      setLoad({ n: 0, t: urls.length });
      for (let i = 0; i < urls.length; i += 8) {
        if (cancelled || Date.now() - t0 > 3500) break;
        try { await Image.prefetch(urls.slice(i, i + 8)); } catch {}
        if (!cancelled) setLoad({ n: Math.min(urls.length, i + 8), t: urls.length });
      }
      const wait = Math.max(0, 700 - (Date.now() - t0));
      setTimeout(() => { loaded.add(id); if (!cancelled) setLoad(null); }, wait);
    })();
    return () => { cancelled = true; };
  }, [id]);

  const price = casePrice(c, prices);
  const freeHave = g.freeCases[id] || 0;
  const costFor = (n: number) => price * Math.max(0, n - freeHave);
  const maxMulti = 6;
  const counts = g.massOpen ? [1, 2, 3, 4, 5, 6, 10, 25, 50] : [1, 2, 3, 4, 5, 6];
  const quickForced = count > maxMulti;
  const canOpen = g.balance >= costFor(count) - 1e-9;

  const weights = tierWeights(c);
  const byTier = useMemo(() => {
    const m: Record<number, string[]> = {};
    for (const s of c.items) (m[SKINS[s].t] ||= []).push(s);
    return m;
  }, [c]);
  const rareGroups = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of c.rare) if (!m.has(SKINS[s].n)) m.set(SKINS[s].n, s);
    return [...m.values()];
  }, [c]);

  const filler = () => rollCase(c, new Rng({ serverSeed: String(Math.random()), clientSeed: 'v', nonce: 0 }, Math.floor(Math.random() * 1e9))).skinId;

  function finish(items: Item[], free: number) {
    if (!mounted.current) return;
    let soldTotal = 0, soldN = 0;
    let kept = items;
    const top = items.reduce((m, i) => Math.max(m, SKINS[i.skinId].t), 1);
    if (g.autoSell.on) {
      const sellable = items.filter((i) => itemPrice(i, prices).p < g.autoSell.max && SKINS[i.skinId].t < 4);
      if (sellable.length) {
        soldTotal = sell(sellable.map((i) => i.uid), prices, false);
        soldN = sellable.length;
        const rm = new Set(sellable.map((i) => i.uid));
        kept = items.filter((i) => !rm.has(i.uid));
      }
    }
    play(winSfx(top));
    haptic(top >= 4 ? 'heavy' : 'success');
    setBusy(false);
    const auto = useGame.getState().autoSpin && top < 4;
    if (auto) {
      clearUnseen();
      setSheet(null);
      setPending(kept);
      autoTimer.current = setTimeout(() => { if (mounted.current && useGame.getState().autoSpin) goRef.current(); else setPending(null); }, 1700);
    } else {
      setSelSheet(new Set());
      setSheet({ kept, sold: soldTotal, soldN, free });
    }
  }

  function go() {
    if (busy) return;
    const r = open(id, count, prices);
    if (!r) { setNeed(true); return; }
    setPending(null);
    setBusy(true);
    const quick = g.quick || count > maxMulti;
    if (quick) {
      play('unlock');
      setReels(null);
      setTimeout(() => finish(r.items, r.free), 350);
      return;
    }
    const defs: ReelDef[] = r.items.map((it) => {
      const ids = Array.from({ length: REEL_LEN }, filler);
      ids[WIN_AT] = it.skinId;
      return { ids, win: WIN_AT };
    });
    doneCount.current = 0;
    setReels(defs);
    setRun((x) => x + 1);
    play('unlock');
    infoRef.current = { items: r.items, free: r.free, n: defs.length };
  }
  goRef.current = go;

  function reelDone() {
    const info = infoRef.current;
    if (!info) return;
    doneCount.current++;
    if (doneCount.current >= info.n) { infoRef.current = null; finish(info.items, info.free); }
  }

  const reelH = count === 1 ? 128 : count <= 3 ? 84 : 66;
  const sheetItems = sheet?.kept || [];
  const sheetVal = sheetItems.reduce((a, i) => a + itemPrice(i, prices).p, 0);
  const selVal = sheetItems.filter((i) => selSheet.has(i.uid)).reduce((a, i) => a + itemPrice(i, prices).p * 0.9, 0);
  const cw = (W - GUT * 2 - 12) / 3;

  const rtp = useMemo(() => caseRtp(c, prices), [c, prices]);
  const shortage = Math.max(0, costFor(count) - g.balance);
  const opened = g.perCase[id] || 0;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: GUT, paddingBottom: 16 }}>
        {/* Sahne */}
        <View style={{ minHeight: 210, justifyContent: 'center', marginBottom: 6, marginHorizontal: -GUT }}>
          {!reels ? (
            <Svg width="100%" height="100%" style={{ position: 'absolute', left: 0, top: 0 }} viewBox="0 0 100 100" preserveAspectRatio="none">
              <Defs><SvgGrad id="cone" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#ffb02e" stopOpacity="0.28" /><Stop offset="1" stopColor="#ffb02e" stopOpacity="0" /></SvgGrad></Defs>
              <Polygon points="42,0 58,0 100,100 0,100" fill="url(#cone)" />
            </Svg>
          ) : null}
          {reels ? (
            <View style={{ gap: 6 }}>
              {reels.map((r, i) => (
                <Reel key={i} ids={r.ids} winIndex={r.win} h={reelH} duration={count === 1 ? 6200 : 4400 + i * 250} run={run}
                  onTick={i === 0 ? () => play('tick') : undefined} onDone={reelDone} />
              ))}
            </View>
          ) : (
            <Animated.View style={{ alignItems: 'center', transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }] }}>
              <Image source={{ uri: c.img }} style={{ width: 240, height: 180 }} contentFit="contain" />
            </Animated.View>
          )}
        </View>
        <Text accessibilityRole="header" style={{ textAlign: 'center', marginBottom: 6, fontSize: 36, lineHeight: 38, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>{c.name}</Text>

        {pending && (
          <Text style={{ textAlign: 'center', color: C.green, marginBottom: 6, fontWeight: '700' }}>
            {pending.map((i) => SKINS[i.skinId].n.split(' | ').pop()).join(' · ') || 'Hepsi otomatik satıldı'}
          </Text>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10, gap: 8 }}>
          <View accessible accessibilityLabel={`Tahmini geri dönüş yüzde ${Math.round(rtp.pct * 100)}`} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: rtpColor(rtp.pct) + '2a', borderRadius: 8, paddingHorizontal: 8, height: 28 }}>
            <Text style={{ color: rtpColor(rtp.pct), fontWeight: '700', fontSize: 14 }}>{rtpSym(rtp.pct)} Geri dönüş ~%{Math.round(rtp.pct * 100)}</Text>
          </View>
          {opened > 0 ? <Text style={{ color: C.dim, fontSize: 13 }}>Senin açtığın: {opened}</Text> : null}
        </View>


        <Segmented value={tab} onChange={setTab2} items={[{ k: 'items', label: 'İÇERİK' }, { k: 'odds', label: 'OLASILIK' }, { k: 'hist', label: 'GEÇMİŞ' }]} />
        <View style={{ height: 10 }} />

        {tab === 'items' && (
          <View>
        {[1, 2, 3, 4].map((t) => byTier[t] && (
          <View key={t} style={{ marginBottom: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 4, marginBottom: 4, marginTop: 8 }}><Text style={{ color: TIER_COLOR[t], fontWeight: '700', fontSize: 15, letterSpacing: 2, textTransform: 'uppercase' }}>{['', '●', '◆', '▲', '■', '★'][t]} {TIER_NAME[t]}</Text><Text style={{ color: TIER_COLOR[t], fontWeight: '700', fontSize: 15 }}>%{(weights[t] * 100).toFixed(2)}</Text></View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {byTier[t].map((sid) => <ContentTile key={sid} skinId={sid} c={c} w={cw} onPress={() => setInfo(sid)} />)}
            </View>
          </View>
        ))}
        {weights[5] ? (
          <Pressable onPress={() => setRare(true)} style={{ marginTop: 4 }}>
            <View style={{ backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.gold, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 28, marginRight: 10 }}>★</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.gold, fontWeight: '700', fontSize: 17 }}>Nadir Özel · %{(weights[5] * 100).toFixed(2)}</Text>
                <Text style={st.dim}>{rareGroups.length} bıçak/eldiven çeşidi · dokun ve gör</Text>
              </View>
              <Text style={{ color: C.gold, fontSize: 22 }}>›</Text>
            </View>
          </Pressable>
        ) : null}
            {!g.massOpen && <Text style={[st.dim, { marginTop: 8 }]}>Mağazadan "Toplu Açma" alırsan 10/25/50 kasa aynı anda açabilirsin.</Text>}
          </View>
        )}

        {tab === 'odds' && (
          <View>
            <View style={{ flexDirection: 'row', height: 22, borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}>
              {[1, 2, 3, 4, 5].map((t) => (weights[t] ? <View key={t} style={{ flex: weights[t], backgroundColor: TIER_COLOR[t] }} /> : null))}
            </View>
            {[1, 2, 3, 4, 5].map((t) => (weights[t] ? (
              <View key={t} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.line }}>
                <Text style={{ color: TIER_COLOR[t], width: 22, fontWeight: '700' }}>{['', '●', '◆', '▲', '■', '★'][t]}</Text>
                <Text style={{ flex: 1, fontSize: 16 }}>{TIER_NAME[t]}</Text>
                <Text style={{ fontWeight: '700', fontSize: 16 }}>%{(weights[t] * 100).toFixed(2)}</Text>
              </View>
            ) : null))}
            <View style={[st.card, { marginTop: 12 }]}>
              <Text style={{ fontSize: 15 }}>Beklenen eşya değeri: <Text style={{ fontWeight: '700' }}>{money(rtp.ev)}</Text></Text>
              <Text style={{ fontSize: 15 }}>Kasa + anahtar: <Text style={{ fontWeight: '700' }}>{money(rtp.cost)}</Text></Text>
              <Text style={{ fontSize: 15, marginTop: 4, color: rtpColor(rtp.pct), fontWeight: '700' }}>Uzun vadede açılış maliyetinin yaklaşık %{Math.round(rtp.pct * 100)}'i geri döner.</Text>
              <Text style={[st.dim, { marginTop: 4 }]}>Satış komisyonu (%10) dahil, ortalama aşınma varsayımıyla hesaplanır. Tek açılış çok farklı çıkabilir.</Text>
            </View>
          </View>
        )}

        {tab === 'hist' && (
          <View style={st.card}>
            <Text style={{ fontSize: 16 }}>Bu kasadan açtığın: <Text style={{ fontWeight: '700' }}>{opened}</Text></Text>
            <Text style={{ fontSize: 16, marginTop: 4 }}>Tahmini harcama: <Text style={{ fontWeight: '700' }}>{money(opened * rtp.cost)}</Text></Text>
            <Text style={[st.dim, { marginTop: 8 }]}>Adil-oyun sayacı: {g.seeds.nonce}. Sonuçlar kayıtlı tohumlardan üretilir ve Profil'den doğrulanabilir.</Text>
          </View>
        )}
        <Text style={[st.dim, { textAlign: 'center', marginTop: 14 }]}>Sanal değer: gerçek paraya çevrilemez.</Text>
      </ScrollView>

      {/* Yapışkan eylem çubuğu */}
      <View style={{ backgroundColor: C.card, borderTopWidth: 1, borderColor: C.line, paddingHorizontal: GUT, paddingTop: 8, paddingBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-around', marginBottom: 8 }}>
          <Toggle label="Oto-Çevir" on={g.autoSpin} onPress={() => setOpt('autoSpin', !g.autoSpin)} />
          <Toggle label="Oto-Sat" note={g.autoSell.on ? `<${money(g.autoSell.max)} satılır` : undefined} on={g.autoSell.on} onPress={() => setAutoSell(!g.autoSell.on)} onGear={() => setAsOpen(true)} />
          <Toggle label="Hızlı" on={g.quick} onPress={() => setOpt('quick', !g.quick)} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: C.dim, fontWeight: '700', marginRight: 8 }}>ADET</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {counts.map((n) => {
              const ok = g.balance >= costFor(n) - 1e-9;
              const on = n === count;
              return (
                <Pressable key={n} accessibilityRole="button" accessibilityLabel={`${n} kasa`} accessibilityState={{ selected: on, disabled: busy }} disabled={busy} onPress={() => setCount(n)}
                  style={{ width: 46, height: 44, marginRight: 6, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? '#4f7a2a' : C.card2, opacity: ok ? 1 : 0.5, borderWidth: on ? 0 : 1, borderColor: C.line }}>
                  <Text style={{ fontWeight: '700', fontSize: 18 }}>{n}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
        {count > maxMulti ? <Text style={[st.dim, { marginBottom: 4 }]}>Toplu açma hızlı modda çalışır.</Text> : null}
        <Btn label={busy ? 'Açılıyor…' : count > 1 ? `${count} Kasa Aç` : 'Kilidi Aç'} icon={busy ? undefined : 'unlock'} disabled={busy} onPress={go} />
        <Text style={{ textAlign: 'center', color: canOpen ? C.dim : C.red, marginTop: 6, fontSize: 14 }}>
          {freeHave >= count ? `Ücretsiz kasa kullanılacak (kalan ${freeHave})` : `Anahtar + Kasa ${money(costFor(count))}${freeHave ? ` (${Math.min(freeHave, count)} ücretsiz)` : ''}`}
          {canOpen ? `  ·  Bakiye sonra ${money(g.balance - costFor(count))}` : `  ·  Eksik ${money(shortage)}`}
        </Text>
      </View>

      {/* Yükleme */}
      {load && (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
          <Animated.View style={{ transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }] }}>
            <Image source={{ uri: c.img }} style={{ width: 220, height: 160 }} contentFit="contain" />
          </Animated.View>
          <Text style={{ fontSize: 20, fontWeight: '700', marginTop: 20 }}>{c.name} yükleniyor…</Text>
          <Bar v={load.n / load.t} color={C.gold} h={8} style={{ width: '70%', marginTop: 12 }} />
          <Text style={{ color: C.dim, marginTop: 6 }}>{load.n} / {load.t}</Text>
        </View>
      )}

      {/* Sonuç */}
      <Sheet visible={!!sheet} onClose={closeSheet} full>
        <Text style={[st.h1, { textAlign: 'center' }]}>{sheetItems.length > 1 ? `${sheetItems.length} eşya çıktı` : sheetItems.length === 1 ? 'Çıkan eşya' : 'Otomatik satıldı'}</Text>
        {sheet && sheet.soldN > 0 && <Text style={{ textAlign: 'center', color: C.green, marginTop: 2 }}>{sheet.soldN} eşya otomatik satıldı  +{money(sheet.sold)}</Text>}
        <ScrollView style={{ marginVertical: 8 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: sheetItems.length === 1 ? 'center' : 'flex-start' }}>
            {sheetItems.map((it) => (
              <ItemTile key={it.uid} item={it} prices={prices} w={sheetItems.length === 1 ? W * 0.62 : (W - 52) / 2}
                selected={selSheet.has(it.uid)}
                onPress={() => setSelSheet((p) => { const n = new Set(p); n.has(it.uid) ? n.delete(it.uid) : n.add(it.uid); return n; })} />
            ))}
          </View>
        </ScrollView>
        {sheetItems.length > 0 && <Text style={{ textAlign: 'center', color: C.green, fontWeight: '700', fontSize: 18 }}>Toplam {money(sheetVal)}  ·  satmak için işaretle (seçim yoksa hepsi)</Text>}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          {sheetItems.length > 0 && (
            <Btn style={{ flex: 1 }} kind="gold" small hold={(selSheet.size ? selVal : sheetVal * 0.9) >= 30} label={selSheet.size ? `Seçilenleri sat ${money(selVal)}` : `Hepsini sat ${money(sheetVal * 0.9)}`}
              onPress={() => {
                const uids = selSheet.size ? [...selSheet] : sheetItems.map((i) => i.uid);
                sell(uids, prices); play('coin'); closeSheet();
              }} />
          )}
          <Btn style={{ flex: 1 }} small label="Devam" onPress={closeSheet} />
        </View>
      </Sheet>

      {/* Eşya bilgisi */}
      <Sheet visible={!!info} onClose={() => setInfo(null)}>
        {info && <SkinInfo skinId={info} c={c} prices={prices} />}
      </Sheet>

      {/* Bakiye yetersiz: çıkmaz sokak yok */}
      <Sheet visible={need} onClose={() => setNeed(false)}>
        <Text style={[st.h1, { textAlign: 'center' }]}>Eksik {money(shortage)}</Text>
        <Text style={[st.dim, { textAlign: 'center', marginVertical: 8, fontSize: 15 }]}>Bu kasa için bakiyen yetmiyor. Şunları deneyebilirsin:</Text>
        <View style={{ gap: 8 }}>
          <Btn kind="gold" label="Envanterden eşya sat" icon="tag" onPress={() => { setNeed(false); setTabNav('inv'); }} />
          <Btn kind="blue" label="Tıklayıcı ile para kazan" icon="target" onPress={() => { setNeed(false); openGameNav('click'); }} />
          <Btn kind="ghost" label="Daha ucuz kasa seç" icon="box" onPress={() => { setNeed(false); openCaseNav(null); }} />
        </View>
      </Sheet>

      {/* Nadir liste */}
      <Sheet visible={rare} onClose={() => setRare(false)} full>
        <Text style={[st.h1, { color: C.gold, marginBottom: 8 }]}>★ Nadir Özel Eşyalar</Text>
        <ScrollView>
          {rareGroups.map((sid) => (
            <Pressable key={sid} onPress={() => { setRare(false); setTimeout(() => setInfo(sid), 300); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
              <Image source={{ uri: SKINS[sid].img }} style={{ width: 64, height: 46 }} contentFit="contain" />
              <Text style={{ flex: 1, marginLeft: 10, fontSize: 16 }}>{SKINS[sid].n}</Text>
              <Text style={{ color: C.gold }}>{fmtRange(priceRange(sid, prices))}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </Sheet>

      {/* Oto-sat ayarı */}
      <Sheet visible={asOpen} onClose={() => setAsOpen(false)}>
        <Text style={[st.h1, { marginBottom: 6 }]}>Otomatik Tut / Sat</Text>
        <Text style={st.dim}>Bu tutarın altındaki eşyalar çıkınca otomatik satılır. Covert ve üstü her zaman tutulur.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 12 }}>
          {[0.1, 0.25, 0.5, 1, 2, 5, 10].map((v) => <Chip key={v} label={`<$${v}`} on={g.autoSell.max === v} onPress={() => setAutoSell(true, v)} />)}
        </View>
        <Btn label="Tamam" onPress={() => setAsOpen(false)} />
      </Sheet>
    </View>
  );
}

function ContentTile({ skinId, c, w, onPress }: { skinId: string; c: CaseDef; w: number; onPress: () => void }) {
  const prices = usePrices((x) => x.p);
  const s = SKINS[skinId];
  const col = TIER_COLOR[s.t];
  const [weapon, pattern] = s.n.includes(' | ') ? s.n.split(' | ') : [s.n, ''];
  const pr = priceRange(skinId, prices);
  const pct = dropPercent(c, skinId);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${s.n}, ${TIER_NAME[s.t]}, yüzde ${pct.toFixed(2)}`} onPress={onPress} style={{ width: w, padding: 3 }}>
      <View style={{ backgroundColor: C.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.line }}>
        <LinearGradient colors={[col + '55', 'transparent']} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '75%' }} />
        <View style={{ position: 'absolute', zIndex: 2, left: 5, top: 5, backgroundColor: '#05080ccc', borderRadius: 7, paddingHorizontal: 5 }}>
          <Text style={{ color: C.green, fontWeight: '700', fontSize: 12, lineHeight: 18 }}>{pr.est ? '~' : ''}{fmtRange(pr)}</Text>
        </View>
        <Image source={{ uri: s.img }} style={{ width: '100%', height: w * 0.6, marginTop: 18 }} contentFit="contain" />
        <View style={{ paddingHorizontal: 7, paddingBottom: 6 }}>
          <Text numberOfLines={1} style={{ fontWeight: '700', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.3 }}>{pattern || weapon}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text numberOfLines={1} style={{ color: C.dim, fontSize: 12, flexShrink: 1 }}>{pattern ? weapon : ''}</Text>
            <Text style={{ color: C.dim, fontWeight: '700', fontSize: 12, marginLeft: 4 }}>{pct >= 10 ? pct.toFixed(1) : pct.toFixed(2)}%</Text>
          </View>
        </View>
        <View style={{ height: 5, backgroundColor: col }} />
      </View>
    </Pressable>
  );
}

function SkinInfo({ skinId, c, prices }: { skinId: string; c: CaseDef; prices: any }) {
  const s = SKINS[skinId];
  const pct = dropPercent(c, skinId);
  return (
    <ScrollView>
      <Image source={{ uri: s.img }} style={{ width: '100%', height: 150 }} contentFit="contain" />
      <Text style={[st.h1, { textAlign: 'center' }]}>{s.n}{s.ph ? ` (${s.ph})` : ''}</Text>
      <Text style={{ color: TIER_COLOR[s.t], textAlign: 'center', fontWeight: '700' }}>{TIER_NAME[s.t]}  ·  düşme şansı %{pct.toFixed(3)}</Text>
      <View style={{ marginTop: 10 }}>
        {s.v ? (
          <Row l="Fiyat" v={fmt(basePrice(s, 0, false, prices))} />
        ) : (
          WEARS.map((w, i) => {
            const lo = i === 0 ? 0 : WEARS[i - 1].max;
            const a = Math.max(lo, s.min), b = Math.min(w.max, s.max);
            if (a >= b) return null;
            const mid = (a + b) / 2;
            return <Row key={w.name} l={`${w.name}  (${a.toFixed(2)}–${b.toFixed(2)})`} v={fmt(basePrice(s, mid, false, prices))} v2={s.st ? fmt(basePrice(s, mid, true, prices)) : undefined} />;
          })
        )}
        {s.st && <Text style={[st.dim, { marginTop: 4 }]}>İkinci fiyat: StatTrak™ (%10 ihtimal)</Text>}
      </View>
    </ScrollView>
  );
}
const fmt = (p: { p: number; est: boolean }) => `${p.est ? '~' : ''}${money(p.p)}`;
function Row({ l, v, v2 }: { l: string; v: string; v2?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderColor: C.line }}>
      <Text style={{ color: C.dim, flex: 1 }}>{l}</Text>
      <Text style={{ color: C.green, fontWeight: '700', marginRight: v2 ? 14 : 0 }}>{v}</Text>
      {v2 && <Text style={{ color: '#cf6a32', fontWeight: '700', width: 70, textAlign: 'right' }}>{v2}</Text>}
    </View>
  );
}
