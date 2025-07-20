const API_KEY = "AIzaSyBKV3bDREYODJluCyQ_bBOTETwPQy0_sr0";
const searchInput = document.querySelector("input");
const videoGrid = document.querySelector(".video-grid");
const loadMoreBtn = document.getElementById("load-more");
const toggleDark = document.getElementById("toggle-dark");

const modal = document.getElementById("video-modal");
const modalClose = document.getElementById("close-modal");
const videoFrame = document.getElementById("video-frame");

let nextPageToken = "";
let currentQuery = "";

// Dark mode toggle functionality
toggleDark.addEventListener("change", () => {
  document.body.classList.toggle("dark");
});

// Search on Enter key
searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter" && searchInput.value.trim() !== "") {
    currentQuery = searchInput.value.trim();
    searchVideos(currentQuery, false);
  }
});

// Load more button click
loadMoreBtn.addEventListener("click", () => {
  if (currentQuery && nextPageToken) {
    searchVideos(currentQuery, true);
  }
});

// Search videos function
async function searchVideos(query, isLoadMore = false) {
  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&type=video&part=snippet&maxResults=9&q=${encodeURIComponent(query)}${isLoadMore && nextPageToken ? `&pageToken=${nextPageToken}` : ""}`;

  try {
    if (!isLoadMore) {
      videoGrid.innerHTML = "Loading...";
      loadMoreBtn.style.display = "none";
    }

    const res = await fetch(url);
    const data = await res.json();

    nextPageToken = data.nextPageToken || "";

    if (data.items.length > 0) {
      const videoIds = data.items.map(item => item.id.videoId).join(",");
      const statsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&part=statistics&id=${videoIds}`;
      const statsRes = await fetch(statsUrl);
      const statsData = await statsRes.json();

      const statsMap = {};
      statsData.items.forEach(item => {
        statsMap[item.id] = item;
      });

      if (!isLoadMore) videoGrid.innerHTML = "";
      displayVideos(data.items, statsMap);
      loadMoreBtn.style.display = nextPageToken ? "block" : "none";
    } else {
      videoGrid.innerHTML = "<p>No results found.</p>";
      loadMoreBtn.style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching videos:", error);
    videoGrid.innerHTML = "<p>Error loading videos.</p>";
    loadMoreBtn.style.display = "none";
  }
}

// Fetch trending videos on page load
window.addEventListener("DOMContentLoaded", () => {
  fetchTrendingVideos();
});

// Fetch trending videos function
async function fetchTrendingVideos() {
  videoGrid.innerHTML = "<p>Loading trending videos...</p>";
  loadMoreBtn.style.display = "none";

  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=9&regionCode=US&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      videoGrid.innerHTML = "";
      const videosFormatted = data.items.map(item => ({
        id: { videoId: item.id },
        snippet: item.snippet
      }));

      const statsMap = data.items.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});

      displayVideos(videosFormatted, statsMap);
    } else {
      videoGrid.innerHTML = "<p>No trending videos found.</p>";
    }
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    videoGrid.innerHTML = "<p>Error loading trending videos.</p>";
  }
}

// Display videos helper
function displayVideos(videos, statsMap) {
  videos.forEach(video => {
    const { title, channelTitle, thumbnails, publishedAt } = video.snippet;
    const videoId = video.id.videoId;

    const stats = statsMap[videoId]?.statistics || {};
    const views = stats.viewCount ? `${Number(stats.viewCount).toLocaleString()} views` : "";
    const publishedDate = new Date(publishedAt).toLocaleDateString();

    const card = document.createElement("div");
    card.className = "video-card";
    card.innerHTML = `
      <img src="${thumbnails.high.url}" alt="${title}" />
      <div class="video-info">
        <h4 title="${title}">${title.length > 60 ? title.slice(0, 60) + "..." : title}</h4>
        <p>${channelTitle}</p>
        <p class="meta">${views} • ${publishedDate}</p>
      </div>
    `;

    card.addEventListener("click", () => openVideoModal(videoId));

    videoGrid.appendChild(card);
  });
}

// Video modal open/close
function openVideoModal(videoId) {
  videoFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  modal.style.display = "flex";
}

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", e => {
  if (e.target === modal) closeModal();
});

function closeModal() {
  videoFrame.src = "";
  modal.style.display = "none";
}
