import { H as Hls } from './hls-dru42stk.js';

function setupPlayers() {
  document.querySelectorAll('.js-hls-player').forEach((video) => {
    const shell = video.closest('.video-shell');
    const overlay = shell ? shell.querySelector('[data-play-overlay]') : null;
    const hlsSource = video.dataset.hls;
    const mp4Source = video.dataset.mp4;
    let attached = false;

    function attachSource() {
      if (attached) return;
      attached = true;

      if (hlsSource && Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(hlsSource);
        hls.attachMedia(video);
      } else if (hlsSource && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsSource;
      } else if (mp4Source) {
        video.src = mp4Source;
      }
    }

    function playVideo() {
      attachSource();
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {
          video.controls = true;
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('play', () => {
      if (shell) shell.classList.add('is-playing');
    });
    video.addEventListener('pause', () => {
      if (shell) shell.classList.remove('is-playing');
    });
    video.addEventListener('loadedmetadata', () => {
      if (shell) shell.classList.add('is-ready');
    });
  });
}

setupPlayers();
