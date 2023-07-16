<template>
  <div id="map"></div>
</template>
  
<script>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { defaults as defaultControls } from "ol/control";
import LinearRing from "ol/geom/LinearRing";
import { Feature } from "ol";
import { fromExtent } from "ol/geom/Polygon";
import { Fill, Stroke, Style, Icon } from "ol/style";
import {
  mdWslineGeoApi,
  mdYslineGeoApi,
  mdWsPointGeoApi,
  mdYsPointtGeoApi,
  getMdData,
} from "../../utils/api/openlayers.js";
import GeoJSON from "ol/format/GeoJSON.js";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
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
      // 行政图
      var tianditu_vec = new TileLayer({
        source: new XYZ({
          url: "http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=c6ea8a2d7a9794e4075bb6105b997762",
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
    creatCover() {
      // 遮盖层
      this.converLayer = new VectorLayer({
        source: new VectorSource(),
        style: new Style({
          fill: new Fill({
            color: "rgba(3,31,88,0.5)",
          }),
          stroke: new Stroke({
            color: "#2228fc",
            width: 2.5,
          }),
        }),
      });
      this.map.addLayer(this.converLayer); // 加入遮盖层
    },
    // 地图遮盖层擦除方法
    erase(geom) {
      var extent = [-180, -90, 180, 90];
      var polygonRing = fromExtent(extent);
      var coords = geom.coordinates;
      coords.forEach((coord) => {
        var linearRing = new LinearRing(coord[0]);
        polygonRing.appendLinearRing(linearRing);
      });
      return polygonRing;
    },
    // 获取地图边界数据 使用擦除方法添加遮盖层
    getBorder() {
      getMdData().then((res) => {
        var converGeom = this.erase(res.data.features[0].geometry);
        var convertFt = new Feature({
          geometry: converGeom,
        });
        this.converLayer.getSource().addFeature(convertFt);
      });
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
      that.creatCover();
      that.getBorder();
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
html,
body {
  height: 100%;
}
#map {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
}
</style>
  