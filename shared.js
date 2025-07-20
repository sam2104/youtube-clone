// Modal elements (assumes modal markup is present on every page)
const modal = document.getElementById("video-modal");
const modalClose = document.getElementById("close-modal");
const videoFrame = document.getElementById("video-frame");

// Open video modal with a given videoId
function openVideoModal(videoId) {
  videoFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  modal.style.display = "block";
}

// Close modal
function closeModal() {
  videoFrame.src = "";
  modal.style.display = "none";
}

// Event listeners for modal close
modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Display videos function (can be used in all pages)
function displayVideos(videos, statsMap, container) {
  container.innerHTML = ""; // Clear container first

  videos.forEach(video => {
    const { title, channelTitle, thumbnails, publishedAt } = video.snippet;
    const videoId = video.id.videoId || video.id; // support both forms
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
      openVideoModal(videoId);
    });
    container.appendChild(card);
  });
}

// Dark mode persistence
const toggleDark = document.getElementById("toggle-dark");
if (toggleDark) {
  // Load saved theme
  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark");
    toggleDark.checked = true;
  }

  toggleDark.addEventListener("change", () => {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
      localStorage.setItem("darkMode", "enabled");
    } else {
      localStorage.setItem("darkMode", "disabled");
    }
  });
}
