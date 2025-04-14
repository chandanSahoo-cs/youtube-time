function formatTime(seconds) {
  const hours = Math.floor(seconds / (60 * 60));
  seconds %= 60 * 60;
  const mins = Math.floor(seconds / 60);
  seconds %= 60;
  const secs = Math.floor(seconds);
  
  // Format properly with leading zeros and hiding 0h if needed
  const hoursDisplay = hours > 0 ? `${hours}h ` : '';
  const minsDisplay = `${mins.toString().padStart(2, '0')}m `;
  const secsDisplay = `${secs.toString().padStart(2, '0')}s`;
  
  return `${hoursDisplay}${minsDisplay}${secsDisplay}`;
}

function truncateString(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

function formatUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname + urlObj.pathname.substring(0, 20) + (urlObj.pathname.length > 20 ? '...' : '');
  } catch (e) {
    return truncateString(url, 30);
  }
}

// Global variables to store and manipulate history
let watchHistory = [];
let sortDescending = true; // Default to descending (newest first or most watched first)
let sortBy = 'recency'; // Default to sort by recency
let searchTerm = '';
let activeTab = 'history';

function displayHistory() {
  const historyList = document.getElementById("history");
  historyList.innerHTML = ''; // Clear current display
  
  // Apply sorting and filtering
  let displayedHistory = [...watchHistory];
  
  // Filter by search term if provided
  if (searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    displayedHistory = displayedHistory.filter(entry => 
      entry.title.toLowerCase().includes(lowerSearchTerm)
    );
  }
  
  // Sort by selected criteria
  if (sortBy === 'time') {
    // Sort by time watched
    if (sortDescending) {
      displayedHistory.sort((a, b) => b.timeWatched - a.timeWatched);
    } else {
      displayedHistory.sort((a, b) => a.timeWatched - b.timeWatched);
    }
  } else {
    // Sort by recency (watchedAt date)
    if (sortDescending) {
      displayedHistory.sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));
    } else {
      displayedHistory.sort((a, b) => new Date(a.watchedAt) - new Date(b.watchedAt));
    }
  }
  
  // Show history or empty state
  if (displayedHistory.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state">
        ${searchTerm ? 'No videos match your search.' : 'No watch history yet.<br>Start watching YouTube videos!'}
      </div>
    `;
    return;
  }
  
  // Display the history entries with staggered animation
  displayedHistory.forEach((entry, index) => {
    const div = document.createElement("div");
    div.className = "entry";
    div.style.animationDelay = `${index * 0.1}s`;
    
    // Format the date nicely
    const watchDate = new Date(entry.watchedAt);
    const timeFormatted = watchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = watchDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    
    div.innerHTML = `
      <div class="entry-title">${truncateString(entry.title, 38)}</div>
      <div class="entry-channel">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 8a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8Z"></path>
          <path d="m9 10 6 4-6 4V10Z"></path>
        </svg>
        ${entry.channelName || 'Unknown channel'}
      </div>
      <div class="entry-time">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        ${formatTime(entry.timeWatched)} • ${timeFormatted}, ${dateFormatted}
      </div>
      <div class="entry-url"><a href="${entry.url}" target="_blank" title="${entry.url}">${formatUrl(entry.url)}</a></div>
    `;
    historyList.appendChild(div);
  });
  
  // Animate entries
  setTimeout(() => {
    const entries = document.querySelectorAll('.entry');
    entries.forEach(entry => {
      entry.style.opacity = "1";
    });
  }, 100);
}

// Function to generate reports
function generateReports() {
  // Calculate time ranges
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);
  
  const startOfMonth = new Date(now);
  startOfMonth.setDate(1); // First day of current month
  startOfMonth.setHours(0, 0, 0, 0);
  
  // Filter history entries by time range
  const dailyHistory = watchHistory.filter(entry => new Date(entry.watchedAt) >= startOfDay);
  const weeklyHistory = watchHistory.filter(entry => new Date(entry.watchedAt) >= startOfWeek);
  const monthlyHistory = watchHistory.filter(entry => new Date(entry.watchedAt) >= startOfMonth);
  
  // Generate stats by time period
  updateReportStats('daily', dailyHistory);
  updateReportStats('weekly', weeklyHistory);
  updateReportStats('monthly', monthlyHistory);
}

// Helper function to update each report section
function updateReportStats(period, filteredHistory) {
  // Calculate total time watched
  const totalTime = filteredHistory.reduce((acc, entry) => acc + entry.timeWatched, 0);
  document.getElementById(`${period}-total`).textContent = formatTime(totalTime);
  
  // Find top channel
  const channelStats = {};
  filteredHistory.forEach(entry => {
    const channelName = entry.channelName || 'Unknown';
    if (!channelStats[channelName]) {
      channelStats[channelName] = 0;
    }
    channelStats[channelName] += entry.timeWatched;
  });
  
  let topChannel = { name: 'None', time: 0 };
  for (const [name, time] of Object.entries(channelStats)) {
    if (time > topChannel.time) {
      topChannel = { name, time };
    }
  }
  
  if (topChannel.name !== 'None') {
    document.getElementById(`${period}-channel`).textContent = 
      `${topChannel.name} (${formatTime(topChannel.time)})`;
  } else {
    document.getElementById(`${period}-channel`).textContent = 'No data yet';
  }
  
  // Find most watched video
  let topVideo = { title: 'None', time: 0 };
  filteredHistory.forEach(entry => {
    if (entry.timeWatched > topVideo.time) {
      topVideo = { 
        title: entry.title, 
        time: entry.timeWatched 
      };
    }
  });
  
  if (topVideo.title !== 'None') {
    document.getElementById(`${period}-video`).textContent = 
      `${truncateString(topVideo.title, 28)} (${formatTime(topVideo.time)})`;
  } else {
    document.getElementById(`${period}-video`).textContent = 'No data yet';
  }
}

// Initialize the UI
function initializeUI() {
  chrome.storage.local.get(["watchHistory"], (res) => {
    watchHistory = res.watchHistory || [];
    const totalTime = watchHistory.reduce((acc, entry) => acc + entry.timeWatched, 0);

    // Update total time with a nice animation
    const totalElement = document.getElementById("total");
    totalElement.innerHTML = `
      <span>Total Watched</span>
      <div style="font-size: 18px; margin-top: 4px; font-weight: 600;">${formatTime(totalTime)}</div>
    `;

    // Initial display of history and reports
    displayHistory();
    generateReports();
  });
}

// Update the UI to reflect current sort state
function updateSortUI() {
  // Update sort options
  const sortOptions = document.querySelectorAll('.sort-option');
  sortOptions.forEach(option => {
    option.classList.toggle('active', option.dataset.sort === sortBy);
  });
  
  // Update sort direction indicator
  const sortDirectionBtn = document.getElementById('sort-direction');
  sortDirectionBtn.classList.toggle('asc', !sortDescending);
}

// Event Handlers
document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI when DOM is loaded
  initializeUI();
  
  // Reload button event
  document.getElementById("reload").addEventListener("click", () => {
    const reloadButton = document.getElementById("reload");
    reloadButton.style.transform = "rotate(360deg)";
    
    setTimeout(() => {
      location.reload();
    }, 300);
  });
  
  // Tab switching
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      // Update active tab button
      tabButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      
      // Update active tab content
      const tabName = button.dataset.tab;
      activeTab = tabName;
      
      document.querySelectorAll(".tab-content").forEach(content => {
        content.classList.remove("active");
      });
      
      document.getElementById(`${tabName}-tab`).classList.add("active");
    });
  });
  
  // Sort option buttons
  document.querySelectorAll(".sort-option").forEach(button => {
    button.addEventListener("click", () => {
      sortBy = button.dataset.sort;
      updateSortUI();
      displayHistory();
    });
  });
  
  // Sort direction button
  document.getElementById("sort-direction").addEventListener("click", () => {
    sortDescending = !sortDescending;
    updateSortUI();
    displayHistory();
  });
  
  // Search input event
  document.getElementById("search").addEventListener("input", (event) => {
    searchTerm = event.target.value.trim();
    displayHistory();
  });
  
  // Clear history button
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
  
  // Initialize sort UI
  updateSortUI();
});