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

let userName;
let currentBase = "web-music";
let currentAlbum = "Common";
const musicTitle = document.getElementById("music-title");
const API = "https://webmusicapi.mywire.org";
const ap = new APlayer({
  container: document.getElementById("player"),
  autoplay: true,
  theme: "#FADFA3",
  fixed: true,
  lrcType: 3,
  audio: [],
});

async function initBody() {
  await initContent();
  await reloadList();
}

async function initContent() {
  new AudioMotionAnalyzer(document.getElementById("wave"), {
    source: ap.audio,
  });
}

async function updateTitle() {
  const currentSong = ap.list.audios[ap.list.index];
  const songTitle = currentSong.name;
  musicTitle.innerText = songTitle;
}

async function reloadList() {
  if (!currentBase) {
    currentBase = await getBaseName(albumName);
  }
  const data = await getMusicList(currentBase);
  const promises = data.map(async (song) => {
    const songData = await getMusicData(song.key, currentBase);
    ap.list.add(songData);
  });
  await Promise.all(promises);
  ap.list.show();
}

async function getMusic(e) {
  const content = prompt("Nhập link bản nhạc:");
  if ("https://" === content.slice(0, 8) || "http://" === content.slice(0, 7)) {
    const res = await fetch(`${API}/get?url=${content}&a=${currentAlbum}`);
    const data = await res.json();
    const song = await getMusicData(data.key, currentBase);
    ap.list.add(song);
  }
}

async function openAlbums() {
  const data = await getAlbumList();
  const popup = document.getElementById("popup");
  if (!popup.open) {
    popup.show();
    popup.innerHTML = `<button id="close-btn">X</button><button id="create-album" href="#">Tạo Album</button><ul id="album-container"></ul>`;
    const closeBtn = popup.querySelector("#close-btn");
    const albumContainer = popup.querySelector("#album-container");
    const createAlbum = popup.querySelector("#create-album");
    createAlbum.addEventListener("click", async () => {
      const name = prompt("Tên Album:");
      if (name) {
        const albums = await fetch(`${API}/list/create?a=${name}`);
        const data = await albums.json();
        const albumElement = document.createElement("div");
        albumElement.id = "album-action";
        albumElement.innerHTML = `<a name="${data.name} base="${data.key}">${data.name}</a>`;
        albumContainer.appendChild(albumElement);
        albumElement.addEventListener("click", async (e) => {
          currentAlbum = e.target.getAttribute("name");
          currentBase = "web-music-" + e.target.getAttribute("base");
          await reloadList();
        });
      }
    });
    for (const album of data) {
      const albumElement = document.createElement("li");
      albumElement.id = "album-action";
      albumElement.innerHTML = `<a name="${album.name}" base="${album.key}">${album.name}</a>`;
      albumContainer.appendChild(albumElement);
      albumElement.addEventListener("click", async (e) => {
        currentAlbum = e.target.getAttribute("name");
        currentBase = "web-music-" + e.target.getAttribute("base");
        await reloadList();
      });
    }
    closeBtn.addEventListener("click", () => {
      popup.close();
    });
  }
}

async function handleComment() {
  const popup = document.getElementById("popup");
  if (!popup.open) {
    popup.show();
    popup.innerHTML = `<button id="close-btn">X</button>
          <div id="comment-container"></div>
          <div class="comment-form">
          <textarea id="comment-area" placeholder="Nội dung bình luận"></textarea>
          <button id="submit-btn">Gửi</button></div>`;
    const closeBtn = popup.querySelector("#close-btn");
    const commentArea = popup.querySelector("#comment-area");
    const submitBtn = popup.querySelector("#submit-btn");
    const commentContainer = popup.querySelector("#comment-container");

    const data = await getComments();
    for (const comment of data) {
      const commentElement = document.createElement("div");
      commentElement.innerHTML = `<p><b>${comment.name}</b>: ${comment.comment}</p>`;
      commentContainer.appendChild(commentElement);
    }

    commentArea.addEventListener("focus", async () => {
      if (!userName) {
        userName = prompt("Nhập tên: ");
        if (!userName) {
          commentArea.blur();
          commentArea.value = "";
        }
      }
    });

    closeBtn.addEventListener("click", () => {
      popup.innerHTML = "";
      popup.close();
    });

    submitBtn.addEventListener("click", async () => {
      if (!commentArea.value) {
        alert("Please enter comment");
        return;
      }
      const commentText = commentArea.value;
      commentArea.value = "";
      const newComment = await putComment(userName, commentText);
      commentContainer.innerHTML += `<p><b>${newComment.name}</b>: ${newComment.comment}</p>`;
    });
  }
}

async function openSearchBar() {
  const popup = document.getElementById("popup");
  if (!popup.open) {
    popup.show();
    popup.innerHTML = `<button id="close-btn">X</button><div id="search-container">
          <input id="search-input" placeholder="Nhập từ khoá tìm kiếm"><button id="search-btn"><i class="material-icons">search</i>Tìm kiếm</button></div><div id="search-result"></div>`;
    const closeBtn = popup.querySelector("#close-btn");
    const searchBtn = popup.querySelector("#search-btn");
    const searchResult = popup.querySelector("#search-result");
    const searchInput = popup.querySelector("#search-input");
    closeBtn.addEventListener("click", () => {
      popup.innerHTML = "";
      popup.close();
    });

    searchBtn.addEventListener("click", async (e) => {
      searchResult.innerHTML = "";
      const req = await fetch(`${API}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ kw: searchInput.value }),
      });
      const data = await req.json();
      for (const item of data.videos) {
        const link = `https://www.youtube.com${item.url_suffix}`;
        const itemElement = `<li class="search-item"><img class="item-thumbnail" src="${item.thumbnails[0]}" />${item.title}<button id="add-item" link="${link}"><i class="material-icons">add</i></button></li>`;
        searchResult.insertAdjacentHTML("beforeend", itemElement);
        const addBtn = searchResult.querySelector("#add-item");
        addBtn.addEventListener("click", async (e) => {
          const link = e.target.getAttribute("link");
          const res = await fetch(`${API}/get?url=${link}&a=${currentAlbum}`);
          const data = await res.json();
          const song = await getMusicData(data.key, currentBase);
          ap.list.add(song);
        });
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", initBody);
document.getElementById("search-btn").addEventListener("click", getMusic);
document.getElementById("collections").addEventListener("click", openAlbums);
document.querySelector("#comment-btn").addEventListener("click", handleComment);
document.getElementById("open-search").addEventListener("click", openSearchBar);
ap.on("play", updateTitle);
ap.on("listswitch", updateTitle);
