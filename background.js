chrome.runtime.onInstalled.addListener(() => {
  console.log("YouTube Watch Tracker installed.");
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "log") {
    console.log("[FROM content.js]:", msg.message);
  }
});
