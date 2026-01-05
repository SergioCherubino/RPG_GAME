const sounds = {
  heal: "Assets/sfx/heal.mp3",
  hit: "Assets/sfx/hit.mp3",
  miss: "Assets/sfx/miss.mp3",
  levelUp: "Assets/sfx/levelup.mp3",
};

const audioPool = {};

export function playSound(name, volume = 0.6) {
  const src = sounds[name];
  if (!src) {
    console.warn(`🔇 Sound "${name}" not found`);
    return;
  }

  // cria o áudio apenas uma vez
  if (!audioPool[name]) {
    audioPool[name] = new Audio(src);
  }

  const audio = audioPool[name];
  audio.volume = volume;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}
