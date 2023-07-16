<!-- 展示地理围栏 -->
<template>
  <div id="container">
    <ol-enclosure :pageName="pageName"/>
  </div>
</template>
<script>
import OlEnclosure from "../../components/openlayers/olEnclosure.vue";
export default {
  components: {
    OlEnclosure,
  },
  data(){
    return{
      pageName:'encloseure'
    }
  },
  methods: {},
};
</script>
<style scoped lang="less">
html,
body {
  height: 100%;
}
#container {
  height: 100%;
  position: relative;
  overflow: hidden;
}
</style>
      