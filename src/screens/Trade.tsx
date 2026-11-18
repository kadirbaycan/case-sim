import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SKINS, TIER_COLOR, TIER_NAME, WEARS, Item, itemPrice, tradeFloat, tradeOutcomes, wearIndex, basePrice } from '../engine/game';
import { useGame } from '../store/game';
import { usePrices } from '../store/prices';
import { play, winSfx, haptic } from '../sound';
import { Btn, C, ItemCard, money, s } from '../ui';

export default function Trade() {
  const inv = useGame((x) => x.inv);
  const trade = useGame((x) => x.trade);
  const prices = usePrices((x) => x.p);
  const [chosen, setChosen] = useState<string[]>([]);
  const [pick, setPick] = useState(false);
  const [out, setOut] = useState<Item | null>(null);

  const ins = chosen.map((u) => inv.find((i) => i.uid === u)).filter(Boolean) as Item[];
  const first = ins[0];
  const tier = first ? SKINS[first.skinId].t : 0;
  const outcomes = useMemo(() => (ins.length === 10 ? tradeOutcomes(ins) : []), [chosen, inv]);
  const inVal = ins.reduce((a, i) => a + itemPrice(i, prices).p, 0);

  const eligible = (i: Item) => {
    const sk = SKINS[i.skinId];
    if (sk.t < 1 || sk.t > 3 || sk.v) return false; // Covert ve üstü takasa girmez
    if (!first) return true;
    return sk.t === tier && i.st === first.st;
  };

  const autofill = () => {
    for (let t = 1; t <= 3; t++) {
      for (const st of [false, true]) {
        const pool = inv.filter((i) => SKINS[i.skinId].t === t && i.st === st && !SKINS[i.skinId].v).sort((a, b) => itemPrice(a, prices).p - itemPrice(b, prices).p);
        if (pool.length >= 10) { setChosen(pool.slice(0, 10).map((i) => i.uid)); return; }
      }
    }
  };

  const exec = () => {
    const r = trade(chosen);
    if (!r) return;
    setChosen([]);
    setOut(r);
    play(winSfx(SKINS[r.skinId].t));
    haptic('success');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 8 }}>
      <Text style={s.h2}>Takas Kontratı · {ins.length}/10 {first ? `· ${TIER_NAME[tier]}${first.st ? ' StatTrak' : ''}` : ''}</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        <Btn style={{ flex: 1 }} small label="Eşya seç" onPress={() => setPick(true)} />
        <Btn style={{ flex: 1 }} small color={C.card2} label="Otomatik (en ucuz 10)" onPress={autofill} />
        <Btn small color={C.card2} label="Temizle" onPress={() => setChosen([])} />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {Array.from({ length: 10 }, (_, i) => {
          const it = ins[i];
          return (
            <Pressable key={i} onPress={() => it && setChosen(chosen.filter((u) => u !== it.uid))} style={{ width: '20%', aspectRatio: 1, padding: 2 }}>
              <View style={{ flex: 1, backgroundColor: C.card, borderRadius: 8, borderWidth: 1, borderColor: it ? TIER_COLOR[SKINS[it.skinId].t] : C.line, alignItems: 'center', justifyContent: 'center' }}>
                {it ? <Image source={{ uri: SKINS[it.skinId].img }} style={{ width: '90%', height: '90%' }} contentFit="contain" /> : <Text style={{ color: C.dim }}>+</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>

      {ins.length === 10 && (
        <>
          <Text style={[s.p, { marginVertical: 6 }]}>
            Giriş değeri {money(inVal)} · ort. normalize float → çıkış floatı oranlı hesaplanır (CS2 formülü)
          </Text>
          <Text style={s.h2}>Olası sonuçlar ({TIER_NAME[tier + 1]})</Text>
          <FlatList
            data={outcomes.slice(0, 12)} keyExtractor={(o) => o.skinId}
            renderItem={({ item: o }) => {
              const sk = SKINS[o.skinId];
              const f = tradeFloat(ins, sk);
              const p = basePrice(sk, f, false, prices);
              return (
                <View style={[s.box, { flexDirection: 'row', alignItems: 'center', padding: 6, marginBottom: 4 }]}>
                  <Image source={{ uri: sk.img }} style={{ width: 54, height: 40 }} contentFit="contain" />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={{ color: C.text, fontSize: 12 }}>{sk.n}</Text>
                    <Text style={s.sm}>{sk.v ? '' : `${WEARS[wearIndex(f)].short} ${f.toFixed(4)}`}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: C.green, fontWeight: '700' }}>{p.est ? '~' : ''}{money(p.p)}</Text>
                    <Text style={s.sm}>%{(o.prob * 100).toFixed(1)}</Text>
                  </View>
                </View>
              );
            }}
          />
          <Btn label="KONTRATI İMZALA" color={C.gold} onPress={exec} />
        </>
      )}

      <Modal visible={pick} animationType="slide" onRequestClose={() => setPick(false)}>
        <View style={{ flex: 1, backgroundColor: C.bg, padding: 8 }}>
          <Text style={s.h1}>Eşya seç ({ins.length}/10)</Text>
          <Text style={s.p}>Aynı nadirlik ve aynı StatTrak durumu. Covert ve üstü girmez.</Text>
          <FlatList
            data={inv.filter(eligible)} numColumns={2} keyExtractor={(i) => i.uid}
            renderItem={({ item }) => (
              <ItemCard
                item={item} prices={prices} selected={chosen.includes(item.uid)}
                onPress={() => setChosen((c) => (c.includes(item.uid) ? c.filter((u) => u !== item.uid) : c.length < 10 ? [...c, item.uid] : c))}
              />
            )}
          />
          <Btn label="Tamam" onPress={() => setPick(false)} />
        </View>
      </Modal>

      <Modal visible={!!out} transparent animationType="fade" onRequestClose={() => setOut(null)}>
        <View style={{ flex: 1, backgroundColor: '#000d', justifyContent: 'center', padding: 16 }}>
          <View style={{ backgroundColor: C.bg, borderRadius: 14, padding: 14 }}>
            <Text style={[s.h1, { textAlign: 'center', marginBottom: 8 }]}>Kontrat Sonucu</Text>
            {out && <ItemCard item={out} prices={prices} />}
            <Btn label="Tamam" onPress={() => setOut(null)} style={{ marginTop: 10 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
