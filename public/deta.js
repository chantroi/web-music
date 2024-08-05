import { Deta } from "https://cdn.deta.space/js/deta@latest/deta.mjs";

function getDeta() {
  const deta = Deta("c0kEEGmHJte_YjH9AKDzdmP4tm6Zyge3Fme9KyMRNwXB");
  const drive = deta.Drive("web-music");
  return [deta, drive];
}

async function albumBase(baseName) {
  return getDeta()[0].Base(baseName);
}

export async function getMusicData(key, baseName) {
  const drive = getDeta()[1];
  const base = await albumBase(baseName);
  const data = await drive.get(key);
  const blob = new Blob([data], { type: "audio/mpeg" });
  const url = URL.createObjectURL(blob);
  const music = await base.get(key);
  music.url = url;
  return music;
}

export async function getMusicList(baseName) {
  const base = await albumBase(baseName);
  const result = await base.fetch();
  const musicList = result.items;
  return musicList;
}

export async function putComment(name, comment) {
  const deta = getDeta()[0];
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
export async function getBaseName(albumName) {
  if (albumName === "Common") {
    return "web-music";
  } else {
    const albums = await getAlbumList();
    for (const album of albums) {
      if (album.name === albumName) {
        return `web-music-${album.key}`;
      }
    }
  }
}
