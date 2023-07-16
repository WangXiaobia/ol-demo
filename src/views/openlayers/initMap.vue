<template>
  <div id="container">
    <ol-map :legendList="legendList"/>
    <legend-map
      @legendLayerVisible="legendLayerVisible"
      :legendList="legendList"
    ></legend-map>
  </div>
</template>
<script>
import olMap from "../../components/openlayers/olMap.vue";
import legendMap from "../../components/openlayers/legend.vue";
export default {
  components: {
    olMap,
    legendMap,
  },
  data() {
    return {
      legendList: {
        layerList: [
          {
            src: require("@/assets/olImg/pollutionLine.png"),
            name: "污水管线",
            checked: true,
          },
          {
            src: require("@/assets/olImg/rainLine.png"),
            name: "雨水管线",
            checked: true,
          },
          {
            src: require("@/assets/olImg/province_6.png"),
            name: "窨井",
            checked: true,
          },
          {
            src: require("@/assets/olImg/province_2.png"),
            name: "雨水篦",
            checked: true,
          },
        ],
      }, // 从图例里传过来的列表
    };
  },
  methods: {
    //地图图例切换以及开关
    legendLayerVisible(val) {
      this.legendList = val;
    },
  },
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
  