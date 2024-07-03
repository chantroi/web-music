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
    fetch(`https://webmusic1-se5r0bbh.b4a.run/get?action=music&url=${data.url}`)
      .then((response) => {
        response.json();
      })
      .then((data) => {
        ap.list.add([song]);
      });
  });
}

function loadPlaylist() {
  fetch("https://webmusic1-se5r0bbh.b4a.run/list")
    .then((response) => response.json())
    .then((data) => {
      data.forEach(function (songData) {
        loadPlayer(songData);
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

function loadSong() {
  const link = document.querySelector("#search-box").value;
  fetch(`https://webmusic1-se5r0bbh.b4a.run/get?action=music&url=${link}`)
    .then((response) => {
      response.json();
    })
    .then((data) => {
      ap.list.add([data]);
      fetch(
        `https://webmusic1-se5r0bbh.b4a.run/add?url=${link}&name=${data.name}&artist=${data.artist}&cover=${data.cover}`
      );
    })
    .catch((err) => {
      console.log(err);
    });

  document.querySelector("#search-box").value = "";
}
