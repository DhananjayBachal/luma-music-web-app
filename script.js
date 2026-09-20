const toast = document.querySelector('#toast');
const nowTitle = document.querySelector('#nowTitle');
const nowArtist = document.querySelector('#nowArtist');
const mainPlay = document.querySelector('#mainPlay');
const audioPlayer = document.querySelector('#audioPlayer');
const progressInput = document.querySelector('#progressInput');
const currentTime = document.querySelector('#currentTime');
const durationTime = document.querySelector('#durationTime');
const volumeInput = document.querySelector('#volumeInput');
const muteButton = document.querySelector('#muteButton');
const searchInput = document.querySelector('#searchInput');
let activeSong = 'Night Drive';
let lastVolume = 0.72;
let toastTimer;

const tracks = {
  'Night Drive': { artist: 'Luma Sessions', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  'Echoes in the Static': { artist: 'Maris Vale', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  'Golden Hour': { artist: 'Luma editorial mix', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  'Velvet Season': { artist: 'Maya Rue', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  'Soft Focus': { artist: 'Kieran Bloom', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  'Parallel Lines': { artist: 'Sol & The City', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
  'Afterimage': { artist: 'Nia Archive', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
  'Satellite Heart': { artist: 'Juniper Club', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
  'Blue Hour': { artist: 'Oren Lake', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
  'Anywhere With You': { artist: 'Maris Vale', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
  'Slow Motion': { artist: 'Paper Forest', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3' },
  'Moonlit Rooms': { artist: 'Violet Cinema', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3' },
  'Open Water': { artist: 'Atlas Park', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3' }
};
const songOrder = Object.keys(tracks);

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

function setPlaying(song, shouldPlay = true) {
  const track = tracks[song] || tracks['Night Drive'];
  activeSong = song;
  nowTitle.textContent = song;
  nowArtist.textContent = track.artist;
  if (audioPlayer.src !== track.source) {
    audioPlayer.src = track.source;
    audioPlayer.load();
  }
  document.querySelectorAll('[data-song]').forEach((item) => item.classList.toggle('playing', item.dataset.song === song));
  if (shouldPlay) {
    audioPlayer.play().then(() => showToast(`Playing ${song}`)).catch(() => showToast('Tap play to start audio'));
  }
}

document.querySelectorAll('[data-song]').forEach((button) => {
  button.addEventListener('click', () => setPlaying(button.dataset.song));
});

mainPlay.addEventListener('click', () => {
  if (audioPlayer.paused) {
    audioPlayer.play().catch(() => showToast('Audio could not be loaded'));
  } else {
    audioPlayer.pause();
  }
});

document.querySelector('#likeButton').addEventListener('click', (event) => {
  const liked = event.currentTarget.classList.toggle('liked');
  event.currentTarget.textContent = liked ? '♥' : '♡';
  showToast(liked ? 'Added to your favorites' : 'Removed from your favorites');
});

document.querySelector('#shuffleButton').addEventListener('click', () => {
  const song = songOrder[Math.floor(Math.random() * songOrder.length)];
  setPlaying(song);
});

document.querySelector('#previousButton').addEventListener('click', () => {
  const index = songOrder.indexOf(activeSong);
  setPlaying(songOrder[(index - 1 + songOrder.length) % songOrder.length]);
});

document.querySelector('#nextButton').addEventListener('click', () => {
  const index = songOrder.indexOf(activeSong);
  setPlaying(songOrder[(index + 1) % songOrder.length]);
});

audioPlayer.addEventListener('play', () => {
  mainPlay.textContent = 'Ⅱ';
  mainPlay.setAttribute('aria-label', 'Pause');
});

audioPlayer.addEventListener('pause', () => {
  mainPlay.textContent = '▶';
  mainPlay.setAttribute('aria-label', 'Play');
  showToast('Playback paused');
});

audioPlayer.addEventListener('loadedmetadata', () => {
  durationTime.textContent = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener('timeupdate', () => {
  const percentage = audioPlayer.duration ? (audioPlayer.currentTime / audioPlayer.duration) * 100 : 0;
  progressInput.value = percentage;
  currentTime.textContent = formatTime(audioPlayer.currentTime);
});

audioPlayer.addEventListener('ended', () => {
  const index = songOrder.indexOf(activeSong);
  setPlaying(songOrder[(index + 1) % songOrder.length]);
});

progressInput.addEventListener('input', () => {
  if (audioPlayer.duration) audioPlayer.currentTime = (Number(progressInput.value) / 100) * audioPlayer.duration;
});

volumeInput.addEventListener('input', () => {
  audioPlayer.volume = Number(volumeInput.value);
  if (audioPlayer.volume > 0) lastVolume = audioPlayer.volume;
  muteButton.textContent = audioPlayer.volume === 0 ? '×' : '⌁';
});

muteButton.addEventListener('click', () => {
  audioPlayer.volume = audioPlayer.volume === 0 ? lastVolume : 0;
  volumeInput.value = audioPlayer.volume;
  muteButton.textContent = audioPlayer.volume === 0 ? '×' : '⌁';
});

document.querySelector('#clearQueue').addEventListener('click', (event) => {
  document.querySelector('.queue-list').replaceChildren();
  event.currentTarget.textContent = 'Cleared';
});

searchInput.addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase().trim();
  document.querySelectorAll('.album-card').forEach((card) => {
    const matches = `${card.dataset.title} ${card.dataset.artist}`.toLowerCase().includes(query);
    card.hidden = !matches;
  });
});

audioPlayer.volume = Number(volumeInput.value);
setPlaying(activeSong, false);
