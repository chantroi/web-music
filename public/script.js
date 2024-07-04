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
    fetch(`https://mydash-musicapi.hf.space/get?url=${data.url}`)
      .then((response) => response.json())
      .then((song) => {
        ap.list.add([song]);
      });
  });
}

function loadPlaylist() {
  fetch("https://webmusic1-se5r0bbh.b4a.run/list")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((song) => {
        loadPlayer(song);
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

function loadSong() {
  const link = document.querySelector("#search-box").value;
  fetch(`https://mydash-musicapi.hf.space/get?url=${link}`)
    .then((response) => response.json())
    .then((data) => {
      ap.list.add([data]);
      fetch(`https://webmusic1-se5r0bbh.b4a.run/add?url=${link}`).catch(
        (error) => console.error(error)
      );
    })
    .catch((err) => console.log(err));

  document.querySelector("#search-box").value = "";
}
