
"use strict";

/*
  動画を追加するときは、この配列に情報を追加してください。
  file は videos フォルダ内の動画ファイル名です。
*/

const videos = [
 {
  title: "きょだいん家",
  file: "videos/きょだいんち動画1313131313.mp4",
  category: "店舗紹介",
  description: "きょだいん家の紹介動画"
},
  {
    title: "サンプル動画 02",
    file: "videos/sample02.mp4",
    category: "広告",
    description: "こちらもサンプル動画です。"
  }
];

const videoGrid = document.getElementById("video-grid");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const videoCount = document.getElementById("video-count");
const emptyMessage = document.getElementById("empty-message");

const playerModal = document.getElementById("player-modal");
const videoPlayer = document.getElementById("video-player");
const playerTitle = document.getElementById("player-title");
const playerDescription = document.getElementById("player-description");
const closePlayer = document.getElementById("close-player");

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

    const thumb = document.createElement("button");
    thumb.className = "video-thumb";
    thumb.type = "button";
    thumb.setAttribute("aria-label", `${video.title}を再生`);

    const preview = document.createElement("video");
    preview.src = video.file;
    preview.preload = "metadata";
    preview.muted = true;
    preview.playsInline = true;
    preview.tabIndex = -1;

    const playMark = document.createElement("span");
    playMark.className = "play-mark";
    playMark.textContent = "▶";

    thumb.appendChild(preview);
    thumb.appendChild(playMark);

    thumb.addEventListener("click", () => {
      openPlayer(video);
    });

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

function openPlayer(video) {
  videoPlayer.pause();
  videoPlayer.src = video.file;
  videoPlayer.load();

  playerTitle.textContent = video.title;
  playerDescription.textContent = video.description;

  playerModal.classList.add("active");
  playerModal.setAttribute("aria-hidden", "false");

  videoPlayer.play().catch(() => {
    // 自動再生が許可されない場合は再生ボタンから再生できます。
  });
}

function closeVideoPlayer() {
  videoPlayer.pause();
  videoPlayer.removeAttribute("src");
  videoPlayer.load();

  playerModal.classList.remove("active");
  playerModal.setAttribute("aria-hidden", "true");
}

searchInput.addEventListener("input", renderVideos);
categoryFilter.addEventListener("change", renderVideos);
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

renderVideos();
