import "aplayer/dist/APlayer.min.css";
import APlayer from "aplayer";
import AudioMotionAnalyzer from "audiomotion-analyzer";
import "./style.css";
import {
  getMusicData,
  getMusicList,
  putComment,
  getComments,
  getAlbumList,
  getBaseName,
} from "./deta";

let currentUserName;
let currentMusicBase = "web-music";
let currentAlbumName = "Common";
const musicTitleElement = document.getElementById("music-title");
const API_ENDPOINT = "https://webmusicapi.mywire.org";

const audioPlayer = new APlayer({
  container: document.getElementById("audio-player-container"),
  autoplay: true,
  theme: "#FADFA3",
  fixed: true,
  lrcType: 3,
  audio: [],
});

function showNotification(message, type, duration = 3000) {
  const notificationContainer = document.getElementById(
    "notification-container"
  );
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  notificationContainer.appendChild(notification);

  // Kích hoạt reflow
  notification.offsetHeight;

  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notificationContainer.removeChild(notification);
    }, 300);
  }, duration);
}

function showLoadingIndicator() {
  showNotification("Đang tải...", "loading");
}

function hideLoadingIndicator() {
  const loadingNotification = document.querySelector(".notification-loading");
  if (loadingNotification) {
    loadingNotification.remove();
  }
}

function showSuccessMessage(message) {
  showNotification(message, "success");
  console.log("Thành công:", message);
}

function showErrorMessage(message) {
  showNotification(message, "error");
  console.error("Lỗi:", message);
}

function showInfoMessage(message) {
  showNotification(message, "info");
  console.info("Thông tin:", message);
}

async function initializeApplication() {
  await initializeAudioVisualizer();
  await reloadMusicList();
}

function initializeAudioVisualizer() {
  new AudioMotionAnalyzer(document.getElementById("audio-visualizer"), {
    source: audioPlayer.audio,
  });
}

function updateMusicTitle() {
  const currentSong = audioPlayer.list.audios[audioPlayer.list.index];
  if (currentSong) musicTitleElement.innerText = currentSong.name;
}

async function reloadMusicList() {
  if (!currentMusicBase) {
    currentMusicBase = await getBaseName(currentAlbumName);
  }
  showLoadingIndicator();
  try {
    const musicList = await getMusicList(currentMusicBase);

    // Xóa danh sách hiện tại
    audioPlayer.list.clear();

    // Tải và thêm từng bài hát một
    for (const song of musicList) {
      try {
        const musicData = await getMusicData(song.key, currentMusicBase);
        audioPlayer.list.add(musicData);

        // Hiển thị danh sách ngay sau khi thêm bài hát đầu tiên
        if (audioPlayer.list.audios.length === 1) {
          audioPlayer.list.show();
        }
      } catch (error) {
        console.error(`Không thể tải bài hát: ${song.key}`, error);
      }
    }

    showSuccessMessage("Danh sách nhạc đã được cập nhật thành công!");
  } catch (error) {
    showErrorMessage("Không thể tải danh sách nhạc. Vui lòng thử lại.");
  } finally {
    hideLoadingIndicator();
  }
}

async function addMusicFromLink() {
  const musicLink = prompt("Nhập liên kết nhạc:");
  if (
    musicLink &&
    (musicLink.startsWith("https://") || musicLink.startsWith("http://"))
  ) {
    showLoadingIndicator();
    try {
      const response = await fetch(
        `${API_ENDPOINT}/get?url=${musicLink}&a=${currentAlbumName}`
      );
      const data = await response.json();
      const song = await getMusicData(data.key, currentMusicBase);
      audioPlayer.list.add(song);
      showSuccessMessage("Đã thêm nhạc thành công!");
    } catch (error) {
      showErrorMessage("Không thể thêm nhạc. Vui lòng thử lại.");
    } finally {
      hideLoadingIndicator();
    }
  } else {
    showErrorMessage("Liên kết không hợp lệ. Vui lòng nhập một URL hợp lệ.");
  }
}

async function openAlbumSelector() {
  const albumList = await getAlbumList();
  const popupElement = document.getElementById("popup-dialog");

  if (!popupElement.open) {
    popupElement.show();
    popupElement.innerHTML = `
      <button id="close-popup-btn">X</button>
      <button id="create-album-btn">Tạo danh sách mới</button>
      <ul id="album-list-container"></ul>
    `;

    const closeButton = popupElement.querySelector("#close-popup-btn");
    const albumListContainer = popupElement.querySelector(
      "#album-list-container"
    );
    const createAlbumButton = popupElement.querySelector("#create-album-btn");

    createAlbumButton.addEventListener("click", createNewAlbum);
    closeButton.addEventListener("click", () => popupElement.close());

    albumList.forEach((album) => {
      const albumElement = createAlbumElement(album);
      albumListContainer.appendChild(albumElement);
    });
  }
}

function createAlbumElement(album) {
  const albumElement = document.createElement("li");
  albumElement.classList.add("album-item");
  albumElement.innerHTML = `<a data-name="${album.name}" data-base="${album.key}">${album.name}</a>`;
  albumElement.addEventListener("click", selectAlbum);
  return albumElement;
}

async function selectAlbum(event) {
  const selectedAlbum = event.target;
  currentAlbumName = selectedAlbum.dataset.name;
  currentMusicBase = "web-music-" + selectedAlbum.dataset.base;
  await reloadMusicList();
  showSuccessMessage(`Đã chọn album "${currentAlbumName}".`);
}

async function createNewAlbum() {
  const albumName = prompt("Nhập tên album:");
  if (albumName) {
    showLoadingIndicator();
    try {
      const response = await fetch(
        `${API_ENDPOINT}/list/create?a=${albumName}`
      );
      const newAlbum = await response.json();
      const albumElement = createAlbumElement(newAlbum);
      document.getElementById("album-list-container").appendChild(albumElement);
      showSuccessMessage(`Đã tạo album "${albumName}" thành công!`);
    } catch (error) {
      showErrorMessage("Không thể tạo album. Vui lòng thử lại.");
    } finally {
      hideLoadingIndicator();
    }
  }
}

async function openCommentSection() {
  const popupElement = document.getElementById("popup-dialog");
  if (!popupElement.open) {
    popupElement.show();
    popupElement.innerHTML = `
      <button id="close-popup-btn">X</button>
      <div id="comment-list-container"></div>
      <div class="comment-form">
        <textarea id="comment-input" placeholder="Nhập bình luận của bạn"></textarea>
        <button id="submit-comment-btn">Gửi</button>
      </div>
    `;

    const closeButton = popupElement.querySelector("#close-popup-btn");
    const commentInput = popupElement.querySelector("#comment-input");
    const submitButton = popupElement.querySelector("#submit-comment-btn");
    const commentListContainer = popupElement.querySelector(
      "#comment-list-container"
    );

    showLoadingIndicator();
    try {
      const comments = await getComments();
      comments.forEach((comment) => {
        const commentElement = createCommentElement(comment);
        commentListContainer.appendChild(commentElement);
      });
      showSuccessMessage("Đã tải bình luận thành công!");
    } catch (error) {
      showErrorMessage("Không thể tải bình luận. Vui lòng thử lại.");
    } finally {
      hideLoadingIndicator();
    }

    commentInput.addEventListener("focus", promptForUsername);
    closeButton.addEventListener("click", () => popupElement.close());
    submitButton.addEventListener("click", submitComment);
  }
}

function createCommentElement(comment) {
  const commentElement = document.createElement("div");
  commentElement.classList.add("comment-item");
  commentElement.innerHTML = `<p><strong>${comment.name}</strong>: ${comment.comment}</p>`;
  return commentElement;
}

async function promptForUsername() {
  if (!currentUserName) {
    currentUserName = prompt("Nhập tên của bạn:");
    if (!currentUserName) {
      document.getElementById("comment-input").blur();
      document.getElementById("comment-input").value = "";
    }
  }
}

async function submitComment() {
  const commentInput = document.getElementById("comment-input");
  const commentText = commentInput.value.trim();

  if (!commentText) {
    showErrorMessage("Vui lòng nhập bình luận.");
    return;
  }

  showLoadingIndicator();
  try {
    const newComment = await putComment(currentUserName, commentText);
    const commentElement = createCommentElement(newComment);
    document
      .getElementById("comment-list-container")
      .appendChild(commentElement);
    commentInput.value = "";
    showSuccessMessage("Đã gửi bình luận thành công!");
  } catch (error) {
    showErrorMessage("Không thể gửi bình luận. Vui lòng thử lại.");
  } finally {
    hideLoadingIndicator();
  }
}

function openSearchBar() {
  const popupElement = document.getElementById("popup-dialog");
  if (!popupElement.open) {
    popupElement.show();
    popupElement.innerHTML = `
      <button id="close-popup-btn">X</button>
      <div id="search-container">
        <input id="search-input" placeholder="Nhập từ khóa tìm kiếm">
        <button id="search-button"><i class="material-icons">search</i>Tìm kiếm</button>
      </div>
      <ul id="search-results-list"></ul>
    `;

    const closeButton = popupElement.querySelector("#close-popup-btn");
    const searchButton = popupElement.querySelector("#search-button");
    const searchInput = popupElement.querySelector("#search-input");

    closeButton.addEventListener("click", () => popupElement.close());
    searchButton.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") performSearch();
    });
  }
}

async function performSearch() {
  const searchInput = document.getElementById("search-input");
  const searchResultsList = document.getElementById("search-results-list");
  const searchKeyword = searchInput.value.trim();

  if (!searchKeyword) {
    showErrorMessage("Vui lòng nhập từ khóa tìm kiếm.");
    return;
  }

  showLoadingIndicator();
  searchResultsList.innerHTML = "";

  try {
    const response = await fetch(`${API_ENDPOINT}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kw: searchKeyword }),
    });
    const data = await response.json();

    data.videos.forEach((video) => {
      const listItem = createSearchResultItem(video);
      searchResultsList.appendChild(listItem);
    });

    if (data.videos.length === 0) {
      showInfoMessage("Không tìm thấy kết quả.");
    } else {
      showSuccessMessage(`Đã tìm thấy ${data.videos.length} kết quả.`);
    }
  } catch (error) {
    showErrorMessage("Tìm kiếm thất bại. Vui lòng thử lại.");
  } finally {
    hideLoadingIndicator();
  }
}

function createSearchResultItem(video) {
  const listItem = document.createElement("li");
  listItem.classList.add("search-result-item");
  const youtubeLink = `https://www.youtube.com${video.url_suffix}`;

  listItem.innerHTML = `
    <img class="result-thumbnail" src="${video.thumbnails[0]}" alt="${video.title}" />
    <span class="result-title">${video.title}</span>
    <button class="add-to-playlist-btn" data-link="${youtubeLink}">
      <i class="material-icons">add</i>
    </button>
  `;

  listItem
    .querySelector(".add-to-playlist-btn")
    .addEventListener("click", addToPlaylist);
  return listItem;
}

async function addToPlaylist(event) {
  const button = event.currentTarget;
  const link = button.dataset.link;

  showLoadingIndicator();
  try {
    const response = await fetch(
      `${API_ENDPOINT}/get?url=${link}&a=${currentAlbumName}`
    );
    const data = await response.json();
    const song = await getMusicData(data.key, currentMusicBase);
    audioPlayer.list.add(song);
    showSuccessMessage("Đã thêm bài hát vào danh sách phát thành công!");
  } catch (error) {
    showErrorMessage(
      "Không thể thêm bài hát vào danh sách phát. Vui lòng thử lại."
    );
  } finally {
    hideLoadingIndicator();
  }
}

document.addEventListener("DOMContentLoaded", initializeApplication);
document
  .getElementById("add-music-btn")
  .addEventListener("click", addMusicFromLink);
document
  .getElementById("open-albums-btn")
  .addEventListener("click", openAlbumSelector);
document
  .getElementById("open-comments-btn")
  .addEventListener("click", openCommentSection);
document
  .getElementById("open-search-btn")
  .addEventListener("click", openSearchBar);
audioPlayer.on("play", updateMusicTitle);
audioPlayer.on("listswitch", updateMusicTitle);
