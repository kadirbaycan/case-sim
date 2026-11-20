import React from 'react';
import Svg, { Path } from 'react-native-svg';

// Özgün çizgi ikon seti (24x24 ızgara, 2 px çizgi). Emoji yerine kullanılır.
const circ = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

const P = {
  depo: ['M3 10l9-6 9 6v10H3z', 'M9 20v-6h6v6'],
  bench: ['M14 6l4 4-9 9H5v-4z', 'M13 7l4 4'],
  search: ['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z', 'M20 20l-4-4'],
  box: ['M3 8l9-5 9 5v8l-9 5-9-5z', 'M3 8l9 5 9-5', 'M12 13v8'],
  bag: ['M5 8h14l-1 12H6z', 'M9 8V6a3 3 0 0 1 6 0v2'],
  swap: ['M4 8h13', 'M13 4l4 4-4 4', 'M20 16H7', 'M11 12l-4 4 4 4'],
  game: ['M6 8h12a3 3 0 0 1 3 3v3a3 3 0 0 1-5 2l-1-1H9l-1 1a3 3 0 0 1-5-2v-3a3 3 0 0 1 3-3z', 'M8 10.5v3', 'M6.5 12h3', 'M16 11.5h.01', 'M18 13h.01'],
  store: ['M4 9l1-5h14l1 5', 'M4 9a3 3 0 0 0 5.3 2 3 3 0 0 0 5.4 0 3 3 0 0 0 5.3-2', 'M5 13v7h14v-7'],
  user: [circ(12, 8, 4), 'M4 21a8 8 0 0 1 16 0'],
  lock: ['M6 11h12v9H6z', 'M8 11V8a4 4 0 0 1 8 0v3'],
  unlock: ['M6 11h12v9H6z', 'M8 11V8a4 4 0 0 1 7.5-2'],
  gear: [circ(12, 12, 3), 'M12 2v3', 'M12 19v3', 'M2 12h3', 'M19 12h3', 'M5 5l2 2', 'M17 17l2 2', 'M19 5l-2 2', 'M7 17l-2 2'],
  bolt: ['M13 2L4 14h7l-1 8 9-12h-7z'],
  check: ['M5 12l5 5 9-10'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
  back: ['M15 5l-7 7 7 7'],
  star: ['M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z'],
  clock: [circ(12, 12, 9), 'M12 7v5l3 2'],
  gift: ['M4 11h16v9H4z', 'M3 7h18v4H3z', 'M12 7v13', 'M12 7c-2 0-4-1-4-3s3-2 4 3', 'M12 7c2 0 4-1 4-3s-3-2-4 3'],
  coin: [circ(12, 12, 9), 'M12 7v10', 'M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4'],
  info: [circ(12, 12, 9), 'M12 11v6', 'M12 7.5h.01'],
  tag: ['M3 12V4h8l10 10-8 8z', 'M7.5 8h.01'],
  wheel: [circ(12, 12, 9), 'M12 3v18', 'M3 12h18', 'M5.6 5.6l12.8 12.8', 'M18.4 5.6L5.6 18.4'],
  chart: ['M4 20V4', 'M4 20h16', 'M8 16l4-5 3 3 5-7'],
  target: [circ(12, 12, 9), circ(12, 12, 5), 'M12 12h.01'],
  swords: ['M5 5l14 14', 'M19 5L5 19', 'M3 8l5-5', 'M21 8l-5-5'],
  fire: ['M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-9z'],
  heart: ['M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z'],
} as const;

export type IconName = keyof typeof P;

export function Icon({ name, size = 22, color = '#eef1f6', stroke = 2, fill }: {
  name: IconName; size?: number; color?: string; stroke?: number; fill?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {P[name].map((d, i) => (
        <Path key={i} d={d} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" fill={fill && i === 0 ? fill : 'none'} />
      ))}
    </Svg>
  );
}
