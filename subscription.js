const videoGrid = document.querySelector(".video-grid");
const loadMoreBtn = document.getElementById("load-more");

const subscribedChannelsCount = 3; // number of channels in backend array

let nextPageToken = "";
let currentChannelIndex = 0;

async function fetchSubscriptions(isLoadMore = false) {
  if (!isLoadMore) {
    videoGrid.innerHTML = "Loading...";
    nextPageToken = "";
    currentChannelIndex = 0;
  }

  // Append query params
  let url = `http://localhost:5000/api/subscriptions?channelIndex=${currentChannelIndex}`;
  if (isLoadMore && nextPageToken) {
    url += `&pageToken=${nextPageToken}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();

    nextPageToken = data.nextPageToken || "";
    currentChannelIndex = (data.currentChannelIndex + 1) % subscribedChannelsCount;

    if (!isLoadMore) videoGrid.innerHTML = "";

    if (data.items && data.items.length > 0) {
      const statsMap = {};
      (data.stats || []).forEach(item => {
        statsMap[item.id] = item;
      });

      displayVideos(data.items, statsMap);
      loadMoreBtn.style.display = nextPageToken ? "block" : "none";
    } else {
      videoGrid.innerHTML = "<p>No subscription videos found.</p>";
      loadMoreBtn.style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    videoGrid.innerHTML = "<p>Error loading videos.</p>";
    loadMoreBtn.style.display = "none";
  }
}

function displayVideos(videos, statsMap) {
  videos.forEach(video => {
    const { title, channelTitle, thumbnails, publishedAt } = video.snippet;
    const videoId = video.id.videoId || video.id;
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
  fetchSubscriptions();
});

loadMoreBtn.addEventListener("click", () => {
  fetchSubscriptions(true);
});
