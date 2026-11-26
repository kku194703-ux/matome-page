
"use strict";

/* ========================================
   VIDEO DATA
   動画を追加するときはここに登録
======================================== */

const videos = [
  {
    title: "きょだいん家",
    youtubeId: "hH0Xcg0WkRg",
    category: "店舗紹介",
    description: "きょだいん家の紹介動画"
  },

  {
    title: "サンプル動画 02",
    youtubeId: "",
    category: "広告",
    description: "こちらもサンプル動画です。"
  }
];

/* ========================================
   HTML ELEMENTS
======================================== */

const videoGrid = document.getElementById("video-grid");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const videoCount = document.getElementById("video-count");
const emptyMessage = document.getElementById("empty-message");

const playerModal = document.getElementById("player-modal");
const youtubePlayer = document.getElementById("youtube-player");
const playerTitle = document.getElementById("player-title");
const playerDescription = document.getElementById("player-description");
const closePlayer = document.getElementById("close-player");

/* ========================================
   VIDEO LIST
======================================== */

function renderVideos() {

  const keyword = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  const filteredVideos = videos.filter(video => {

    const matchesKeyword =
      video.title.toLowerCase().includes(keyword) ||
      video.description.toLowerCase().includes(keyword) ||
      video.category.toLowerCase().includes(keyword);

    const matchesCategory =
      category === "all" || video.category === category;

    return matchesKeyword && matchesCategory;
  });

  videoGrid.innerHTML = "";

  videoCount.textContent = filteredVideos.length;
  emptyMessage.hidden = filteredVideos.length !== 0;

  filteredVideos.forEach(video => {

    const card = document.createElement("article");
    card.className = "video-card";

    /* サムネイル */

    const thumb = document.createElement("button");
    thumb.className = "video-thumb";
    thumb.type = "button";
    thumb.setAttribute("aria-label", `${video.title}を再生`);

    const image = document.createElement("img");

    image.alt = video.title;
    image.loading = "lazy";

    if (video.youtubeId) {
      image.src =
        `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
    } else {
      image.alt = "動画ID未登録";
    }

    const playMark = document.createElement("span");
    playMark.className = "play-mark";
    playMark.textContent = "▶";

    thumb.appendChild(image);
    thumb.appendChild(playMark);

    thumb.addEventListener("click", () => {
      if (video.youtubeId) {
        openPlayer(video);
      }
    });

    /* 動画情報 */

    const info = document.createElement("div");
    info.className = "video-info";

    const categoryLabel = document.createElement("span");
    categoryLabel.className = "video-category";
    categoryLabel.textContent = video.category;

    const title = document.createElement("h3");
    title.textContent = video.title;

    const description = document.createElement("p");
    description.textContent = video.description;

    info.appendChild(categoryLabel);
    info.appendChild(title);
    info.appendChild(description);

    card.appendChild(thumb);
    card.appendChild(info);

    videoGrid.appendChild(card);

  });
}

/* ========================================
   YOUTUBE PLAYER
======================================== */

function openPlayer(video) {

  playerTitle.textContent = video.title;
  playerDescription.textContent = video.description;

  youtubePlayer.src =
    `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`;

  playerModal.classList.add("active");
  playerModal.setAttribute("aria-hidden", "false");
}

/* ========================================
   CLOSE PLAYER
======================================== */

function closeVideoPlayer() {

  youtubePlayer.src = "";

  playerModal.classList.remove("active");
  playerModal.setAttribute("aria-hidden", "true");
}

closePlayer.addEventListener("click", closeVideoPlayer);

playerModal.addEventListener("click", event => {

  if (event.target === playerModal) {
    closeVideoPlayer();
  }

});

document.addEventListener("keydown", event => {

  if (event.key === "Escape") {
    closeVideoPlayer();
  }

});

/* ========================================
   SEARCH & CATEGORY
======================================== */

searchInput.addEventListener("input", renderVideos);

categoryFilter.addEventListener("change", renderVideos);

/* ========================================
   INITIAL DISPLAY
======================================== */

renderVideos();
