import React, { useEffect, useRef } from 'react';
import {
  Animated, Modal, Pressable, StyleProp, StyleSheet, Text as RNText, TextProps, TextStyle, View, ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Item, Prices, SKINS, TIER_COLOR, WEARS, itemName, itemPrice, wearIndex } from './engine/game';
import { T } from './theme';

export const C = T;
export const money = (n: number) =>
  '$' + (n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : n.toFixed(2));

// Özel yazı tipli Text (kalın → Rajdhani Bold)
export function Text({ style, ...p }: TextProps) {
  const f = StyleSheet.flatten(style) as TextStyle | undefined;
  const bold = f && (f.fontWeight === 'bold' || (f.fontWeight && +f.fontWeight >= 700));
  return <RNText {...p} style={[{ fontFamily: bold ? T.fontBold : T.font, color: T.text }, style, { fontWeight: undefined }]} />;
}

type BtnKind = 'primary' | 'gold' | 'ghost' | 'danger' | 'blue';
const KIND: Record<BtnKind, [string, string, string]> = {
  primary: [T.btnTop, T.btnBot, '#eaf7d8'],
  gold: ['#f6cf63', '#d19a22', '#1b1405'],
  ghost: [T.card2, T.card2, T.text],
  danger: ['#d9534f', '#a63a37', '#fff'],
  blue: ['#4d8fe0', '#3a6db0', '#fff'],
};

export function Btn(p: {
  label: string; onPress: () => void; kind?: BtnKind; disabled?: boolean; small?: boolean;
  style?: StyleProp<ViewStyle>; sub?: string; icon?: string;
}) {
  const [a, b, fg] = KIND[p.kind || 'primary'];
  return (
    <Pressable onPress={p.onPress} disabled={p.disabled} style={({ pressed }) => [{ opacity: p.disabled ? 0.4 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }, p.style]}>
      <LinearGradient colors={[a, b]} style={{ borderRadius: 12, minHeight: p.small ? 38 : 54, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderBottomWidth: 3, borderBottomColor: '#0006' }}>
        {p.icon ? <Text style={{ fontSize: p.small ? 15 : 20, marginRight: 8 }}>{p.icon}</Text> : null}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: fg, fontWeight: '700', fontSize: p.small ? 14 : 19, letterSpacing: 1.2, textTransform: 'uppercase' }}>{p.label}</Text>
          {p.sub ? <Text style={{ color: fg, fontSize: 11, opacity: 0.8 }}>{p.sub}</Text> : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export function Chip(p: { label: string; on?: boolean; onPress: () => void; icon?: string; dot?: boolean }) {
  return (
    <Pressable onPress={p.onPress} style={{ backgroundColor: p.on ? '#2f3b52' : T.card, borderRadius: 10, paddingHorizontal: 14, height: 36, justifyContent: 'center', marginRight: 6, borderWidth: 1, borderColor: p.on ? T.blue : T.line }}>
      <Text style={{ color: p.on ? '#fff' : T.dim, fontWeight: '700', fontSize: 14, letterSpacing: 0.5 }}>{p.icon ? p.icon + ' ' : ''}{p.label}</Text>
      {p.dot ? <View style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: T.green }} /> : null}
    </Pressable>
  );
}

export function Bar(p: { v: number; color?: string; h?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ height: p.h ?? 8, borderRadius: 6, backgroundColor: T.card2, overflow: 'hidden' }, p.style]}>
      <View style={{ height: '100%', width: `${Math.max(0, Math.min(1, p.v)) * 100}%`, backgroundColor: p.color || T.green, borderRadius: 6 }} />
    </View>
  );
}

export function Sheet(p: { visible: boolean; onClose: () => void; children: React.ReactNode; full?: boolean }) {
  return (
    <Modal visible={p.visible} transparent animationType="slide" onRequestClose={p.onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: '#000b', justifyContent: 'flex-end' }} onPress={p.onClose}>
        <Pressable onPress={() => {}} style={{ backgroundColor: T.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 14, maxHeight: p.full ? '94%' : '86%', borderTopWidth: 1, borderColor: T.line }}>
          <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: T.line, marginBottom: 10 }} />
          {p.children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Eşya kartı (envanter, sonuçlar)
export function ItemTile(p: {
  item: Item; prices: Prices; w: number; selected?: boolean; onPress?: () => void; onLongPress?: () => void; compact?: boolean;
}) {
  const sk = SKINS[p.item.skinId];
  const col = TIER_COLOR[sk.t];
  const pr = itemPrice(p.item, p.prices);
  const [weapon, pattern] = sk.n.includes(' | ') ? sk.n.split(' | ') : [sk.n, ''];
  const wear = sk.v ? '' : WEARS[wearIndex(p.item.float)].short;
  return (
    <Pressable onPress={p.onPress} onLongPress={p.onLongPress} style={{ width: p.w, padding: 3 }}>
      <View style={{ backgroundColor: T.card, borderRadius: 12, overflow: 'hidden', borderWidth: p.selected ? 2 : 0, borderColor: T.blue }}>
        <LinearGradient colors={[col + '33', 'transparent']} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '70%' }} />
        <View style={{ position: 'absolute', zIndex: 2, left: 5, top: 5, backgroundColor: '#000a', paddingHorizontal: 6, borderRadius: 6 }}>
          <Text style={{ color: T.green, fontWeight: '700', fontSize: 13 }}>{pr.est ? '~' : ''}{money(pr.p)}</Text>
        </View>
        {p.item.st && <Text style={{ position: 'absolute', zIndex: 2, right: 5, top: 4, color: '#cf6a32', fontWeight: '700', fontSize: 11 }}>ST™</Text>}
        <Image source={{ uri: sk.img }} style={{ width: '100%', height: p.w * 0.6, marginTop: 16 }} contentFit="contain" />
        <View style={{ paddingHorizontal: 7, paddingBottom: 5 }}>
          <Text numberOfLines={1} style={{ fontWeight: '700', fontSize: 14 }}>{pattern || weapon}{sk.ph ? ` (${sk.ph})` : ''}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text numberOfLines={1} style={{ color: T.dim, fontSize: 12, flex: 1 }}>{pattern ? weapon : ''}</Text>
            <Text style={{ color: T.dim, fontSize: 12 }}>{wear}{sk.v ? '' : ' ' + p.item.float.toFixed(3)}</Text>
          </View>
        </View>
        <View style={{ height: 4, backgroundColor: col }} />
      </View>
    </Pressable>
  );
}

// Üstten kayan bildirim
export function Toast({ text, id }: { text: string | null; id: number }) {
  const y = useRef(new Animated.Value(-80)).current;
  useEffect(() => {
    if (!text) return;
    y.setValue(-80);
    Animated.sequence([
      Animated.spring(y, { toValue: 0, useNativeDriver: true, bounciness: 8 }),
      Animated.delay(2600),
      Animated.timing(y, { toValue: -80, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [id]);
  if (!text) return null;
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 48, left: 16, right: 16, zIndex: 99, transform: [{ translateY: y }], backgroundColor: '#1d2a1d', borderColor: T.green, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center' }}>
      <Text style={{ color: T.green, fontWeight: '700', fontSize: 16 }}>{text}</Text>
    </Animated.View>
  );
}

export const st = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: '700' as const },
  h2: { fontSize: 17, fontWeight: '700' as const, letterSpacing: 1, color: T.dim, textTransform: 'uppercase' as const },
  card: { backgroundColor: T.card, borderRadius: 14, padding: 12 },
  dim: { color: T.dim, fontSize: 13 },
});
