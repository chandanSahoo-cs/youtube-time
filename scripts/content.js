console.log("Content script loaded");

// Detect if we're on a new video after URL changes (single-page app behavior)
let lastURL = location.href;
const checkURLChange = () => {
  if (location.href !== lastURL) {
    lastURL = location.href;
    console.log("lastURL: ", lastURL);
    console.log("currentURL: ", location.href);
    setTimeout(setupTracking, 1000); // wait a second to let new video load
  }
};
setInterval(checkURLChange, 1000);

// Core tracking logic
function setupTracking() {
  let retryCount = 0;

  function tryFindVideo() {
    const video = document.querySelector("video");

    if (!video) {
      retryCount++;
      if (retryCount < 20) {
        setTimeout(tryFindVideo, 500); // try again in 0.5s
      } else {
        console.log("Video element not found after retries.");
      }
      return;
    }

    console.log("Video found, starting tracking for:", document.title);

    let watchStart = null;
    let totalWatchTime = 0;
    let videoTitle = document.title;
    let videoURL = location.href;
    let watchedAt = null;
    // Start intial video tracking
    (function startTimer() {
      if (!watchStart && video.readyState !== 0 && !video.paused) {
        watchStart = Date.now();
        console.log("Played at", new Date(watchStart).toLocaleTimeString());
        watchedAt = new Date().toISOString();
      }
    })();

    // Play event listener
    video.addEventListener("play", () => {
      if (!watchStart) {
        watchStart = Date.now();
        console.log("Play at", new Date(watchStart).toLocaleTimeString());
      }
    });

    //pause event listener
    video.addEventListener("pause", () => {
      if (watchStart) {
        const now = Date.now();
        totalWatchTime += now - watchStart;
        console.log(
          "Paused. Time added:",
          (now - watchStart) / 1000,
          "seconds",
        );
        watchStart = null;
        console.log("totalWatchTime : ", totalWatchTime / 1000);
      }
    });

    window.addEventListener("beforeunload", () => {
      if (watchStart) {
        totalWatchTime += Date.now() - watchStart;
      }

      const seconds = Math.round(totalWatchTime / 1000);
      if (seconds > 5) {
        const entry = {
          title: videoTitle,
          url: videoURL,
          timeWatched: seconds,
          watchedAt: watchedAt,
        };

        chrome.storage.local.get(["watchHistory"], (res) => {
          const history = res.watchHistory || [];
          history.push(entry);
          chrome.storage.local.set({ watchHistory: history }, () => {
            console.log("Saved watch entry:", entry);
          });
        });
      }
    });
  }

  tryFindVideo();
}
setupTracking();
