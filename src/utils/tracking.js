import { saveWatchData } from "./saveWatchTime";

let video = null;
let watchStart = null;
let totalTime = 0;
let channelName = "";

export function setupTracking() {
  video = document.querySelector("video");
  let channelElement = document.querySelector("ytd-channel-name a");
  channelName = channelElement?.textContent.trim();
  if (!video) {
    console.log("Video element not found");
    return;
  }

  let titleElement = document.querySelectorAll("div#title")[2];
  let videoTitle = titleElement ? titleElement.textContent.trim() : "";

  console.log("Tracking video:", videoTitle);
  console.log("Channel name: ", channelName);
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
    let titleElement = document.querySelectorAll("div#title")[2];
    let videoTitle = titleElement ? titleElement.textContent.trim() : "";
    saveWatchData(document.title, location.href, totalTime, channelName);
    video.removeEventListener("play", onPlay);
    video.removeEventListener("pause", onPause);
  }

  video = null;
  channelName = "";
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
