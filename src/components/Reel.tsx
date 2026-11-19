import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Image } from 'expo-image';
import { SKINS, TIER_COLOR } from '../engine/game';
import { T } from '../theme';

type Props = {
  ids: string[]; winIndex: number; h: number; duration: number; run: number;
  onTick?: () => void; onDone: () => void;
};

// Yatay kayan kasa şeridi. `run` her arttığında bir tur başlatır.
export function Reel({ ids, winIndex, h, duration, run, onTick, onDone }: Props) {
  const x = useRef(new Animated.Value(0)).current;
  const [vw, setVw] = useState(0);
  const itemW = Math.round(h * 0.95);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const tickRef = useRef(onTick);
  tickRef.current = onTick;

  useEffect(() => {
    if (!run || !vw) return;
    const jitter = (Math.random() - 0.5) * (itemW - 18);
    const target = -(winIndex * itemW + itemW / 2 - vw / 2 + jitter);
    x.setValue(0);
    let last = -1;
    const id = x.addListener(({ value }) => {
      const i = Math.floor((-value + vw / 2) / itemW);
      if (i !== last) { last = i; tickRef.current?.(); }
    });
    const anim = Animated.timing(x, { toValue: target, duration, easing: Easing.bezier(0.08, 0.7, 0.12, 1), useNativeDriver: true });
    anim.start(({ finished }) => { x.removeListener(id); if (finished) doneRef.current(); });
    return () => { anim.stop(); x.removeListener(id); };
  }, [run, vw]);

  return (
    <View onLayout={(e) => setVw(e.nativeEvent.layout.width)} style={{ height: h, backgroundColor: T.card, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: T.line }}>
      <Animated.View style={{ flexDirection: 'row', height: h, transform: [{ translateX: x }] }}>
        {ids.map((id, i) => {
          const s = SKINS[id];
          return (
            <View key={i} style={{ width: itemW, height: h, padding: 3 }}>
              <View style={{ flex: 1, backgroundColor: T.card2, borderRadius: 8, borderBottomWidth: 4, borderBottomColor: TIER_COLOR[s.t], alignItems: 'center', justifyContent: 'center' }}>
                <Image source={{ uri: s.img }} style={{ width: itemW - 14, height: h - 22 }} contentFit="contain" />
              </View>
            </View>
          );
        })}
      </Animated.View>
      <View pointerEvents="none" style={{ position: 'absolute', left: '50%', marginLeft: -1.5, top: 0, bottom: 0, width: 3, backgroundColor: T.gold }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: '50%', marginLeft: -7, top: 0, width: 0, height: 0, borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 9, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: T.gold }} />
    </View>
  );
}
