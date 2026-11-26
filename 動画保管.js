
const DB_NAME = "VideoArchiveDB";
const STORE_NAME = "videos";

let db;
let videoUrls = new Map();
let videos = [];

// データベースを開く
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true
        });
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}

// データを保存
function saveVideo(video) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).add(video);

    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}

// 全動画を取得
function getVideos() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 動画を削除
function removeVideo(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);

    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}

// サムネイルを生成
function createThumbnail(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const finish = (result) => {
      URL.revokeObjectURL(url);
      resolve(result);
    };

    video.onloadedmetadata = () => {
      const time = Math.min(1, video.duration / 2);

      if (!Number.isFinite(time) || video.duration === 0) {
        finish(null);
        return;
      }

      video.currentTime = time;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 360;

        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, 640, 360);

        finish(canvas.toDataURL("image/jpeg", 0.75));
      } catch (error) {
        finish(null);
      }
    };

    video.onerror = () => finish(null);

    video.src = url;
  });
}

// ファイルサイズ表示
function formatSize(bytes) {
  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + " KB";
  }

  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// 日付表示
function formatDate(date) {
  return new Date(date).toLocaleDateString("ja-JP");
}

// 動画一覧を表示
function renderVideos() {
  const grid = document.getElementById("videoGrid");
  const keyword = document.getElementById("searchInput")
    .value.toLowerCase();

  const category = document.getElementById("categoryFilter").value;

  const filtered = videos.filter(video => {
    const matchesKeyword =
      video.title.toLowerCase().includes(keyword) ||
      video.description.toLowerCase().includes(keyword);

    const matchesCategory =
      category === "all" || video.category === category;

    return matchesKeyword && matchesCategory;
  });

  grid.replaceChildren();

  document.getElementById("videoCount").textContent = videos.length;

  document.getElementById("categoryCount").textContent =
    new Set(videos.map(video => video.category)).size;

  document.getElementById("resultCount").textContent =
    filtered.length + " VIDEOS";

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";

    const icon = document.createElement("div");
    icon.className = "empty-icon";
    icon.textContent = "▶";

    const message = document.createElement("p");
    message.textContent = videos.length
      ? "該当する動画がありません。"
      : "まだ動画が登録されていません。";

    const note = document.createElement("span");
    note.textContent = videos.length
      ? "検索条件を変更してください。"
      : "「動画を追加」から登録してください。";

    empty.append(icon, message, note);
    grid.appendChild(empty);
    return;
  }

  filtered.sort((a, b) => b.createdAt - a.createdAt);

  filtered.forEach(video => {
    const card = document.createElement("article");
    card.className = "video-card";

    // サムネイル
    const thumbnail = document.createElement("div");
    thumbnail.className = "thumbnail";

    if (video.thumbnail) {
      const image = document.createElement("img");
      image.src = video.thumbnail;
      image.alt = video.title;
      thumbnail.appendChild(image);
    } else {
      thumbnail.style.display = "grid";
      thumbnail.style.placeItems = "center";
      thumbnail.textContent = "▶";
      thumbnail.style.color = "#c5a36c";
      thumbnail.style.fontSize = "30px";
    }

    const playIcon = document.createElement("div");
    playIcon.className = "play-icon";
    playIcon.textContent = "▶";
    thumbnail.appendChild(playIcon);

    thumbnail.addEventListener("click", () => playVideo(video));

    // 情報
    const info = document.createElement("div");
    info.className = "video-info";

    const tag = document.createElement("span");
    tag.className = "category";
    tag.textContent = video.category;

    const title = document.createElement("h4");
    title.textContent = video.title;

    const description = document.createElement("p");
    description.textContent =
      video.description || "説明はありません。";

    const footer = document.createElement("div");
    footer.className = "card-footer";

    const details = document.createElement("span");
    details.textContent =
      formatDate(video.createdAt) + " ・ " +
      formatSize(video.size);

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.textContent = "削除";

    deleteButton.addEventListener("click", async () => {
      if (!confirm("この動画を削除しますか？")) return;

      try {
        await removeVideo(video.id);

        const oldUrl = videoUrls.get(video.id);
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        videoUrls.delete(video.id);

        await loadVideos();
      } catch (error) {
        alert("削除に失敗しました。");
      }
    });

    footer.append(details, deleteButton);
    info.append(tag, title, description, footer);
    card.append(thumbnail, info);
    grid.appendChild(card);
  });
}

// 動画を再生
function playVideo(video) {
  const player = document.getElementById("mainPlayer");
  const modal = document.getElementById("playerModal");

  if (player.src) {
    player.pause();
  }

  if (!videoUrls.has(video.id)) {
    videoUrls.set(
      video.id,
      URL.createObjectURL(video.file)
    );
  }

  player.src = videoUrls.get(video.id);

  document.getElementById("playerTitle").textContent = video.title;
  document.getElementById("playerDescription").textContent =
    video.description;

  modal.classList.add("active");
}

// 動画を読み込む
async function loadVideos() {
  videos = await getVideos();
  renderVideos();
}

// モーダル操作
const uploadModal = document.getElementById("uploadModal");
const playerModal = document.getElementById("playerModal");

document.getElementById("openUpload").onclick = () => {
  uploadModal.classList.add("active");
};

document.getElementById("closeUpload").onclick = () => {
  uploadModal.classList.remove("active");
};

document.getElementById("closePlayer").onclick = () => {
  const player = document.getElementById("mainPlayer");
  player.pause();
  player.removeAttribute("src");
  player.load();

  playerModal.classList.remove("active");
};

uploadModal.addEventListener("click", (event) => {
  if (event.target === uploadModal) {
    uploadModal.classList.remove("active");
  }
});

playerModal.addEventListener("click", (event) => {
  if (event.target === playerModal) {
    document.getElementById("closePlayer").click();
  }
});

// 検索・カテゴリー変更
document.getElementById("searchInput")
  .addEventListener("input", renderVideos);

document.getElementById("categoryFilter")
  .addEventListener("change", renderVideos);

// 動画登録
document.getElementById("uploadForm")
  .addEventListener("submit", async (event) => {

    event.preventDefault();

    const file = document.getElementById("videoFile").files[0];
    const title = document.getElementById("videoTitle").value.trim();
    const category = document.getElementById("videoCategory").value;
    const description =
      document.getElementById("videoDescription").value.trim();

    if (!file || !title) {
      alert("動画ファイルとタイトルを入力してください。");
      return;
    }

    if (!file.type.startsWith("video/")) {
      alert("動画ファイルを選択してください。");
      return;
    }

    const submitButton = event.target.querySelector(".submit-button");
    submitButton.disabled = true;
    submitButton.textContent = "登録中...";

    try {
      const thumbnail = await createThumbnail(file);

      await saveVideo({
        title,
        category,
        description,
        file,
        thumbnail,
        size: file.size,
        createdAt: Date.now()
      });

      event.target.reset();
      uploadModal.classList.remove("active");

      await loadVideos();

      alert("動画を登録しました。");

    } catch (error) {
      console.error(error);
      alert("保存できませんでした。ブラウザの空き容量などを確認してください。");

    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "動画を登録する";
    }
  });

// 起動
(async function init() {
  try {
    await openDatabase();
    await loadVideos();
  } catch (error) {
    console.error(error);
    alert("動画データベースを開けませんでした。");
  }
})();
