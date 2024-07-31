import "aplayer/dist/APlayer.min.css";
import "./style.css";
import { Deta } from "https://cdn.deta.space/js/deta@latest/deta.mjs";
import APlayer from "aplayer";

const API = "https://webmusicapi.mywire.org";
const deta = Deta("c0kEEGmHJte_YjH9AKDzdmP4tm6Zyge3Fme9KyMRNwXB");
const base = deta.Base("web-music");
const drive = deta.Drive("web-music");
let Player;
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
}

async function loadSong(e) {
  const searchBox = document.getElementById("search-box");
  const content = searchBox.value;
  if ("https://" === content.slice(0, 8) || "http://" === content.slice(0, 7)) {
    const res = await fetch(`${API}/get?url=${content}`);
    const data = await res.json();
    const song = await base.get(data.key);
    song.url = await getURL(data.key);
    Player.list.add(song);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  Player = new APlayer({
    container: document.getElementById("player"),
    mini: false,
    autoplay: true,
    theme: "#FADFA3",
    preload: "auto",
    volume: 1,
    mutex: true,
    listFolded: false,
    listMaxHeight: 90,
    lrcType: 3,
    audio: [],
  });
  loadBody();
  document.getElementById("search-btn").addEventListener("click", loadSong);
});
