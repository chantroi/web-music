import { Deta } from "https://cdn.deta.space/js/deta@latest/deta.mjs";

const urlParams = new URLSearchParams(window.location.search);
const album = urlParams.get("a") || "Web Âm Nhạc";
const deta = Deta("c0a1xmuzlhz_9ukoxqAYL8nr8w9hPai2kPbyf7qnAaGC");
const base = deta.Base("music");
const ap = new APlayer({
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

function loadAlbum() {
  const res = base.fetch();
  const items = res.items;
  items.forEach((item) => {
    if (album === item.key) {
      loadPlayer(item.list);
    } else {
      console.log(item.key);
    }
  });
}

function loadPlayer(songs) {
  songs.forEach((link) => {
    fetch(`https://mydash-webmusic.hf.space/get?url=${link}`)
      .then((response) => response.json())
      .then((data) => ap.list.add([data]))
      .catch((err) => console.log(err));
  });
}

loadAlbum();
