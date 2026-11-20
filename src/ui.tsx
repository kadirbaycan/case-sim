import React, { useEffect, useRef } from 'react';
import {
  Animated, Modal, Pressable, StyleProp, StyleSheet, Text as RNText, TextProps, TextStyle, View, ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Item, Prices, SKINS, TIER_COLOR, WEARS, itemName, itemPrice, wearIndex } from './engine/game';
import { T, TIER_SYM } from './theme';
import { Icon, IconName } from './icons';
import { useGame } from './store/game';
import { haptic } from './sound';

export const C = T;
export const money = (n: number) =>
  '$' + (n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : n.toFixed(2));

// Özel yazı tipli Text (kalın → Rajdhani Bold)
export function Text({ style, ...p }: TextProps) {
  const f = StyleSheet.flatten(style) as TextStyle | undefined;
  const w = f?.fontWeight ? (f.fontWeight === 'bold' ? 700 : +f.fontWeight) : 400;
  const fam = w >= 800 ? T.fontXL : w >= 600 ? T.fontBold : T.font;
  return <RNText {...p} style={[{ fontFamily: fam, color: T.text }, style, { fontWeight: undefined }]} />;
}

type BtnKind = 'primary' | 'gold' | 'ghost' | 'danger' | 'blue';
// [üst, alt, yazı, derinlik]
const KIND: Record<BtnKind, [string, string, string, string]> = {
  primary: ['#6c9a3c', '#4f7a2a', '#eaf7d8', '#00000066'],
  gold: ['#f6cf63', '#d19a22', '#1b1405', '#00000055'],
  ghost: [T.card2, T.card2, T.text, '#00000066'],
  danger: ['#d9534f', '#a63a37', '#fff', '#00000066'],
  blue: ['#4d8fe0', '#3a6db0', '#fff', '#00000066'],
};

// Avatar + seviye halkası (referans: yuvarlak avatar, altta eğik "SV" rozeti)
export function LevelRing({ level, p, size = 46, onPress }: { level: number; p: number; size?: number; onPress?: () => void }) {
  const r = (size - 6) / 2, c = 2 * Math.PI * r;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Profil, seviye ${level}`} onPress={onPress} style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={T.line} strokeWidth={3} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={T.green} strokeWidth={3} fill="none" strokeLinecap="round"
          strokeDasharray={`${c * Math.max(0.02, Math.min(1, p))} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <View style={{ position: 'absolute', left: 5, top: 5, right: 5, bottom: 5, borderRadius: size, backgroundColor: T.card2, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="user" size={size * 0.46} color={T.dim} />
      </View>
      <View style={{ position: 'absolute', left: size * 0.12, right: size * 0.12, bottom: -5, backgroundColor: T.green, borderRadius: 4, alignItems: 'center', transform: [{ skewX: '-12deg' }] }}>
        <Text style={{ color: T.amberInk, fontWeight: '700', fontSize: 11, lineHeight: 14 }}>SV. {level}</Text>
      </View>
    </Pressable>
  );
}

// Düz yüzey: ince çerçeve, gradyan/parlama yok
export function Card({ children, style, onPress, accent }: { children?: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accent?: string }) {
  const body = (
    <View style={[{ borderRadius: 14, borderWidth: 1, borderColor: accent || T.line, overflow: 'hidden', backgroundColor: T.card }, style]}>
      {children}
    </View>
  );
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress}>{body}</Pressable> : body;
}

export function Btn(p: {
  label: string; onPress: () => void; kind?: BtnKind; disabled?: boolean; small?: boolean;
  style?: StyleProp<ViewStyle>; sub?: string; icon?: IconName;
  hold?: boolean; // geri dönüşsüz/yüksek tutarlı işlem: 800 ms basılı tut
}) {
  const kind = p.kind || 'primary';
  const [a, b, fg, depth] = KIND[kind];
  const fill = useRef(new Animated.Value(0)).current;
  const timer = useRef<any>(null);
  const cancel = () => {
    clearTimeout(timer.current);
    Animated.timing(fill, { toValue: 0, duration: 120, useNativeDriver: false }).start();
  };
  const start = () => {
    if (!p.hold || p.disabled) return;
    haptic('light' as any);
    fill.setValue(0);
    Animated.timing(fill, { toValue: 1, duration: 800, useNativeDriver: false }).start();
    timer.current = setTimeout(() => { fill.setValue(0); haptic('heavy' as any); p.onPress(); }, 800);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  const label = (p.hold ? 'Basılı tut · ' : '') + p.label;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={p.sub ? `${label}, ${p.sub}` : label}
      accessibilityHint={p.hold ? 'Onay için basılı tutun' : undefined}
      accessibilityState={{ disabled: !!p.disabled }}
      accessibilityActions={p.hold ? [{ name: 'activate' }] : undefined}
      onAccessibilityAction={p.hold ? () => p.onPress() : undefined}
      onPress={p.hold ? undefined : p.onPress}
      onPressIn={start}
      onPressOut={p.hold ? cancel : undefined}
      disabled={p.disabled}
      style={({ pressed }) => [{ opacity: p.disabled ? 0.4 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }, p.style]}>
      <LinearGradient colors={[a, b]} style={{ borderRadius: 12, minHeight: p.small ? 44 : 54, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderBottomWidth: 3, borderBottomColor: depth, overflow: 'hidden', borderWidth: kind === 'ghost' ? 1 : 0, borderColor: T.line2 }}>
        {p.hold ? (
          <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#ffffff40', width: fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
        ) : null}
        {p.icon ? <View style={{ marginRight: 8 }}><Icon name={p.icon} size={p.small ? 16 : 20} color={fg} /></View> : null}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: fg, fontWeight: '700', fontSize: p.small ? 16 : 19, letterSpacing: 1.2, textTransform: 'uppercase' }}>{label}</Text>
          {p.sub ? <Text style={{ color: fg, fontSize: 11, opacity: 0.8 }}>{p.sub}</Text> : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export function Chip(p: { label: string; on?: boolean; onPress: () => void; icon?: IconName; dot?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={p.label} accessibilityState={{ selected: !!p.on }} hitSlop={{ top: 4, bottom: 4 }} onPress={p.onPress} style={{ backgroundColor: p.on ? '#2f3b52' : T.card, borderRadius: 18, paddingHorizontal: 14, height: 36, justifyContent: 'center', marginRight: 6, borderWidth: 1, borderColor: p.on ? T.blue : T.line }}>
      <Text style={{ color: p.on ? '#fff' : T.dim, fontWeight: '700', fontSize: 15, letterSpacing: 0.5 }}>{p.label}</Text>
      {p.dot ? <View style={{ position: 'absolute', top: 3, right: 3, width: 8, height: 8, borderRadius: 4, backgroundColor: T.green }} /> : null}
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
      <Pressable accessibilityLabel="Kapat" style={{ flex: 1, backgroundColor: '#000b', justifyContent: 'flex-end' }} onPress={p.onClose}>
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
    <Pressable accessibilityRole="button" accessibilityLabel={`${sk.n}${sk.ph ? ' ' + sk.ph : ''}, ${wear || 'özel'}${sk.v ? '' : ', float ' + p.item.float.toFixed(3)}, ${p.item.st ? 'StatTrak, ' : ''}${pr.est ? 'tahmini ' : ''}${pr.p.toFixed(2)} dolar`} accessibilityState={{ selected: !!p.selected }} onPress={p.onPress} onLongPress={p.onLongPress} style={{ width: p.w, padding: 3 }}>
      <View style={{ backgroundColor: T.card, borderRadius: 12, overflow: 'hidden', borderWidth: p.selected ? 2 : 1, borderColor: p.selected ? T.amber : T.line }}>
        <LinearGradient colors={[col + '40', 'transparent']} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '75%' }} />
        <View style={{ position: 'absolute', zIndex: 2, left: 5, top: 5, backgroundColor: '#05080ccc', paddingHorizontal: 6, borderRadius: 8, borderWidth: 1, borderColor: T.line }}>
          <Text style={{ color: T.green, fontWeight: '700', fontSize: 14 }}>{pr.est ? '~' : ''}{money(pr.p)}</Text>
        </View>
        {p.selected ? <View style={{ position: 'absolute', zIndex: 3, right: 5, bottom: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: T.amber, alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={14} color="#000" stroke={3} /></View> : null}
        {p.item.st && <Text style={{ position: 'absolute', zIndex: 2, right: 5, top: 4, color: '#cf6a32', fontWeight: '700', fontSize: 11 }}>ST™</Text>}
        <Image source={{ uri: sk.img }} style={{ width: '100%', height: p.w * 0.6, marginTop: 16 }} contentFit="contain" />
        <View style={{ paddingHorizontal: 7, paddingBottom: 5 }}>
          <Text numberOfLines={1} style={{ fontWeight: '700', fontSize: 15, textTransform: 'uppercase', letterSpacing: 0.4 }}><Text style={{ color: col, fontSize: 12 }}>{TIER_SYM[sk.t]} </Text>{pattern || weapon}{sk.ph ? ` (${sk.ph})` : ''}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text numberOfLines={1} style={{ color: T.dim, fontSize: 12, flex: 1 }}>{pattern ? weapon : ''}</Text>
            <Text style={{ color: T.dim, fontSize: 12 }}>{wear}{sk.v ? '' : ' ' + p.item.float.toFixed(3)}</Text>
          </View>
        </View>
        <View style={{ height: 5, backgroundColor: col }} />
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
    <Animated.View pointerEvents="none" accessibilityLiveRegion="polite" accessibilityRole="alert" style={{ position: 'absolute', top: 48, left: 16, right: 16, zIndex: 99, transform: [{ translateY: y }], backgroundColor: '#1d2a1d', borderColor: T.green, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center' }}>
      <Text style={{ color: T.green, fontWeight: '700', fontSize: 16 }}>{text}</Text>
    </Animated.View>
  );
}

// Etiketli anahtar: renk + "AÇIK/KAPALI" sözcüğü + isteğe bağlı durum açıklaması
export function Toggle(p: { label: string; on: boolean; onPress: () => void; onGear?: () => void; note?: string }) {
  return (
    <View style={{ alignItems: 'center', minWidth: 72 }}>
      <Pressable accessibilityRole="switch" accessibilityLabel={p.label} accessibilityState={{ checked: p.on }} hitSlop={{ top: 8, bottom: 4, left: 4, right: 4 }}
        onPress={p.onPress} style={{ width: 52, height: 28, borderRadius: 14, backgroundColor: p.on ? '#4f7a2a' : T.card2, borderWidth: 1, borderColor: p.on ? '#6c9a3c' : T.line, justifyContent: 'center', paddingHorizontal: 3 }}>
        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: p.on ? '#d8f2b6' : '#566', alignSelf: p.on ? 'flex-end' : 'flex-start' }} />
      </Pressable>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
        <Text style={{ color: p.on ? T.green : T.dim, fontWeight: '700', fontSize: 13 }}>{p.label} {p.on ? 'AÇIK' : 'KAPALI'}</Text>
        {p.onGear && (
          <Pressable accessibilityRole="button" accessibilityLabel={`${p.label} ayarları`} hitSlop={12} onPress={p.onGear} style={{ marginLeft: 4 }}>
            <Icon name="gear" size={16} color={T.dim} />
          </Pressable>
        )}
      </View>
      {p.note ? <Text style={{ color: T.dim, fontSize: 11 }}>{p.note}</Text> : null}
    </View>
  );
}

export function Segmented<K extends string>(p: { items: { k: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', backgroundColor: T.card, borderRadius: 12, padding: 3, height: 44 }}>
      {p.items.map((i) => {
        const on = i.k === p.value;
        return (
          <Pressable key={i.k} accessibilityRole="tab" accessibilityLabel={i.label} accessibilityState={{ selected: on }} onPress={() => p.onChange(i.k)}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: on ? T.card2 : 'transparent', borderBottomWidth: on ? 2 : 0, borderBottomColor: T.green }}>
            <Text style={{ fontWeight: '700', fontSize: 15, color: on ? T.text : T.dim, letterSpacing: 0.5 }}>{i.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Nadirlik: renk + sembol (+ ad)
export function RarityBadge({ tier, name }: { tier: number; name?: boolean }) {
  const col = (require('./engine/game') as typeof import('./engine/game')).TIER_COLOR[tier];
  const nm = (require('./engine/game') as typeof import('./engine/game')).TIER_NAME[tier];
  return (
    <View accessible accessibilityLabel={nm} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: col + '33', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1, alignSelf: 'flex-start' }}>
      <Text style={{ color: col, fontSize: 12, fontWeight: '700' }}>{TIER_SYM[tier]}{name ? ' ' + nm : ''}</Text>
    </View>
  );
}

// Fiyat: "~" tahmini, eski veri ipucu
export function PriceText({ v, est, style }: { v: number; est?: boolean; style?: StyleProp<TextStyle> }) {
  return (
    <Text accessibilityLabel={`${est ? 'tahmini ' : ''}${v.toFixed(2)} dolar`} style={[{ color: T.green, fontWeight: '700', fontSize: 15 }, style]}>
      {est ? '~' : ''}{money(v)}
    </Text>
  );
}

export function EmptyState(p: { icon: IconName; text: string; action?: { label: string; onPress: () => void } }) {
  return (
    <View style={{ alignItems: 'center', padding: 28 }}>
      <Icon name={p.icon} size={48} color={T.dim} />
      <Text style={{ color: T.dim, fontSize: 16, textAlign: 'center', marginTop: 10 }}>{p.text}</Text>
      {p.action ? <Btn small label={p.action.label} onPress={p.action.onPress} style={{ marginTop: 14 }} /> : null}
    </View>
  );
}

// 10 parçalı geri dönüş ölçeği
export function RtpMeter({ pct, color }: { pct: number; color: string }) {
  const n = Math.max(0, Math.min(10, Math.round(pct * 10)));
  return (
    <View accessible accessibilityLabel={`Tahmini geri dönüş yüzde ${Math.round(pct * 100)}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ flexDirection: 'row', gap: 2 }}>
        {Array.from({ length: 10 }, (_, i) => <View key={i} style={{ width: 7, height: 6, borderRadius: 2, backgroundColor: i < n ? color : T.line2 }} />)}
      </View>
      <Text style={{ color, fontWeight: '700', fontSize: 13 }}>~%{Math.round(pct * 100)}</Text>
    </View>
  );
}

// Satış sonrası 5 sn "Geri al"
export function UndoBar() {
  const undo = useGame((x) => x.undo);
  const undoSell = useGame((x) => x.undoSell);
  const clear = useGame((x) => x.clearUndo);
  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(clear, Math.max(0, undo.ts + 5000 - Date.now()));
    return () => clearTimeout(t);
  }, [undo?.ts]);
  if (!undo) return null;
  return (
    <View accessibilityLiveRegion="polite" style={{ position: 'absolute', left: 16, right: 16, bottom: 88, zIndex: 98, backgroundColor: T.card2, borderColor: T.line, borderWidth: 1, borderRadius: 12, paddingLeft: 14, paddingRight: 6, minHeight: 52, flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ flex: 1, fontWeight: '700', fontSize: 15 }}>{undo.items.length} eşya satıldı +{money(undo.total)}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Satışı geri al" onPress={() => { undoSell(); haptic('light' as any); }} style={{ minHeight: 44, paddingHorizontal: 14, justifyContent: 'center' }}>
        <Text style={{ color: T.gold, fontWeight: '700', fontSize: 16, letterSpacing: 1 }}>GERİ AL</Text>
      </Pressable>
    </View>
  );
}

export const st = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: '700' as const },
  h2: { fontSize: 16, fontWeight: '700' as const, letterSpacing: 2.4, color: T.dim, textTransform: 'uppercase' as const },
  card: { backgroundColor: T.card, borderRadius: 18, padding: 12, borderWidth: 1, borderColor: T.line },
  dim: { color: T.dim, fontSize: 13 },
});
