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
  const items = base.fetch().items;
  items.forEach((item) => {
    if (album === item.key) {
      loadPlayer(album.list);
    } else {
      console.log(album.key);
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
