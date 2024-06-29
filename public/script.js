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
  album.forEach((data) => {
    try {
      const musicUrl = getMusic(data.path);
      const song = {
        name: data.name,
        artist: data.artist,
        url: musicUrl,
        cover: data.cover,
      };
      ap.list.add([song]);
    } catch (err) {
      console.log(`Error loading song ${data.name}:`, err);
    }
  });
}

function loadPlaylist() {
  try {
    const response = fetch("https://webmusicapi.mywire.org/list");
    const data = response.json();
    data.forEach(function (songData) {
      loadPlayer(songData);
    });
  } catch (err) {
    console.log(err);
  }
}

function loadSong() {
  const link = document.querySelector("#search-box").value;
  fetch(
    `https://667e81b8759f2fa458e0.appwrite.global/?action=music&url=${link}`
  )
    .then((response) => {
      response.json();
    })
    .then((data) => {
      ap.list.add([data]);
    });

  fetch(
    `https://webmusicapi.mywire.org/add?url=${link}&name=${data.name}&artist=${data.artist}&cover=${data.cover}&dl=${data.url}`
  )
    .then((response) => {
      response.json();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
    });

  document.querySelector("#search-box").value = "";
}
