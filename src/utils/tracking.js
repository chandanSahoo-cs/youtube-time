import { saveWatchData } from "./saveWatchTime";

let video = null;
let watchStart = null;
let totalTime = 0;

export function setupTracking() {
  video = document.querySelector("video");
  if (!video) {
    console.log("Video element not found");
    return;
  }

  console.log("Tracking video:", document.title);
  watchStart = null;
  totalTime = 0;

  video.addEventListener("play", onPlay);
  video.addEventListener("pause", onPause);
  window.addEventListener("beforeunload", cleanupTracking);

  if (!video.paused && !video.ended) {
    console.log("Video is already being played");
    onPlay();
  }
}

export function cleanupTracking() {
  if (watchStart) {
    totalTime += Date.now() - watchStart;
    watchStart = null;
  }

  if (video) {
    saveWatchData(document.title, location.href, totalTime);
    video.removeEventListener("play", onPlay);
    video.removeEventListener("pause", onPause);
  }

  video = null;
  totalTime = 0;
}

function onPlay() {
  if (!watchStart) {
    watchStart = Date.now();
    console.log("Video started");
  }
}

function onPause() {
  if (watchStart) {
    totalTime += Date.now() - watchStart;
    watchStart = null;
    console.log("Video paused");
  }
}
