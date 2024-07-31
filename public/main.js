import "aplayer/dist/APlayer.min.css";
import "./style.css";
import { Deta } from "https://cdn.deta.space/js/deta@latest/deta.mjs";
import APlayer from "aplayer";

const app = document.querySelector("#app");
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

const ContentBody = `<nav class="nav-extended">
        <div class="nav-wrapper">
          <div class="input-field">
            <input id="search-box" type="text" name="url" />
            <label class="label-icon" for="search-box"
              ><i class="material-icons">search</i></label
            >
          </div>
          <button id="search-btn">
            <i class="material-icons">add</i>
          </button>
        </div>
      </nav>
      <div class="row">
        <div class="card">
          <div id="player"></div>
        </div>
      </div>`;

document.addEventListener("DOMContentLoaded", function () {
  app.innerHTML = ContentBody;
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
