<template>
  <div class="map-box">
    <div id="map" ref="rootmap"></div>
    <change-base-map @changeBaseValue="getChangeBaseValue" />
  </div>
</template>
<script>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import TileGrid from "ol/tilegrid/TileGrid";
import ChangeBaseMap from "./ChangeBaseMap.vue";
import TileImage from "ol/source/TileImage";
import { get} from "ol/proj";
import { TileArcGISRest } from "ol/source";
export default {
  components: { ChangeBaseMap },
  data() {
    return {
      map_layers: {},
      map: null,
    };
  },
  methods: {
    /**
     * @name: 初始化地图
     */
    initMap() {
      const view = new View({
        projection: "EPSG:4326",
        center: [119.812792, 28.903138],
        zoom: 13,
      });
      //天地图
      // 卫星图
      var tianditu_img = this.addXYZLayer(
        "http://t3.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=c6ea8a2d7a9794e4075bb6105b997762",
        false
      );
      // 行政图
      var tianditu_vec = this.addXYZLayer(
        "http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=c6ea8a2d7a9794e4075bb6105b997762",
        true
      );
      // 地形图
      var tianditu_ter = this.addXYZLayer(
        "http://t4.tianditu.com/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=c6ea8a2d7a9794e4075bb6105b997762",
        false
      );
      // 文字注记
      var tianditu_cva = this.addXYZLayer(
        "http://t3.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=c6ea8a2d7a9794e4075bb6105b997762",
        false
      );

      // arcgis卫星影像地图服务
      var arcgisImageMap = this.addXYZLayer(
        "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        false
      );

      // arcgis矢量底图+注记地图服务
      var arcgisVecMap = this.addXYZLayer(
        "https://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        false
      );

      // 高德卫星影像地图服务
      var gdImageMap = this.addXYZLayer(
        "https://webst03.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
        false
      );
      // 高德矢量底图地图服务
      let gdVecMap = this.addXYZLayer(
        "https://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
        false
      );
      var projection = get("EPSG:3857");
      //分辨率
      var resolutions = [];
      for (var i = 0; i < 19; i++) {
        resolutions[i] = Math.pow(2, 18 - i);
      }
      var tilegrid = new TileGrid({
        origin: [0, 0],
        resolutions: resolutions,
      });
      //拼接百度地图出图地址
      var baidu_source = new TileImage({
        //设置坐标参考系
        projection: projection,
        //设置分辨率
        tileGrid: tilegrid,
        //出图基地址
        tileUrlFunction: function (tileCoord, pixelRatio, proj) {
          if (!tileCoord) {
            return "";
          }
          let z = tileCoord[0];
          let x = tileCoord[1];
          let y = -tileCoord[2] - 1;
          return (
            "http://online1.map.bdimg.com/onlinelabel/?qt=tile&x=" +
            x +
            "&y=" +
            y +
            "&z=" +
            z +
            "&styles=pl&scaler=1&udt=20191119"
          );
        },
        crossOrigin: "anonymous",
      });
      //百度地图
      var baidu_layer = new TileLayer({
        source: baidu_source,
        visible: false,
      });
      this.map_layers = {
        moon: tianditu_img, // 卫星图
        land: tianditu_ter, // 地形图
        admin: tianditu_vec, // 行政图
        baidu: baidu_layer, //百度地图
        gaode: gdVecMap, //高德地图
        arcgis: arcgisVecMap, //arcgis矢量底图
      };
      this.map = new Map({
        //底图注掉即可
        layers: [
          tianditu_img,
          tianditu_vec,
          tianditu_ter,
          tianditu_cva,
          baidu_layer,
          gdVecMap,
          arcgisVecMap,
        ],
        target: "map",
        view: view,
      });
      
    },
    // 增加XYZ格式的地图服务图层
    addXYZLayer(url, visible) {
      let source = new XYZ({
        url: url,
        wrapX: true,
        crossOrigin: "anonymous",
      });
      let layer = new TileLayer({
        source: source,
        visible: visible,
      });
      return layer;
    },
    getChangeBaseValue(value) {
      for (var key in this.map_layers) {
        if (key == value) {
          this.map_layers[key].setVisible(true);
        } else {
          this.map_layers[key].setVisible(false);
        }
      }
    },
    getEsriData(){
      //arcgisServer发布数据
      var tileArcGISXYZ = new TileArcGISRest({
        url: "http://81.69.13.65:6080/arcgis/rest/services/WY/WYPS/MapServer",
      });
      var arcgisTile = new TileLayer({
        source: tileArcGISXYZ,
        visible: true,
      });
      this.map.addLayer(arcgisTile)
    }
  },
  mounted() {
    let vm = this;
    setTimeout(function () {
      let _this = vm;
      _this.initMap();
      _this.getEsriData();
      _this.map.getView().on("change:resolution", () => {
        let zoom = _this.map.getView().getZoom(); //获取当前地图的缩放级别
        console.log(zoom,'123')
      });
    }, 500);
  },
};
</script>

<style lang="less" scoped>
.map-box {
  width: 100%;
  height: 100%;
  position: relative;
  #map {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    canvas {
      position: absolute;
      right: 0;
      left: 0;
      bottom: 0;
      top: 0;
      // width: 100%;
      // height: 100%;
    }
  }
}
</style>