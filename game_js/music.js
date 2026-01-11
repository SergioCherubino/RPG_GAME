let bgm = null;

export function playBGM(src, volume) {
  // se já estiver tocando, não reinicia
  if (bgm && !bgm.paused) return;

  bgm = new Audio(src);
  bgm.loop = true;
  bgm.volume = volume;

  // evita erro de autoplay em alguns browsers
  bgm.play().catch(() => {
    console.warn("🎵 BGM aguardando interação do usuário");
  });
}

export function stopBGM() {
  if (!bgm) return;
  bgm.pause();
  bgm.currentTime = 0;
}

export function setBGMVolume(value) {
  if (bgm) bgm.volume = value;
}
