<template>
  <div>
    <div id="map"></div>
    <a-button type="primary" @click="refesh()" class="btn-typhon"
      >开始</a-button
    >
  </div>
</template>
<script>
export default {
  name: "typhoon2",
  data() {
    return {
    };
  },
  methods: {
    refesh() {
      window.location.reload(); // 第一种方式
    },
    init() {
      let nav = document.createElement("script"); //创建script标签
      nav.type = "text/javascript";
      nav.src = require("./data/typhoon-data"); //静态资源
      let nav2 = document.createElement("script"); //创建script标签
      nav2.type = "text/javascript";
      nav2.src = require("./js/typhoon"); //静态资源
    },
  },
  mounted() {
    this.init();
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
<style type="text/css">
.anchorBL {
  display: none;
}
.BMap_cpyCtrl BMap_noprint anchorBL {
  display: none !important;
}
.btn-typhon {
  position: absolute;
  right: 20px;
  bottom: 30px;
}
</style>
  