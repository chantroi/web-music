import { Deta } from "https://cdn.deta.space/js/deta@latest/deta.mjs";

const deta = new Deta("c0kEEGmHJte_YjH9AKDzdmP4tm6Zyge3Fme9KyMRNwXB");
const drive = deta.Drive("web-music");

export async function getMusic(path) {
  const fileBlob = await drive.get(path);
  const fileUrl = URL.createObjectURL(fileBlob);
  return fileUrl;
}
