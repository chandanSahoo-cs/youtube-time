
console.log("CONTENT SCRIPT LOADED");

import { setupTracking, cleanupTracking } from "../utils/tracking.js";


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
