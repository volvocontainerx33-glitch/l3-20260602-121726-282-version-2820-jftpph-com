import { H as Hls } from "./hls.js";

function setupPlayer(shell) {
  var video = shell.querySelector("video");
  var layer = shell.querySelector(".play-layer");
  if (!video) {
    return;
  }
  var src = video.getAttribute("data-src");
  var attached = false;
  var hls = null;

  function attach() {
    if (attached || !src) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }
  }

  function play() {
    attach();
    if (layer) {
      layer.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {
        if (layer) {
          layer.classList.remove("is-hidden");
        }
      });
    }
  }

  if (layer) {
    layer.addEventListener("click", play);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener("play", function () {
    if (layer) {
      layer.classList.add("is-hidden");
    }
  });
  video.addEventListener("emptied", function () {
    if (hls) {
      hls.destroy();
      hls = null;
      attached = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(setupPlayer);
});
