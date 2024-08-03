import "./style.css";
import "aplayer/dist/APlayer.min.css";
import APlayer from "aplayer";
import { Deta } from "https://cdn.deta.space/js/deta@latest/deta.mjs";

const API = "https://webmusicapi.mywire.org";
const Player = new APlayer({
  container: document.getElementById("player"),
  autoplay: true,
  theme: "#FADFA3",
  fixed: true,
  lrcType: 3,
  audio: [],
});
const deta = Deta("c0kEEGmHJte_YjH9AKDzdmP4tm6Zyge3Fme9KyMRNwXB");
const base = deta.Base("web-music");
const commentBase = deta.Base("comments");
const drive = deta.Drive("web-music");
const commentDiv = document.getElementById("comment");
const rotatingImage = document.getElementById("cover-rotating-image");

async function getURL(name) {
  const data = await drive.get(name);
  const blob = new Blob([data], { type: "audio/mpeg" });
  const url = URL.createObjectURL(blob);
  return url;
}

async function loadBody() {
  const res = await fetch(`${API}/list`);
  const data = await res.json();

  const promises = data.map(async (song) => {
    song.url = await getURL(song.key);
    Player.list.add(song);
  });

  await Promise.all(promises);
  Player.list.show();
  await loadComments();
}

async function loadComments() {
  const res = await fetch(`${API}/comments`);
  const data = await res.json();
  for (const comment of data) {
    const thisComment = document.createElement("div");
    thisComment.innerHTML = `<b>${comment.name}</b>: ${comment.comment}`;
    commentDiv.appendChild(thisComment);
  }
}

async function loadSong(e) {
  const content = prompt("Nhập link bản nhạc:");
  if ("https://" === content.slice(0, 8) || "http://" === content.slice(0, 7)) {
    const res = await fetch(`${API}/get?url=${content}`);
    const data = await res.json();
    const song = await base.get(data.key);
    song.url = await getURL(data.key);
    Player.list.add(song);
  }
}

Player.on("play", function () {
  const currentSong = Player.list.audios[Player.list.index];
  const coverImage = currentSong.cover;
  rotatingImage.src = coverImage;
});

Player.on("listswitch", function (i) {
  const currentSong = Player.list.audios[Player.list.index];
  const coverImage = currentSong.cover;
  rotatingImage.src = coverImage;
});
document.addEventListener("DOMContentLoaded", loadBody);

document.getElementById("search-btn").addEventListener("click", loadSong);

document.querySelector("#comment-btn").addEventListener("click", async () => {
  const popup = document.createElement("div");
  const nameInput = document.createElement("input");
  const commentArea = document.createElement("textarea");
  const closeBtn = document.createElement("button");
  const submitBtn = document.createElement("button");

  nameInput.setAttribute("type", "text");
  nameInput.setAttribute("placeholder", "Nhập tên của bạn");

  commentArea.setAttribute("placeholder", "Vui lòng nhập bình luận");

  closeBtn.innerText = "Đóng";
  closeBtn.className = "close-btn";
  submitBtn.innerText = "Gửi";
  submitBtn.className = "submit-btn";

  popup.appendChild(nameInput);
  popup.appendChild(commentArea);
  popup.appendChild(submitBtn);
  popup.appendChild(closeBtn);
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.padding = "20px";
  popup.style.backgroundColor = "white";
  popup.style.border = "1px solid black";
  popup.style.zIndex = "1000";

  document.body.appendChild(popup);

  closeBtn.addEventListener("click", () => {
    document.body.removeChild(popup);
  });

  submitBtn.addEventListener("click", async () => {
    const thisComment = document.createElement("div");
    thisComment.innerHTML = `<b>${nameInput.value}</b>: ${commentArea.value}`;
    commentDiv.appendChild(thisComment);
    document.body.removeChild(popup);

    const newComment = await commentBase.put({
      name: nameInput.value,
      comment: commentArea.value,
    });
    console.log(newComment);
  });
});
