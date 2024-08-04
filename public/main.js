import "./style.css";
import "aplayer/dist/APlayer.min.css";
import APlayer from "aplayer";
import AudioMotionAnalyzer from "audiomotion-analyzer";
import { Deta } from "https://cdn.deta.space/js/deta@latest/deta.mjs";

let currentAlbum = "Common";
const API = "https://webmusicapi.mywire.org";
const Player = new APlayer({
  container: document.getElementById("player"),
  autoplay: true,
  theme: "#FADFA3",
  fixed: true,
  lrcType: 3,
  audio: [],
});
Player.on("play", function () {
  const currentSong = Player.list.audios[Player.list.index];
  const songTitle = currentSong.name;
  musicTitle.innerText = songTitle;
});

Player.on("listswitch", function (i) {
  const currentSong = Player.list.audios[Player.list.index];
  const songTitle = currentSong.name;
  musicTitle.innerText = songTitle;
});

const audioMotion = new AudioMotionAnalyzer(document.getElementById("wave"), {
  source: Player.audio,
});

const deta = Deta("c0kEEGmHJte_YjH9AKDzdmP4tm6Zyge3Fme9KyMRNwXB");
const commentBase = deta.Base("comments");
const drive = deta.Drive("web-music");
let base = deta.Base("web-music");

const musicTitle = document.getElementById("music-title");
let userName;

async function getURL(name) {
  const data = await drive.get(name);
  const blob = new Blob([data], { type: "audio/mpeg" });
  const url = URL.createObjectURL(blob);
  return url;
}

async function loadBody() {
  const res = await fetch(`${API}/list?a=${currentAlbum}`);
  const data = await res.json();

  const promises = data.map(async (song) => {
    song.url = await getURL(song.key);
    Player.list.add(song);
  });

  await Promise.all(promises);
  Player.list.show();
}

async function loadSong(e) {
  const content = prompt("Nhập link bản nhạc:");
  if ("https://" === content.slice(0, 8) || "http://" === content.slice(0, 7)) {
    const res = await fetch(`${API}/get?url=${content}&a=${currentAlbum}`);
    const data = await res.json();
    const song = await base.get(data.key);
    song.url = await getURL(data.key);
    Player.list.add(song);
  }
}

async function openAlbums() {
  const res = await fetch(`${API}/list`);
  const data = await res.json();
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
        albumElement.innerHTML = `<a name="${data.name}">${data.name}</a>`;
        albumContainer.appendChild(albumElement);
        albumElement.addEventListener("click", async (e) => {
          currentAlbum = e.target.getAttribute("name");
          await reloadBase(currentAlbum);
          await loadBody();
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
        const keyName = e.target.getAttribute("base");
        base = deta.Base(`web-music-${keyName}`);
        await loadBody();
      });
    }
    closeBtn.addEventListener("click", () => {
      popup.close();
    });
  }
}

document.querySelector("#comment-btn").addEventListener("click", async () => {
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

    const comments = await fetch(`${API}/comments`);
    const data = await comments.json();
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
      commentText = commentArea.value;
      commentArea.value = "";
      const newComment = await commentBase.put({
        name: userName,
        comment: commentText,
      });
      commentContainer.innerHTML += `<p><b>${newComment.name}</b>: ${newComment.comment}</p>`;
    });
  }
});

document.addEventListener("DOMContentLoaded", loadBody);
document.getElementById("search-btn").addEventListener("click", loadSong);
document.getElementById("collections").addEventListener("click", openAlbums);
