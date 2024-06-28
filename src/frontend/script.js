import { Deta } from "https://cdn.deta.space/js/deta@latest/deta.mjs";

const deta = new Deta("c0kEEGmHJte_YjH9AKDzdmP4tm6Zyge3Fme9KyMRNwXB");
const db = deta.Base("web-music");
const drive = deta.Drive("web-music");
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
      const blobMusic = drive.get(`${data.name}.mp3`);
      const musicUrl = URL.createObjectURL(blobMusic);
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
    const response = fetch("https://webmusic1-se5r0bbh.b4a.run/list");
    const data = await response.json();

    for (const songData of data) {
      await loadPlayer(songData);
    }
  } catch (err) {
    console.log(err);
  }
}

async function loadSong() {
  const link = document.querySelector("#search-box").value;
  try {
    const response = await fetch(
      `https://667e81b8759f2fa458e0.appwrite.global/?action=music&url=${link}`
    );
    const data = await response.json();
    ap.list.add([data]);

    const addResponse = await fetch(
      `https://webmusic1-se5r0bbh.b4a.run/add?url=${link}&name=${data.name}&artist=${data.artist}&cover=${data.cover}`
    );
    const addData = await addResponse.json();
    console.log(addData);

    const musicResponse = await fetch(data.url);
    const musicBlob = await musicResponse.blob();
    const musicArrayBuffer = await musicBlob.arrayBuffer();
    const fileName = `${data.name}.mp3`;
    const putResponse = await drive.put(fileName, {
      data: new Uint8Array(musicArrayBuffer),
    });
    console.log("File uploaded successfully:", putResponse);
  } catch (err) {
    console.log(err);
  }

  document.querySelector("#search-box").value = "";
}

loadPlaylist();
document.querySelector("#search-button").addEventListener("click", async () => {
  await loadSong();
});
