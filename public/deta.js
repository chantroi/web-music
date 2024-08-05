import { Deta } from "https://cdn.deta.space/js/deta@latest/deta.mjs";

function getDeta() {
  const deta = Deta("c0kEEGmHJte_YjH9AKDzdmP4tm6Zyge3Fme9KyMRNwXB");
  const drive = deta.Drive("web-music");
  return [deta, drive];
}

async function albumBase(albumName) {
  const albums = await getAlbumList();
  for (const album of albums) {
    if (albumName === "Common") {
      return getDeta()[0].Base("web-music");
    }
    if (album.name === albumName) {
      return getDeta()[0].Base(`web-music-${album.key}`);
    }
  }
}

export async function getMusicData(key, albumName) {
  const drive = getDeta()[1];
  const base = await albumBase(albumName);
  const data = await drive.get(key);
  const blob = new Blob([data], { type: "audio/mpeg" });
  const url = URL.createObjectURL(blob);
  const music = await base.get(key);
  music.url = url;
  return music;
}

export async function getMusicList(albumName) {
  const base = await albumBase(albumName);
  const drive = getDeta()[1];
  const result = await base.fetch();
  const musicList = result.items;
  for (const music of musicList) {
    const data = await drive.get(music.key);
    const blob = new Blob([data], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    music.url = url;
  }
  return musicList;
}

export async function putComment(name, comment) {
  const deta = getDeta();
  const base = deta.Base("comments");
  const commentData = await base.put({
    name,
    comment,
  });
  return commentData;
}

export async function getComments() {
  const deta = getDeta()[0];
  const base = deta.Base("comments");
  const result = await base.fetch();
  const comments = result.items;
  return comments;
}

export async function getAlbumList() {
  const deta = getDeta()[0];
  const base = deta.Base("albums");
  const result = await base.fetch();
  const albums = result.items;
  return albums;
}
