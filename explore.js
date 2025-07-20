const API_KEY = "AIzaSyBKV3bDREYODJluCyQ_bBOTETwPQy0_sr0"; // Replace with your YouTube Data API key
const exploreGrid = document.getElementById("exploreGrid");
const loadMoreBtn = document.getElementById("load-more");
const buttons = document.querySelectorAll(".category-btn");

const BASE_URL = "https://www.googleapis.com/youtube/v3";

let nextPageToken = "";
let currentCategory = "";

// Add video to watch history
function addToHistory(video) {
  if (!video || !video.id || !video.snippet) return;

  const history = JSON.parse(localStorage.getItem("watchHistory") || "[]");

  if (history.some(v => v.videoId === video.id.videoId)) return;

  const videoData = {
    videoId: video.id.videoId,
    title: video.snippet.title,
    channelTitle: video.snippet.channelTitle,
    thumbnail: video.snippet.thumbnails.medium.url
  };

  history.unshift(videoData);
  if (history.length > 50) history.pop();
  localStorage.setItem("watchHistory", JSON.stringify(history));
}

async function fetchVideosByCategory(query, loadMore = false) {
  if (!loadMore) {
    nextPageToken = "";
    exploreGrid.innerHTML = "<p>Loading...</p>";
  }

  let url = `${BASE_URL}/search?key=${API_KEY}&part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=12`;
  if (loadMore && nextPageToken) {
    url += `&pageToken=${nextPageToken}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      exploreGrid.innerHTML = `<p>Error: ${data.error.message}</p>`;
      loadMoreBtn.style.display = "none";
      return;
    }

    nextPageToken = data.nextPageToken || "";
    if (!loadMore) exploreGrid.innerHTML = "";

    if (data.items && data.items.length > 0) {
      displayVideos(data.items);
      loadMoreBtn.style.display = nextPageToken ? "block" : "none";
    } else if (!loadMore) {
      exploreGrid.innerHTML = "<p>No results found.</p>";
      loadMoreBtn.style.display = "none";
    }
  } catch (error) {
    console.error("Fetch error:", error);
    exploreGrid.innerHTML = "<p>Failed to load videos.</p>";
    loadMoreBtn.style.display = "none";
  }
}

function displayVideos(videos) {
  videos.forEach((video) => {
    const { thumbnails, title, channelTitle } = video.snippet;
    const videoId = video.id.videoId;

    const card = document.createElement("div");
    card.className = "video-card";

    card.innerHTML = `
      <img src="${thumbnails.medium.url}" alt="${title}" />
      <div class="video-info">
        <h4 title="${title}">${title.length > 60 ? title.slice(0, 60) + "..." : title}</h4>
        <p>${channelTitle}</p>
      </div>
    `;

    card.addEventListener("click", () => {
      addToHistory(video);
      // Call openVideoModal from shared.js or elsewhere
      if (typeof openVideoModal === "function") openVideoModal(videoId);
    });

    exploreGrid.appendChild(card);
  });
}

// Category buttons click
buttons.forEach((btn) => {
  btn.addEventListener("click", function () {
    buttons.forEach((b) => b.classList.remove("active"));
    this.classList.add("active");

    currentCategory = this.getAttribute("data-category");
    fetchVideosByCategory(currentCategory, false);
  });
});

// Load more button
loadMoreBtn.addEventListener("click", () => {
  if (currentCategory && nextPageToken) {
    fetchVideosByCategory(currentCategory, true);
  }
});

// Load default category on page load
window.addEventListener("DOMContentLoaded", () => {
  currentCategory = "Trending";
  buttons.forEach((b) => b.classList.remove("active"));
  const defaultBtn = [...buttons].find(b => b.getAttribute("data-category") === currentCategory);
  if (defaultBtn) defaultBtn.classList.add("active");

  fetchVideosByCategory(currentCategory, false);
});
