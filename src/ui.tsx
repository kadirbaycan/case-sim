import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Item, SKINS, TIER_COLOR, WEARS, itemName, itemPrice, wearIndex, Prices } from './engine/game';

export const C = {
  bg: '#0d1117', card: '#161b22', card2: '#1f2630', line: '#2b3340',
  text: '#e6edf3', dim: '#8b949e', green: '#3fb950', red: '#f85149', accent: '#58a6ff', gold: '#ffd700',
};

export const money = (n: number) => '$' + (n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : n.toFixed(2));

export function Btn(p: { label: string; onPress: () => void; color?: string; disabled?: boolean; small?: boolean; style?: ViewStyle }) {
  return (
    <Pressable
      onPress={p.onPress}
      disabled={p.disabled}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: p.color || C.accent, opacity: p.disabled ? 0.4 : pressed ? 0.8 : 1, paddingVertical: p.small ? 8 : 13 },
        p.style,
      ]}
    >
      <Text style={[s.btnT, p.small && { fontSize: 13 }]}>{p.label}</Text>
    </Pressable>
  );
}

export function Chip(p: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={p.onPress} style={[s.chip, p.on && { backgroundColor: C.accent, borderColor: C.accent }]}>
      <Text style={{ color: p.on ? '#000' : C.text, fontSize: 12, fontWeight: '600' }}>{p.label}</Text>
    </Pressable>
  );
}

export function ItemCard(p: {
  item: Item; prices: Prices; selected?: boolean; onPress?: () => void; onLongPress?: () => void; width?: number;
}) {
  const sk = SKINS[p.item.skinId];
  const col = TIER_COLOR[sk.t];
  const pr = itemPrice(p.item, p.prices);
  const w = sk.v ? '' : WEARS[wearIndex(p.item.float)].short;
  return (
    <Pressable
      onPress={p.onPress}
      onLongPress={p.onLongPress}
      style={[s.card, { borderColor: p.selected ? C.accent : col, width: p.width, borderWidth: p.selected ? 3 : 1.5 }]}
    >
      <View style={{ height: 3, backgroundColor: col, marginBottom: 4, borderRadius: 2 }} />
      <Image source={{ uri: sk.img }} style={{ width: '100%', height: 70 }} contentFit="contain" />
      <Text numberOfLines={2} style={[s.nm, p.item.st && { color: '#cf6a32' }]}>{itemName(p.item)}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
        <Text style={s.sm}>{w}{sk.v ? '' : ' ' + p.item.float.toFixed(4)}</Text>
        <Text style={[s.sm, { color: C.green, fontWeight: '700' }]}>{pr.est ? '~' : ''}{money(pr.p)}</Text>
      </View>
    </Pressable>
  );
}

export const s = StyleSheet.create({
  btn: { borderRadius: 10, alignItems: 'center', paddingHorizontal: 16 },
  btnT: { color: '#000', fontWeight: '800', fontSize: 15 },
  chip: { borderWidth: 1, borderColor: C.line, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, backgroundColor: C.card },
  card: { backgroundColor: C.card, borderRadius: 10, padding: 6, margin: 4, flex: 1 },
  nm: { color: C.text, fontSize: 11, fontWeight: '600', minHeight: 28 },
  sm: { color: C.dim, fontSize: 10 },
  h1: { color: C.text, fontSize: 20, fontWeight: '800' },
  h2: { color: C.text, fontSize: 15, fontWeight: '700', marginBottom: 6 },
  p: { color: C.dim, fontSize: 13 },
  box: { backgroundColor: C.card, borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: C.line },
});
