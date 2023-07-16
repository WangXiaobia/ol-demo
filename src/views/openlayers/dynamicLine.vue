<template>
  <div id="map">
    <div id="btn-anmite">
      <a-button id="btn-an" @click="startAnimation">动画开始</a-button>
      <a-button id="btn-an" @click="stopAnimation">暂停</a-button>
      <a-button id="btn-an" @click="stopAnimation">停止</a-button>
    </div>
  </div>
</template>
  
<script>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { defaults as defaultControls } from "ol/control";
import mapConfig from "../../config/mapConfig";
import dynamic from "../openlayers/js/dynamicLine";
import flowLayer from "../openlayers/js/flowLayer";
export default {
  components: {},
  data() {
    return {
      map: null,
      tianditu_layers: null, // 3种类型的天地图
    };
  },
  methods: {
    /**
     * @name: 初始化地图
     */
    initMap() {
      const view = new View({
        projection: "EPSG:4326",
        center: [119.63039359975909, 27.983344559311953],
        zoom: 18,
      });
      // 行政图
      var tianditu_vec = new TileLayer({
        source: new XYZ({
          url: mapConfig.tianditu_vecUrl,
        }),
        visible: true,
      });
      this.map = new Map({
        //底图注掉即可
        layers: [tianditu_vec],
        target: "map",
        view: view,
        controls: defaultControls({
          zoom: false,
          rotate: false,
          attribution: false,
        }),
      });
    },
    //获取管线数据
    getLine() {
      const pathData = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { _draw_type: "line" },
            geometry: {
              type: "LineString",
              coordinates: [
                [119.6306720437136, 27.984876696647234],
                [119.63044928855, 27.984876696647234],
                [119.63039359975909, 27.984344559311953],
                [119.6295458926087, 27.98266770794147],
                [119.62842139274132, 27.98170791980394],
              ],
            },
          },
        ],
      };
      const { layer, handler, pointLayer } = dynamic(this.map, pathData);
      this.pathLayer = layer;
      this.pathLayerHandler = handler;
      this.pointLayer = pointLayer;
    },
    getLine2() {
      const pathData = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { _draw_type: "line" },
            geometry: {
              type: "LineString",
              coordinates: [
                [119.6306720437136, 27.984876696647234],
                [119.63044928855, 27.984876696647234],
                [119.63039359975909, 27.984344559311953],
                [119.6295458926087, 27.98266770794147],
                [119.62842139274132, 27.98170791980394],
              ],
            },
          },
        ],
      };
      const { layer, handler, pointLayer } = flowLayer(this.map, pathData);
      this.pathLayer = layer;
      this.pathLayerHandler = handler;
      this.pointLayer = pointLayer;
    },
    // getLine3() {
    //   const { layer, handler, pointLayer } = dynamicRoute(this.map);
    //   this.pathLayer = layer;
    //   this.pathLayerHandler = handler;
    //   this.pointLayer = pointLayer;
    // },
    startAnimation() {
      this.animating = true;
    },
    stopAnimation() {
      this.animating = false;
    },
  },
  mounted() {
    let vm = this;
    setTimeout(function () {
      let that = vm;
      that.initMap();
      // that.getLine();
      that.getLine2();
      // that.getLine3();
    }, 500);
  },
  beforeDestroy() {
    this.pathLayerHandler &&
      this.pathLayer.un("postrender", this.pathLayerHandler);
  },
};
</script>
 <style scoped lang="less">
html,
body {
  height: 100%;
}
#map {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  #btn-anmite {
    position: absolute;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    #btn-an {
      margin-right: 15px;
    }
  }
}
</style>
  