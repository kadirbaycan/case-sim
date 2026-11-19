import React, { useMemo, useState } from 'react';
import { Dimensions, FlatList, Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { SKINS, TIER_COLOR, TIER_NAME, WEARS, Item, basePrice, itemPrice, tradeFloat, tradeOutcomes, wearIndex } from '../engine/game';
import { useGame } from '../store/game';
import { usePrices } from '../store/prices';
import { levelFromXp } from '../engine/game';
import { play, winSfx, haptic } from '../sound';
import { Btn, C, ItemTile, Sheet, Text, money, st } from '../ui';
import { Icon } from '../icons';

const W = Dimensions.get('window').width;

export default function Trade() {
  const inv = useGame((x) => x.inv);
  const xp = useGame((x) => x.xp);
  const trade = useGame((x) => x.trade);
  const prices = usePrices((x) => x.p);
  const [chosen, setChosen] = useState<string[]>([]);
  const [pick, setPick] = useState(false);
  const [out, setOut] = useState<Item | null>(null);

  if (levelFromXp(xp).level < 3) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Icon name="lock" size={44} color="#8a93a3" /><Text style={{ fontWeight: '700', fontSize: 20 }}>Seviye 3'te açılır</Text></View>;
  }

  const ins = chosen.map((u) => inv.find((i) => i.uid === u)).filter(Boolean) as Item[];
  const first = ins[0];
  const tier = first ? SKINS[first.skinId].t : 0;
  const outcomes = useMemo(() => (ins.length === 10 ? tradeOutcomes(ins) : []), [chosen, inv]);
  const inVal = ins.reduce((a, i) => a + itemPrice(i, prices).p, 0);

  const eligible = (i: Item) => {
    const sk = SKINS[i.skinId];
    if (sk.t < 1 || sk.t > 3 || sk.v) return false;
    if (!first) return true;
    return sk.t === tier && i.st === first.st;
  };
  const autofill = () => {
    for (let t = 1; t <= 3; t++) for (const s of [false, true]) {
      const pool = inv.filter((i) => SKINS[i.skinId].t === t && i.st === s && !SKINS[i.skinId].v).sort((a, b) => itemPrice(a, prices).p - itemPrice(b, prices).p);
      if (pool.length >= 10) { setChosen(pool.slice(0, 10).map((i) => i.uid)); return; }
    }
  };
  const exec = () => {
    const r = trade(chosen);
    if (!r) return;
    setChosen([]); setOut(r); play(winSfx(SKINS[r.skinId].t)); haptic('success');
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 40 }}>
      <Text style={st.h2}>Takas Kontratı · {ins.length}/10 {first ? `· ${TIER_NAME[tier]}${first.st ? ' ST' : ''}` : ''}</Text>
      <Text style={[st.dim, { marginVertical: 6 }]}>10 eşyayı aynı nadirlikten ver, bir üst nadirlikten 1 eşya al. Çıkış float'ı girişlerin ortalamasına göre hesaplanır.</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
        <Btn style={{ flex: 1 }} small label="Eşya seç" onPress={() => setPick(true)} />
        <Btn style={{ flex: 1 }} small kind="ghost" label="Otomatik" onPress={autofill} />
        <Btn small kind="ghost" label="Temizle" onPress={() => setChosen([])} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {Array.from({ length: 10 }, (_, i) => {
          const it = ins[i];
          return (
            <Pressable key={i} onPress={() => it && setChosen(chosen.filter((u) => u !== it.uid))} style={{ width: '20%', aspectRatio: 1, padding: 3 }}>
              <View style={{ flex: 1, backgroundColor: C.card, borderRadius: 10, borderBottomWidth: 3, borderBottomColor: it ? TIER_COLOR[SKINS[it.skinId].t] : C.line, alignItems: 'center', justifyContent: 'center' }}>
                {it ? <Image source={{ uri: SKINS[it.skinId].img }} style={{ width: '90%', height: '90%' }} contentFit="contain" /> : <Text style={{ color: C.dim, fontSize: 22 }}>+</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
      {ins.length === 10 && (
        <View style={{ marginTop: 10 }}>
          <Text style={st.dim}>Giriş değeri {money(inVal)}</Text>
          <Text style={[st.h2, { marginVertical: 6 }]}>Olası sonuçlar ({TIER_NAME[tier + 1]})</Text>
          {outcomes.slice(0, 12).map((o) => {
            const sk = SKINS[o.skinId];
            const f = tradeFloat(ins, sk);
            const p = basePrice(sk, f, false, prices);
            return (
              <View key={o.skinId} style={[st.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 5, padding: 8 }]}>
                <Image source={{ uri: sk.img }} style={{ width: 60, height: 44 }} contentFit="contain" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={{ fontWeight: '700' }}>{sk.n}</Text>
                  <Text style={st.dim}>{sk.v ? '' : `${WEARS[wearIndex(f)].short} ${f.toFixed(4)}`}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: C.green, fontWeight: '700' }}>{p.est ? '~' : ''}{money(p.p)}</Text>
                  <Text style={st.dim}>%{(o.prob * 100).toFixed(1)}</Text>
                </View>
              </View>
            );
          })}
          <Btn kind="gold" label="Kontratı İmzala" onPress={exec} style={{ marginTop: 8 }} />
        </View>
      )}

      <Sheet visible={pick} onClose={() => setPick(false)} full>
        <Text style={st.h1}>Eşya seç ({ins.length}/10)</Text>
        <Text style={st.dim}>Aynı nadirlik ve StatTrak durumu. Covert ve üstü girmez.</Text>
        <FlatList
          style={{ marginVertical: 8 }} data={inv.filter(eligible)} numColumns={2} keyExtractor={(i) => i.uid}
          renderItem={({ item }) => (
            <ItemTile item={item} prices={prices} w={(W - 52) / 2} selected={chosen.includes(item.uid)}
              onPress={() => setChosen((c) => (c.includes(item.uid) ? c.filter((u) => u !== item.uid) : c.length < 10 ? [...c, item.uid] : c))} />
          )}
        />
        <Btn label="Tamam" onPress={() => setPick(false)} />
      </Sheet>

      <Sheet visible={!!out} onClose={() => setOut(null)}>
        <Text style={[st.h1, { textAlign: 'center', marginBottom: 8 }]}>Kontrat Sonucu</Text>
        {out && <View style={{ alignItems: 'center' }}><ItemTile item={out} prices={prices} w={W * 0.6} /></View>}
        <Btn label="Tamam" onPress={() => setOut(null)} style={{ marginTop: 12 }} />
      </Sheet>
    </ScrollView>
  );
}
