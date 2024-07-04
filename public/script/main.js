const API = "https://mydash-musicapi.hf.space";
const Backend = "https://webmusic1-se5r0bbh.b4a.run";
const Player = new APlayer({
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
eruda.init();

function loadBody() {
  fetch(`${Backend}/list`)
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
function playSong(link) {
  fetch(`${API}/get?url=${link}`)
    .then((response) => response.json())
    .then((data) => {
      Player.list.add([data]);
    })
    .catch((err) => console.log(err));
}

function saveUrl(link) {
  fetch(`${Backend}/add?url=${link}`).catch((error) => console.error(error));
  document.querySelector("#search-box").value = "";
}

document.getElementById("search-btn").addEventListener("click", (e) => {
  const link = document.getElementById("search-box").value;
  saveUrl(link);
  playSong(link);
});
