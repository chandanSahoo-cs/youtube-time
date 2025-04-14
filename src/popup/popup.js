function formatTime(seconds) {
  const hours = Math.floor(seconds / (60 * 60));
  seconds %= 60 * 60;
  const mins = Math.floor(seconds / 60);
  seconds %= 60;
  const secs = Math.floor(seconds);

  // Format properly with leading zeros and hiding 0h if needed
  const hoursDisplay = hours > 0 ? `${hours}h ` : "";
  const minsDisplay = `${mins.toString().padStart(2, "0")}m `;
  const secsDisplay = `${secs.toString().padStart(2, "0")}s`;

  return `${hoursDisplay}${minsDisplay}${secsDisplay}`;
}

function truncateString(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "...";
}

function formatUrl(url) {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname +
      urlObj.pathname.substring(0, 20) +
      (urlObj.pathname.length > 20 ? "..." : "")
    );
  } catch (e) {
    return truncateString(url, 30);
  }
}

chrome.storage.local.get(["watchHistory"], (res) => {
  const history = res.watchHistory || [];
  const historyList = document.getElementById("history");
  const totalTime = history.reduce((acc, entry) => acc + entry.timeWatched, 0);

  // Update total time with a nice animation
  const totalElement = document.getElementById("total");
  totalElement.innerHTML = `
    <span>Total Watched</span>
    <div style="font-size: 18px; margin-top: 4px; font-weight: 600;">${formatTime(totalTime)}</div>
  `;

  // Show history or empty state
  if (history.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state">
        No watch history yet.<br>Start watching YouTube videos!
      </div>
    `;
  } else {
    // Display the history entries with staggered animation
    history
      .slice()
      .reverse()
      .forEach((entry, index) => {
        const div = document.createElement("div");
        div.className = "entry";
        div.style.animationDelay = `${index * 0.1}s`;

        // Format the date nicely
        const watchDate = new Date(entry.watchedAt);
        const timeFormatted = watchDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const dateFormatted = watchDate.toLocaleDateString([], {
          month: "short",
          day: "numeric",
        });

        div.innerHTML = `
          <div class="entry-title">${truncateString(entry.title, 38)}</div>
          <div class="entry-time">⏱ ${formatTime(entry.timeWatched)} • ${timeFormatted}, ${dateFormatted}</div>
          <div class="entry-url"><a href="${entry.url}" target="_blank" title="${entry.url}">${formatUrl(entry.url)}</a></div>
        `;
        historyList.appendChild(div);
      });
  }
});

document.getElementById("clear").addEventListener("click", () => {
  // Add a nice animation before clearing
  const button = document.getElementById("clear");
  button.textContent = "Clearing...";
  button.style.opacity = "0.8";

  setTimeout(() => {
    chrome.storage.local.set({ watchHistory: [] }, () => {
      location.reload();
    });
  }, 600);
});

// Animate entries when they come into view
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const entries = document.querySelectorAll(".entry");
    entries.forEach((entry) => {
      entry.style.opacity = "1";
    });
  }, 100);
});
