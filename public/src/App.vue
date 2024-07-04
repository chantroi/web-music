<script setup>
import { ref, onMounted } from 'vue';
import 'aplayer/dist/APlayer.min.css';
import APlayer from 'aplayer';


const ytLink = ref('');
const api = 'https://mydash-musicapi.hf.space';
const backend = 'https://webmusic1-se5r0bbh.b4a.run';
let player;

onMounted(() => {
  player = new APlayer({
    container: document.getElementById('player'),
    mini: false,
    autoplay: true,
    theme: '#FADFA3',
    preload: 'auto',
    volume: 1,
    mutex: true,
    listFolded: false,
    listMaxHeight: 90,
    lrcType: 3,
    audio: [],
  });

  loadBody();
});


const loadBody = () => {
  fetch(`${api}/list`)
    .then(res => res.json())
    .then(data => {
      data.forEach(song => {
        playSong(song);
      });
    })
    .catch(err => {
      console.error(err);
    });
};


const playSong = (link) => {
  fetch(`${api}/get?url=${link}`)
    .then(res => res.json())
    .then(data => {
      player.list.add([data]);
    })
    .catch(err => {
      console.error(err);
    });
};

const saveUrl = () => {
  fetch(`${backend}/add?url=${ytLink.value}`)
    .then(res => res.json())
    .then(data => {
      console.log(data);
      playSong(ytLink.value);
    })
    .catch(err => {
      console.error(err);
    });
};
</script>

<template>
  <div>
    <input type="text" v-model="ytLink" placeholder="URL">
    <button @click="saveUrl()">Add</button>
  </div>
  <div id="player"></div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>