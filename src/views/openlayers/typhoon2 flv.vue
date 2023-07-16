<template>
  <video id="videoElement"></video>
</template>
<script>
import flvjs from "flv.js";
export default {
  components: {},
  data() {
    return {};
  },
  methods: {},
  mounted() {
    if (flvjs.isSupported()) {
      var videoElement = document.getElementById("videoElement");
      this.flvPlayer = flvjs.createPlayer({
        type: "flv",
        isLive: true,
        hasAudio: false,
        url: "http://123.6.82.126:6604/3/5?DownType=5&jsession=&DevIDNO=915789&FILELOC=1&FILESVR=0&FILECHN=0&FILEBEG=34705&FILEEND=36836&PLAYIFRM=0&PLAYFILE=CH01-221226-093825-0213107&PLAYBEG=0&PLAYEND=0&PLAYCHN=0&YEAR=22&MON=12&DAY=26",
      });
      this.flvPlayer.attachMediaElement(videoElement);
      this.flvPlayer.load();
      this.flvPlayer.play();
    }
  },
};
</script>                         
 <style scoped lang="less">
html,
body {
  height: 100%;
}
#map {
  height: 849px;
  width: 100%;
  position: relative;
  overflow: hidden;
}
</style>
  