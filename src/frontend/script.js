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
    fetch(
      `https://667e81b8759f2fa458e0.appwrite.global/?action=music&url=${link}`
    )
      .then((response) => response.json())
      .then((data) => ap.list.add([data]))
      .catch((err) => console.log(err));
  });
}

function loadPlaylist() {
  fetch("https://webmusic1-se5r0bbh.b4a.run/list")
    .then((response) => response.json())
    .then((data) =>
      data.forEach((album) => {
        loadPlayer(album.list);
      })
    )
    .catch((err) => console.log(err));
}

function loadSong() {
  const link = document.querySelector("#search-box").value;
  fetch(
    `https://667e81b8759f2fa458e0.appwrite.global/?action=music&url=${link}`
  )
    .then((response) => response.json())
    .then(
      (data) =>
        function () {
          ap.list.add([data]);
          fetch(
            `https://webmusic1-se5r0bbh.b4a.run/add?url=${data.url}&name=${data.name}&artist=${data.artist}&cover=${data.cover}`
          )
            .then((response) => response.json())
            .then((data) => console.log(data))
            .catch((err) => console.log(err));
        }
    )
    .catch((err) => console.log(err));

  document.querySelector("#search-box").value = "";
}

function ytSearch() {
  const inputText = document.querySelector("#search-box").value;
  if (!inputText.startsWith("http")) {
    fetch(
      `https://667e81b8759f2fa458e0.appwrite.global/?action=search&kw=${inputText}`
    )
      .then((response) => response.json())
      .then((data) => data.forEach((result) => showResult(result)));
  }
}
