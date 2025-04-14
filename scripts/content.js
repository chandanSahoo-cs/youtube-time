console.log("CONTENT SCRIPT LOADED");

function saveWatchData(title, url, totalWatchTime) {
  const seconds = Math.round(totalWatchTime / 1000);
  const entry = {
    title,
    url,
    timeWatched: seconds,
    watchedAt: new Date().toISOString(),
  };

  chrome.storage.local.get(["watchHistory"], (res) => {
    const history = res.watchHistory || [];
    history.push(entry);
    chrome.storage.local.set({ watchHistory: history }, () => {
      console.log("Video entry saved:", entry);
    });
  });
}

let video = null;
let watchStart = null;
let totalTime = 0;

function setupTracking() {
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

function cleanupTracking() {
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

let lastVideoId = getVideoId();
let isTracking = false;

function getVideoId() {
  const params = new URLSearchParams(location.search);
  return params.get("v");
}

function checkRouteChange() {
  const currentPath = location.pathname;
  const currentVideoId = getVideoId();

  if (currentPath === "/watch" || currentPath === "/shorts") {
    if (!isTracking || currentVideoId !== lastVideoId) {
      if (isTracking) {
        console.log("Switching to new video");
        cleanupTracking();
      }
      lastVideoId = currentVideoId;
      setTimeout(setupTracking, 1000);
      isTracking = true;
    }
  } else {
    if (isTracking) {
      console.log("Left video page");
      cleanupTracking();
      isTracking = false;
      lastVideoId = null;
    }
  }
}

window.addEventListener("load", () => {
  if (location.pathname === "/watch") {
    lastVideoId = getVideoId();
    setTimeout(setupTracking, 1000);
    isTracking = true;
  }
});

setInterval(checkRouteChange, 500);
