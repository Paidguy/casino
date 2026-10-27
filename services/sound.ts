import { audio } from './audio';

export const sound = {
  click: () => audio.playClick(),
  bet: () => audio.playBet(),
  gem: (step = 1) => audio.playTileSafe(step),
  win: () => audio.playWin(),
  lose: () => audio.playLoss(),
  tick: () => audio.playSpin(),
  card: () => audio.playBet(),
};
