const Api = "https://collection.serv00.net";
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
    fetch(`${Api}/get?url=${link}`)
      .then((response) => response.json())
      .then((data) => ap.list.add([data]))
      .catch((err) => console.log(err));
  });
}

function loadAlbum() {
  fetch(`${Api}/album/get`)
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

document.addEventListener("htmx:afterOnLoad", function (event) {
  const link = document.querySelector("#search-box").value;
  fetch(`${Api}/get?url=${link}`)
    .then((response) => response.json())
    .then((data) => ap.list.add([data]))
    .catch((err) => console.log(err));

  document.querySelector("#search-box").value = "";
});
