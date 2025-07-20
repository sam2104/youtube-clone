const videoGrid = document.querySelector(".video-grid");
const loadMoreBtn = document.getElementById("load-more");
let nextPageToken = "";

async function fetchLibraryVideos(isLoadMore = false) {
  let url = `http://localhost:5000/api/libraryVideos`;
  if (isLoadMore && nextPageToken) {
    url += `?pageToken=${nextPageToken}`;
  }
  
  try {
    const res = await fetch(url);
    const data = await res.json();

    nextPageToken = data.nextPageToken || "";

    if (!isLoadMore) videoGrid.innerHTML = "";

    if (data.items && data.items.length > 0) {
      displayVideos(data.items);
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


function displayVideos(videos) {
  videos.forEach(video => {
    const { title, channelTitle, thumbnails, publishedAt } = video.snippet;
    const videoId = video.id.videoId || video.id;  // just in case id is string

    const publishedDate = new Date(publishedAt).toLocaleDateString();

    const card = document.createElement("div");
    card.className = "video-card";
    card.innerHTML = `
      <img src="${thumbnails.high.url}" alt="${title}">
      <div class="video-info">
        <h4 title="${title}">${title.length > 60 ? title.slice(0, 60) + "..." : title}</h4>
        <p>${channelTitle}</p>
        <p class="meta">${publishedDate}</p>
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
