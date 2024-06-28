const urlParams = new URLSearchParams(window.location.search);
const albumInput = document.querySelector("#album");
const Album = urlParams.get("a") || "Web Âm Nhạc";

albumInput.value = Album;
document.title = Album;

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

function loadPlayer(album) {
  album.forEach((link) => {
    fetch(`https://mydash-webmusic.hf.space/get?url=${link}`)
      .then((response) => response.json())
      .then((data) => ap.list.add([data]))
      .catch((err) => console.log(err));
  });
}

function loadAlbum() {
  fetch("https://webmusic1-se5r0bbh.b4a.run/album/get")
    .then((response) => response.json())
    .then((data) =>
      data.forEach((album) => {
        if (Album === album.key) {
          loadPlayer(album.list);
        } else {
          console.log(album.key);
        }
      })
    )
    .catch((err) => console.log(err));
}

function loadSideNav(albums) {
  const sideNav = document.querySelector("#mobile-demo");
  albums.forEach(
    (album) =>
      function () {
        const snItem = `<li><a onclick="loadAlbum(${album})">${album.key}</a></li>`;
        sideNav.insertAdjacentHTML("beforeend", snItem);
      }
  );
}

function ytSearch() {
  const inputText = document.querySelector("#search-box").value;
  if (!inputText.startsWith("http")) {
    fetch("https://mydash-webmusic.hf.space/")
      .then((response) => response.json())
      .then((data) => data.forEach((result) => showResult(result)));
  }
}

function showResult(result) {
  const nav = document.querySelector("#nav-bar");
  const cover = result.cover;
  const link = `https://youtube.com${result.url_suffix}`;
  const title = result.title;
  const ulist = document.createElement("ul");
  ul;
}

document.addEventListener("htmx:afterOnLoad", function (event) {
  const link = document.querySelector("#search-box").value;
  fetch(`https://mydash-webmusic.hf.space/get?url=${link}`)
    .then((response) => response.json())
    .then((data) => ap.list.add([data]))
    .catch((err) => console.log(err));

  document.querySelector("#search-box").value = "";
});
