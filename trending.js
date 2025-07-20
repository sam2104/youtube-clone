const API_KEY = "AIzaSyBKV3bDREYODJluCyQ_bBOTETwPQy0_sr0"; // Your API key
const videoGrid = document.querySelector(".video-grid");
const loadMoreBtn = document.getElementById("load-more");

let nextPageToken = "";

// Fetch trending videos (most popular)
async function fetchTrendingVideos(isLoadMore = false) {
  const url = `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&part=snippet,statistics&chart=mostPopular&regionCode=US&maxResults=9${isLoadMore && nextPageToken ? `&pageToken=${nextPageToken}` : ""}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    nextPageToken = data.nextPageToken || "";

    if (!isLoadMore) videoGrid.innerHTML = "";

    if (data.items && data.items.length > 0) {
      displayVideos(data.items);
      loadMoreBtn.style.display = nextPageToken ? "block" : "none";
    } else {
      videoGrid.innerHTML = "<p>No trending videos found.</p>";
      loadMoreBtn.style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    videoGrid.innerHTML = "<p>Error loading videos.</p>";
    loadMoreBtn.style.display = "none";
  }
}

function displayVideos(videos) {
  videos.forEach((video) => {
    const { title, channelTitle, thumbnails, publishedAt } = video.snippet;
    const videoId = video.id;

    const views = video.statistics.viewCount
      ? `${Number(video.statistics.viewCount).toLocaleString()} views`
      : "";

    const publishedDate = new Date(publishedAt).toLocaleDateString();

    const card = document.createElement("div");
    card.className = "video-card";
    card.innerHTML = `
      <img src="${thumbnails.high.url}" alt="${title}">
      <div class="video-info">
        <h4 title="${title}">${title.length > 60 ? title.slice(0, 60) + "..." : title}</h4>
        <p>${channelTitle}</p>
        <p class="meta">${views} • ${publishedDate}</p>
      </div>
    `;

    card.addEventListener("click", () => {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
    });

    videoGrid.appendChild(card);
  });
}

// Load initial trending videos on page load
window.addEventListener("DOMContentLoaded", () => {
  fetchTrendingVideos();
});

// Load more button event
loadMoreBtn.addEventListener("click", () => {
  fetchTrendingVideos(true);
});
