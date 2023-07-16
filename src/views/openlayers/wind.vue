<template>
  <div>
    <div id="map"></div>
  </div>
</template>
  
<script>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { defaults as defaultControls } from "ol/control";
import { WindLayer } from "ol-wind";
export default {
  components: {},
  data() {
    return {
      map: null,
      tianditu_layers: null, // 3种类型的天地图
      windLayer: null,
    };
  },
  methods: {
    /**
     * @name: 初始化地图
     */
    initMap() {
      const view = new View({
        projection: "EPSG:4326",
        center: [125.9, 30.2],
        zoom: 5,
      });
      // 行政图
      var tianditu_vec = new TileLayer({
        source: new XYZ({
          url: "http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=c6ea8a2d7a9794e4075bb6105b997762",
        }),
        visible: true,
      });
      // 文字注记
      var tianditu_cva = new TileLayer({
        source: new XYZ({
          url: "http://t3.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=c6ea8a2d7a9794e4075bb6105b997762",
        }),
        visible: true,
      });
      this.map = new Map({
        //底图注掉即可
        layers: [tianditu_vec, tianditu_cva],
        target: "map",
        view: view,
        controls: defaultControls({
          zoom: false,
          rotate: false,
          attribution: false,
        }),
      });
    },
    addWindy() {
      fetch(
        "https://sakitam.oss-cn-beijing.aliyuncs.com/codepen/wind-layer/json/wind.json"
      )
        .then((res) => res.json())
        .then((res) => {
          const windLayer = new WindLayer(res, {
            windOptions: {
              // colorScale: scale,
              velocityScale: 1 / 50,
              paths: 5000,
              // eslint-disable-next-line no-unused-vars
              colorScale: [
                "rgb(36,104, 180)",
                "rgb(60,157, 194)",
                "rgb(128,205,193 )",
                "rgb(151,218,168 )",
                "rgb(198,231,181)",
                "rgb(238,247,217)",
                "rgb(255,238,159)",
                "rgb(252,217,125)",
                "rgb(255,182,100)",
                "rgb(252,150,75)",
                "rgb(250,112,52)",
                "rgb(245,64,32)",
                "rgb(237,45,28)",
                "rgb(220,24,32)",
                "rgb(180,0,35)",
              ],
              lineWidth: 2,
              // colorScale: scale,
              generateParticleOption: false,
            },
            fieldOptions: {
              wrapX: true,
              // flipY: true,
            },
            map: this.map,
          });
        });
    },
  },
  mounted() {
    let vm = this;
    setTimeout(function () {
      let that = vm;
      that.initMap();
      that.addWindy();
    }, 500);
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
.btn-typhon {
  position: absolute;
  right: 20px;
  bottom: 30px;
}
</style>
  