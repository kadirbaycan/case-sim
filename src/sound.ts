import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useGame } from './store/game';

const files = {
  tick: require('../assets/sfx/tick.wav'),
  unlock: require('../assets/sfx/unlock.wav'),
  winLow: require('../assets/sfx/winLow.wav'),
  winMid: require('../assets/sfx/winMid.wav'),
  winRare: require('../assets/sfx/winRare.wav'),
  winGold: require('../assets/sfx/winGold.wav'),
  lose: require('../assets/sfx/lose.wav'),
  coin: require('../assets/sfx/coin.wav'),
};
export type Sfx = keyof typeof files;

const pool: Partial<Record<Sfx, AudioPlayer[]>> = {};
const idx: Partial<Record<Sfx, number>> = {};

function get(name: Sfx): AudioPlayer {
  if (!pool[name]) {
    const n = name === 'tick' ? 4 : 1;
    pool[name] = Array.from({ length: n }, () => createAudioPlayer(files[name]));
    idx[name] = 0;
  }
  const arr = pool[name]!;
  const i = idx[name]!;
  idx[name] = (i + 1) % arr.length;
  return arr[i];
}

export function play(name: Sfx) {
  if (!useGame.getState().sfx) return;
  try {
    const p = get(name);
    p.seekTo(0);
    p.play();
  } catch {}
}

export const winSfx = (tier: number): Sfx => (['winLow', 'winLow', 'winMid', 'winRare', 'winRare', 'winGold'] as Sfx[])[tier];

export function haptic(kind: 'light' | 'success' | 'heavy') {
  if (!useGame.getState().sfx) return;
  try {
    if (kind === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (kind === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {}
}
