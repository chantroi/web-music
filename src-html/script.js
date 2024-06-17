import { Deta } from "https://cdn.deta.space/js/deta@latest/deta.mjs";

const urlParams = new URLSearchParams(window.location.search);
const album = urlParams.get("a") || "Web Âm Nhạc";
const deta = Deta("c0a1xmuzlhz9ukoxqAYL8nr8w9hPai2kPbyf7qnAaGC");
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

async function loadAlbum() {
  try {
    const res = await base.fetch();
    console.log("Fetch result:", res);

    if (res && res.items) {
      const items = res.items;
      items.forEach((item) => {
        if (album === item.key) {
          loadPlayer(item.list);
        } else {
          console.log(`Skipping album: ${item.key}`);
        }
      });
    } else {
      console.error("No items found in the response");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function loadPlayer(songs) {
  for (const link of songs) {
    if (link) {
      try {
        const response = await fetch(
          `https://mydash-webmusic.hf.space/get?url=${link}`
        );
        const data = await response.json();
        ap.list.add([data]);
      } catch (err) {
        console.error(`Error loading song from link: ${link}`, err);
      }
    }
  }
}

loadAlbum();
