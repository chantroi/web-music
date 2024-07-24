import { Deta } from "https://cdn.deta.space/js/deta@latest/deta.mjs";

const API = "https://webmusicapi.mywire.org";
const Player = new APlayer({
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
const deta = Deta();
const db = deta.Base("web-music");
const drive = deta.Drive("web-music");

async function getURL(name) {
  const data = await drive.get(name);
  const blob = new Blob([data], { type: "audio/mpeg" });
  const url = URL.createObjectURL(blob);
  return url;
}
async function loadBody() {
  const res = await fetch(`${API}/list`);
  const data = await res.json();
  for (const song of data) {
    song.url = await getURL(song.key);
  }
}
async function loadSong(e) {
  const searchBox = document.getElementById("search-box");
  const content = searchBox.value;
  if ("https://" === content.slice(0, 8) || "http://" === content.slice(0, 7)) {
    const res = await fetch(`${API}/get?url=${content}`);
    const data = await res.json();
    const songKey = data.key;
    const song = await db.get(songKey);
    song.url = await getURL(songKey);
    Player.list.add(song);
  }
}

document.addEventListener("DOMContentLoaded", loadBody);
document.getElementById("search-btn").addEventListener("click", loadSong);
