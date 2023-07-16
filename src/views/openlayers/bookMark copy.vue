<template>
  <div>
    <div class="overview"></div>
    <div id="map"></div>
  </div>

</template>
  
<script>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import { defaults as defaultControls } from "ol/control";
import { Fill, Stroke, Style, Icon } from "ol/style";
import {
  mdWslineGeoApi,
  mdYslineGeoApi,
  mdWsPointGeoApi,
  mdYsPointtGeoApi,
} from "../../utils/api/openlayers.js";
import GeoJSON from "ol/format/GeoJSON.js";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import "ol-ext/dist/ol-ext.min.css";
import OSM from "ol/source/OSM.js";
import Stamen from "ol/source/Stamen.js";
import Magnify from "ol-ext/overlay/Magnify";
export default {
  components: {},
  data() {
    return {
      map: null,
      tianditu_layers: null, // 3种类型的天地图
      converLayer: null,
      md_wsline: null,
      md_ysline: null,
      md_wspoint1: null,
      md_wspoint2: null,
      md_wspoint3: null,
      md_yspoint1: null,
      md_yspoint2: null,
      md_yspoint3: null,
    };
  },
  methods: {
    /**
     * @name: 初始化地图
     */
    initMap() {
      const view = new View({
        projection: "EPSG:4326",
        center: [103.736, 30.0765],
        zoom: 11.4,
      });
      var layersOV2 = [
        new TileLayer({ source: new OSM() }),
        new TileLayer({
          source: new Stamen({
            layer: "watercolor",
          }),
          // Use preload to have tile when moving
          preload: 2,
        }),
      ];
      this.map = new Map({
        //底图注掉即可
        layers: [
          new TileLayer({ source: new Stamen({ layer: "watercolor" }) }),
        ],
        target: "map",
        view: view,
        controls: defaultControls({
          zoom: false,
          rotate: false,
          attribution: false,
        }),
      });
      layersOV2[1].setVisible(true);
      layersOV2[0].setVisible(false);
      var ov2 = new Magnify({
        layers: layersOV2,
        target: $(".overview").get(0),
        zoomOffset: 2,
      });
      this.map.addOverlay(ov2);
    },
    //管线样式
    pipeStyle(f, width) {
      let colorPipe = "";
      switch (f.values_.pip_nature) {
        case "雨水":
          colorPipe = "rgba(77, 116, 255, 1)";
          break;
        case "污水":
          colorPipe = "#ff0000";
          break;
      }
      return new Style({
        fill: new Fill({
          color: colorPipe,
        }),
        stroke: new Stroke({
          color: colorPipe,
          width: width,
        }),
      });
    },
    //监测点样式
    iconStyle(f, scale) {
      let icon;
      switch (f.values_.pip_nature) {
        case "雨水":
          icon = "province_2";
          break;
        case "污水":
          icon = "province_6";
          break;
      }
      let icon_path = icon + ".png";
      return new Style({
        image: new Icon({
          scale: scale,
          src: require("../../assets/olImg/" + icon_path),
          anchor: [0.5, 0.5],
        }),
      });
    },
    //创建图层
    createLayer(type, is_visible, scale) {
      let _this = this;
      if (type == "point") {
        return new VectorLayer({
          source: new VectorSource(),
          visible: is_visible,
          style: function (f) {
            return _this.iconStyle(f, scale);
          },
        });
      } else {
        return new VectorLayer({
          source: new VectorSource({}),
          style: function (f) {
            return _this.pipeStyle(f, 1);
          },
          visible: is_visible,
        });
      }
    },
    //获取管线数据
    getLine() {
      mdWslineGeoApi()
        .then((res) => {
          let features = new GeoJSON().readFeatures(res);
          this.md_wsline.getSource().addFeatures(features);
          this.map.addLayer(this.md_wsline);
        })
        .catch((error) => {
          console.log(error);
        });
      mdYslineGeoApi()
        .then((res) => {
          let features = new GeoJSON().readFeatures(res);
          this.md_ysline.getSource().addFeatures(features);
          this.map.addLayer(this.md_ysline);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    //获取污水点数据
    getWsPoint() {
      mdWsPointGeoApi()
        .then((res) => {
          let features = new GeoJSON().readFeatures(res);
          this.md_wspoint1.getSource().addFeatures(features);
          this.md_wspoint2.getSource().addFeatures(features);
          this.md_wspoint3.getSource().addFeatures(features);
          this.map.addLayer(this.md_wspoint1);
          this.map.addLayer(this.md_wspoint2);
          this.map.addLayer(this.md_wspoint3);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    //获取雨水点数据
    getRainPoint() {
      mdYsPointtGeoApi()
        .then((res) => {
          let features = new GeoJSON().readFeatures(res);
          this.md_yspoint1.getSource().addFeatures(features);
          this.md_yspoint2.getSource().addFeatures(features);
          this.md_yspoint3.getSource().addFeatures(features);
          this.map.addLayer(this.md_yspoint1);
          this.map.addLayer(this.md_yspoint2);
          this.map.addLayer(this.md_yspoint3);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    //根据分辨率控制图层
    zoomControl() {
      //缩放监听事件
      let zoom = this.map.getView().getZoom(); //获取当前地图的缩放级别
      if (zoom > 19) {
        this.md_wspoint1.setVisible(false);
        this.md_wspoint2.setVisible(false);
        this.md_wspoint3.setVisible(true);
        this.md_yspoint1.setVisible(false);
        this.md_yspoint2.setVisible(false);
        this.md_yspoint3.setVisible(true);
      } else if (zoom > 16 && zoom < 19) {
        this.md_wspoint1.setVisible(false);
        this.md_wspoint2.setVisible(true);
        this.md_wspoint3.setVisible(false);
        this.md_yspoint1.setVisible(false);
        this.md_yspoint2.setVisible(true);
        this.md_yspoint3.setVisible(false);
      } else {
        this.md_wspoint1.setVisible(true);
        this.md_wspoint2.setVisible(false);
        this.md_wspoint3.setVisible(false);
        this.md_yspoint1.setVisible(true);
        this.md_yspoint2.setVisible(false);
        this.md_yspoint3.setVisible(false);
      }
    },
  },
  mounted() {
    let vm = this;
    setTimeout(function () {
      let that = vm;
      that.initMap();
      that.md_wsline = that.createLayer("line", true);
      that.md_ysline = that.createLayer("line", true);
      that.md_wspoint1 = that.createLayer("point", true, 0.1);
      that.md_wspoint2 = that.createLayer("point", false, 0.25);
      that.md_wspoint3 = that.createLayer("point", false, 0.5);
      that.md_yspoint1 = that.createLayer("point", true, 0.06);
      that.md_yspoint2 = that.createLayer("point", false, 0.25);
      that.md_yspoint3 = that.createLayer("point", false, 0.5);
      that.getLine();
      that.getWsPoint();
      that.getRainPoint();
      let _this = that;
      that.map.getView().on("change:resolution", () => {
        _this.zoomControl();
      });
    }, 500);
  },
};
</script>
 <style scoped lang="less">
 @import "./style.css";
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
.overview{
  width:150px; 
  height:150px;
  position:absolute;
  top:100px;
  right:100px;
  z-index: 100;
}
</style>
  