const historyGrid = document.getElementById("historyGrid");
const clearHistoryBtn = document.getElementById("clear-history");

// Get history from localStorage
function getHistory() {
  const history = localStorage.getItem("watchHistory");
  return history ? JSON.parse(history) : [];
}

// Remove one video from history
function removeFromHistory(videoId) {
  let history = getHistory();
  history = history.filter(v => v.videoId !== videoId);
  localStorage.setItem("watchHistory", JSON.stringify(history));
  renderHistoryWithApi();
}

// Clear entire history
clearHistoryBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all watch history?")) {
    localStorage.removeItem("watchHistory");
    renderHistoryWithApi();
  }
});

// Fetch fresh video details from YouTube API for all videos in history
async function fetchVideoDetails(videoIds) {
  if (videoIds.length === 0) return [];

  try {
    // Your backend should accept multiple videoIds separated by commas
    const url = `http://localhost:5000/api/videos?ids=${videoIds.join(",")}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error("Backend error:", data.error.message);
      return [];
    }

    return data.items || [];
  } catch (error) {
    console.error("Error fetching video details from backend:", error);
    return [];
  }
}


// Render history with fresh API data
async function renderHistoryWithApi() {
  const history = getHistory();

  if (history.length === 0) {
    historyGrid.innerHTML = "<p>No watch history found.</p>";
    return;
  }

  // Show loading text
  historyGrid.innerHTML = "<p>Loading history...</p>";

  const videoIds = history.map(v => v.videoId);
  const freshData = await fetchVideoDetails(videoIds);

  // Map fresh data by videoId
  const freshDataMap = {};
  freshData.forEach(item => {
    freshDataMap[item.id] = item;
  });

  historyGrid.innerHTML = "";

  history.forEach(video => {
    const fresh = freshDataMap[video.videoId];

    const title = fresh?.snippet.title || video.title || "Unknown Title";
    const thumbnail = fresh?.snippet.thumbnails.medium.url || video.thumbnail || "";
    const channelTitle = fresh?.snippet.channelTitle || video.channelTitle || "Unknown Channel";
    const views = fresh?.statistics.viewCount ? 
      `${Number(fresh.statistics.viewCount).toLocaleString()} views` : "";

    const card = document.createElement("div");
    card.className = "video-card";

    card.innerHTML = `
      <img src="${thumbnail}" alt="${title}" />
      <div class="video-info">
        <h4 title="${title}">${title.length > 60 ? title.slice(0, 60) + "..." : title}</h4>
        <p>${channelTitle}</p>
        <p class="meta">${views}</p>
        <button class="remove-btn" style="background:#900; color:#fff; border:none; border-radius:12px; padding:4px 8px; cursor:pointer; margin-top:6px;">Remove</button>
      </div>
    `;

    // Open modal on clicking image, title or channel name
    card.querySelector("img").addEventListener("click", () => {
      if (typeof openVideoModal === "function") openVideoModal(video.videoId);
    });
    card.querySelector("h4").addEventListener("click", () => {
      if (typeof openVideoModal === "function") openVideoModal(video.videoId);
    });
    card.querySelector("p").addEventListener("click", () => {
      if (typeof openVideoModal === "function") openVideoModal(video.videoId);
    });

    // Remove button handler
    card.querySelector(".remove-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      removeFromHistory(video.videoId);
    });

    historyGrid.appendChild(card);
  });
}

// On page load, render history
window.addEventListener("DOMContentLoaded", () => {
  renderHistoryWithApi();
});
