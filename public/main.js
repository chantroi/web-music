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
const drive = deta.Drive("web-music");
const appContent = document.body;
const commentDiv = document.getElementById("comment");

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
}

async function loadSong(e) {
  const content = prompt("Enter the URL");
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
  appContent.style.backgroundImage = `url("${coverImage}")`;
});

Player.on("listswitch", function (i) {
  const currentSong = Player.list.audios[Player.list.index];
  const coverImage = currentSong.cover;
  appContent.style.backgroundImage = `url("${coverImage}")`;
});

document.addEventListener("DOMContentLoaded", loadBody);
document.getElementById("search-btn").addEventListener("click", loadSong);
