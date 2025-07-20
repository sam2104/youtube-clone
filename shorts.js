const videoGrid = document.querySelector(".video-grid");
const loadMoreBtn = document.getElementById("load-more");
let nextPageToken = "";
const searchQuery = "funny"; // you can make this dynamic if you want

async function fetchShorts(isLoadMore = false) {
  if (!isLoadMore) videoGrid.innerHTML = "Loading...";
  loadMoreBtn.disabled = true;

  let url = `http://localhost:5000/api/shorts?q=${encodeURIComponent(searchQuery)}`;
  if (isLoadMore && nextPageToken) {
    url += `&pageToken=${nextPageToken}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();

    nextPageToken = data.nextPageToken || "";

    if (!isLoadMore) videoGrid.innerHTML = "";

    if (data.items && data.items.length > 0) {
      const statsMap = {};
      (data.stats || []).forEach(item => {
        statsMap[item.id] = item;
      });

      displayVideos(data.items, statsMap);
      loadMoreBtn.style.display = nextPageToken ? "block" : "none";
    } else {
      videoGrid.innerHTML = "<p>No shorts videos found.</p>";
      loadMoreBtn.style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching shorts:", error);
    videoGrid.innerHTML = "<p>Error loading videos.</p>";
    loadMoreBtn.style.display = "none";
  } finally {
    loadMoreBtn.disabled = false;
  }
}

function displayVideos(videos, statsMap) {
  videos.forEach(video => {
    const { title, channelTitle, thumbnails, publishedAt } = video.snippet;
    const videoId = video.id.videoId || video.id;
    const thumbnailUrl = thumbnails?.high?.url || thumbnails?.default?.url || "";
    const views = statsMap[videoId]?.statistics?.viewCount
      ? `${Number(statsMap[videoId].statistics.viewCount).toLocaleString()} views`
      : "";
    const publishedDate = new Date(publishedAt).toLocaleDateString();

    const card = document.createElement("div");
    card.className = "video-card";
    card.innerHTML = `
      <img src="${thumbnailUrl}" alt="${title}">
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
  fetchShorts();
});

loadMoreBtn.addEventListener("click", () => {
  fetchShorts(true);
});
