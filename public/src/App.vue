<script setup>
import 'aplayer/dist/APlayer.min.css';
import APlayer from 'aplayer';

export default {
  data() {
    const player = new APlayer({
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
    })

    return {
      api: 'https://mydash-musicapi.hf.space',
      backend: 'https://webmusic1-se5r0bbh.b4a.run',
      player: player,
      ytLink: ''
    }
  },
  methods: {
    loadBody() {
      fetch(`${this.api}/list`)
        .then(res => res.json())
        .then(data => {
          data.forEach(
            song => {
              this.playSong(song)
            }
          )
        })
        .catch(err => {
          console.error(err)
        })
    },
    playSong(link) {
      fetch(`${this.api}/get?url=${link}`)
        .then(res => res.json())
        .then(data => {
          this.player.list.add([data])
        })
        .catch(err => {
          console.error(err)
        })
    },
    saveUrl() {
      fetch(`${this.backend}/add?url=${link}`)
        .then(res => res.json())
        .then(data => {
          console.log(data)
        })
        .catch(err => {
          console.error(err)
        })
      this.playSong(this.ytLink)
    }
  }
}
</script>

<template>
  <div>
    <input type="text" v-model="ytLink" placeholder="URL">
    <button @click="saveUrl()">Add</button>
  </div>
  <div id="player">
  </div>
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
