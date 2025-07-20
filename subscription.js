const API_KEY = "AIzaSyBKV3bDREYODJluCyQ_bBOTETwPQy0_sr0";
const videoGrid = document.querySelector(".video-grid");
const loadMoreBtn = document.getElementById("load-more");
let nextPageToken = "";

// Example channel IDs (replace with actual subscriptions or your favorites)
const subscribedChannels = [
  "UC_x5XG1OV2P6uZZ5FSM9Ttw",  // Google Developers
  "UC29ju8bIPH5as8OGnQzwJyA",  // Traversy Media
  "UCWv7vMbMWH4-V0ZXdmDpPBA"   // Fireship
];

async function fetchSubscriptions(isLoadMore = false) {
  // For demo: fetch latest videos from these channels (one channel at a time)
  if (!fetchSubscriptions.currentChannelIndex) fetchSubscriptions.currentChannelIndex = 0;

  const channelId = subscribedChannels[fetchSubscriptions.currentChannelIndex];
  fetchSubscriptions.currentChannelIndex = (fetchSubscriptions.currentChannelIndex + 1) % subscribedChannels.length;

  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet,id&order=date&maxResults=9${isLoadMore && nextPageToken ? `&pageToken=${nextPageToken}` : ""}`;

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
  fetchSubscriptions();
});

loadMoreBtn.addEventListener("click", () => {
  fetchSubscriptions(true);
});
