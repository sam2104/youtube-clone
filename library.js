const API_KEY = "AIzaSyBKV3bDREYODJluCyQ_bBOTETwPQy0_sr0";
const videoGrid = document.querySelector(".video-grid");
const loadMoreBtn = document.getElementById("load-more");
let nextPageToken = "";

async function fetchLibraryVideos(isLoadMore = false) {
  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&part=snippet&type=video&maxResults=9&q=playlist${isLoadMore && nextPageToken ? `&pageToken=${nextPageToken}` : ""}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    nextPageToken = data.nextPageToken || "";

    if (!isLoadMore) videoGrid.innerHTML = "";

    if (data.items && data.items.length > 0) {
      const videoIds = data.items.map(item => item.id.videoId).join(",");
      const statsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&part=statistics&id=${videoIds}`;
      const statsRes = await fetch(statsUrl);
      const statsData = await statsRes.json();

      const statsMap = {};
      statsData.items.forEach(item => {
        statsMap[item.id] = item;
      });

      displayVideos(data.items, statsMap);
      loadMoreBtn.style.display = nextPageToken ? "block" : "none";
    } else {
      videoGrid.innerHTML = "<p>No library videos found.</p>";
      loadMoreBtn.style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching library videos:", error);
    videoGrid.innerHTML = "<p>Error loading videos.</p>";
    loadMoreBtn.style.display = "none";
  }
}

function displayVideos(videos, statsMap) {
  videos.forEach(video => {
    const { title, channelTitle, thumbnails, publishedAt } = video.snippet;
    const videoId = video.id.videoId;
    const views = statsMap[videoId]?.statistics?.viewCount
      ? `${Number(statsMap[videoId].statistics.viewCount).toLocaleString()} views`
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

window.addEventListener("DOMContentLoaded", () => {
  fetchLibraryVideos();
});

loadMoreBtn.addEventListener("click", () => {
  fetchLibraryVideos(true);
});
