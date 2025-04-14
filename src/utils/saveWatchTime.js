export function saveWatchData(title, url, totalWatchTime) {
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
