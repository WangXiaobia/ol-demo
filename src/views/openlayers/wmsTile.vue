<template>
  <div class="map-box">
    <div id="map" ref="rootmap"></div>
  </div>
</template>
    <script>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
// import TileLayer from "ol/layer/WebGLTile.js";
// import WebGLTileLayer from "ol/layer/WebGLTile.js";
import XYZ from "ol/source/XYZ";
import TileWMS from "ol/source/TileWMS.js";
import GeoJSON from "ol/format/GeoJSON.js";
import VectorLayer from "ol/layer/Vector";
import {
  Circle as CircleStyle,
  Fill,
  Stroke,
  Style,
  Icon,
  Text,
} from "ol/style";
import { defaults as defaultControls } from "ol/control";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { Projection, addProjection } from "ol/proj";
import { Point } from "ol/geom";
import mapConfig from "@/config/mapConfig";
import VectorSource from "ol/source/Vector.js";
import json from "@/assets/json/features.json";
import WebGLPointsLayer from "ol/layer/WebGLPoints.js";
import WMTSSource from "ol/source/WMTS.js";
import WMTSTileGrid from "ol/tilegrid/WMTS.js";
export default {
  data() {
    return {
      map_layers: {},
      map: null,
      hb_point: null,
      hb_line: null,
      hb_cxpoint: null,
      hb_dxpoint: null,
      hb_expoint: null,
      hb_gdpoint: null,
      hb_jspoint: null,
      hb_jxpoint: null,
      hb_kmpoint: null,
      hb_kxpoint: null,
      hb_ldpoint: null,
      hb_lxpoint: null,
      hb_mxpoint: null,
      hb_ospoint: null,
      hb_rspoint: null,
      hb_tqpoint: null,
      hb_ttpoint: null,
      hb_tvpoint: null,
      hb_wspoint: null,
      hb_xhpoint: null,
      hb_yspoint: null,
      hb_zqpoint: null,
      hb_zspoint: null,
      hb_cxline: null,
      hb_dxline: null,
      hb_exline: null,
      hb_gdline: null,
      hb_jsline: null,
      hb_jxline: null,
      hb_kmline: null,
      hb_kxline: null,
      hb_ldline: null,
      hb_lxline: null,
      hb_mxline: null,
      hb_osline: null,
      hb_rsline: null,
      hb_tqline: null,
      hb_ttline: null,
      hb_tvline: null,
      hb_wsline: null,
      hb_xhline: null,
      hb_ysline: null,
      hb_zqline: null,
      hb_zsline: null,
      layerID: [],
      pointName: {},
      layerName: {},
    };
  },
  methods: {
    /**
     * @name: 初始化地图
     */
    initMap() {
      proj4.defs(
        'EPSG:4547',
        '+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs'
      )
      register(proj4);
      let projection = new Projection({
        code: 'EPSG:4547',
        units: "metre",
        extent: [344577.88, 2380651.49, 655422.12, 5036050.38],
        axisOrientation: "neu",
      });
      addProjection(projection);
      const view = new View({
        projection: 'EPSG:4547',
        center: [520946.01785, 3965160.41992],
        zoom: 7.8,
      });
      //影像图
      var tianditu_img = this.createWmts();
      //行政图
      var tianditu_vec = this.addXYZLayer(mapConfig.tianditu_vecUrl, false);
      // 文字注记
      var tianditu_cva = this.addXYZLayer(mapConfig.tianditu_cvaUrl, true);
      this.map_layers = {
        admin: tianditu_vec, // 行政图
        land: tianditu_img, // 影像图
      };
      this.map = new Map({
        //底图注掉即可
        layers: [tianditu_vec, tianditu_img, tianditu_cva],
        target: "map",
        view: view,
        controls: defaultControls({
          zoom: false,
          rotate: false,
          attribution: false,
        }),
      });
      this.$emit("getMap", this.map);
    },
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
    getGeoJSON(index) {
      let apiPoint = {
        1: hbPointCXGeoApi,
        3: hbPointDXGeoApi,
        5: hbPointEXGeoApi,
        7: hbPointGDGeoApi,
        9: hbPointJSGeoApi,
        11: hbPointJXGeoApi,
        13: hbPointKMGeoApi,
        15: hbPointKXGeoApi,
        17: hbPointLDGeoApi,
        19: hbPointLXGeoApi,
        21: hbPointMXGeoApi,
        23: hbPointOSGeoApi,
        25: hbPointRSGeoApi,
        27: hbPointTQGeoApi,
        29: hbPointTTGeoApi,
        31: hbPointTVGeoApi,
        33: hbPointWSGeoApi,
        35: hbPointXHGeoApi,
        37: hbPointYSGeoApi,
        39: hbPointZQGeoApi,
        41: hbPointZSGeoApi,
      };
      for (let key in apiPoint) {
        if (key == index) {
          apiPoint[key]().then((res) => {
            let features = new GeoJSON().readFeatures(res);
            this.hb_point[key].getSource().addFeatures(features);
            this.map.addLayer(this.hb_point[key]);
          });
        }
      }
    },
    createTile(name, is_visible) {
      return new TileLayer({
        source: new TileWMS({
          url: "http://150.158.34.72:8080/geoserver/HB4547/wms",
          params: {
            layers: name,
            tiled: true, //是否划分瓦片网格
          },
          serverType: "geoserver",
        }),
        visible: is_visible,
        zIndex: 50,
      });
    },
    createTile2(name, is_visible) {
      return new TileLayer({
        source: new TileWMS({
          url: mapConfig.wmsLineUrl,
          params: {
            layers: name,
            tiled: true, //是否划分瓦片网格
          },
          serverType: "geoserver",
        }),
        visible: is_visible,
      });
    },
    clickFeature(layer, name) {
      let _this = this;
      this.map.on("singleclick", async (e) => {
        let viewResolution = _this.map.getView().getResolution();
        let proj = _this.map.getView().getProjection();
        let url = layer
          .getSource()
          .getFeatureInfoUrl(e.coordinate, viewResolution, proj, {
            INFO_FORMAT: "application/json", //输出为json字符串
            QUERY_LAYERS: name,
            FEATURE_COUNT: 1,
          });
        if (url) {
          let data = await fetch(url).then(function (res) {
            return res.text(); //返回Promise
          });
          let result;
          try {
            result = JSON.parse(data);
          } catch (d) {}
          if (result && result.features.length > 0) {
            let detailData = result.features[0];
            console.log(detailData, "1231");
            //   this.$nextTick(() => {
            //     bus.$emit('selectClick', detailData) //
            //   })
          }
        }
      });
    },
    //监测点样式
    iconStyle(f) {
      let color;
      switch (f.values_.管点类型) {
        case "长途传输管线":
          color = "rgb(0,255,0)";
          break;
        case "矿煤管线":
          color = "rgb(102,0,204)";
          break;
        case "中国电信管线":
          color = "rgb(0,255,0)";
          break;
        case "电力通讯管线":
          color = "rgb(0,255,0)";
          break;
        case "给水管线":
          color = "rgb(0,255,255)";
          break;
        case "供电管线":
          color = "rgb(255,0,0)";
          break;
        case "军用光缆管线":
          color = "rgb(0,255,0)";
          break;
        case "蒸汽管线":
          color = "rgb(255,128,0)";
          break;
        case "雨水管线":
          color = "rgb(76,57,38)";
          break;
        case "中水管线":
          color = "rgb(0,255,255)";
          break;
        case "路灯管线":
          color = "rgb(255,0,0)";
          break;
        case "中国联通管线":
          color = "rgb(0,255,0)";
          break;
        case "原水管线":
          color = "rgb(0,255,255)";
          break;
        case "中国移动管线":
          color = "rgb(0,255,0)";
          break;
        case "天然气管线":
          color = "rgb(255,0,255)";
          break;
        case "热水管线":
          color = "rgb(255,128,0)";
          break;
        case "有线电视管线":
          color = "rgb(0,255,0)";
          break;
        case "铁通管线":
          color = "rgb(0,255,0)";
          break;
        case "交通信号管线":
          color = "rgb(255,0,0)";
          break;
        case "污水管线":
          color = "rgb(76,57,38)";
          break;
      }
      return new Style({
        image: new CircleStyle({
          radius: 4,
          fill: new Fill({
            color: color,
          }),
        }),
      });
    },
    //创建图层
    createLayer(type, is_visible) {
      let _this = this;
      if (type == "point") {
        return new VectorLayer({
          source: new VectorSource(),
          visible: is_visible,
          style: function (f) {
            return _this.iconStyle(f);
          },
          minZoom: 13,
        });
      } else {
        return new VectorLayer({
          source: new VectorSource({}),
          style: function (f) {
            return _this.pipeStyle(f);
          },
          visible: is_visible,
        });
      }
    },
    // 开启 bus 监听
    initBus() {
      bus.$on("getMap", () => {
        this.$nextTick(() => {
          this.map && bus.$emit("initMap", this.map);
        });
      });
      bus.$on("layerArray", (value) => {
        this.$nextTick(() => {
          this.layerID = value;
        });
      });
    },
    mapAddLayer(list) {
      //   this.createWebGl();
      for (let i = 0; i < list.length; i++) {
        let key = list[i];
        if (Number(key) % 2 != 0) {
          // this.hb_point[key] = this.createLayer('point', true)
          // this.getGeoJSON(key)
          this.hb_point[key] = this.createTile(this.pointName[key], true);
          this.map.addLayer(this.hb_point[key]);
          this.clickFeature(this.hb_point[key], this.pointName[key]);
        } else {
          this.hb_line[key] = this.createTile2(this.layerName[key], true);
          this.map.addLayer(this.hb_line[key]);
          this.clickFeature(this.hb_line[key], this.layerName[key]);
        }
      }
    },
    controlLayer(list) {
      // console.log(list, '图层列表')
      for (let i = 0; i < this.layerID.length; i++) {
        if (Number(this.layerID[i]) % 2 != 0) {
          if (this.hb_point[this.layerID[i]]) {
            this.hb_point[this.layerID[i]].setVisible(false);
          }
        } else {
          if (this.hb_line[this.layerID[i]]) {
            this.hb_line[this.layerID[i]].setVisible(false);
          }
        }
      }
      if (list) {
        for (let j = 0; j < list.length; j++) {
          if (Number(list[j]) % 2 != 0) {
            this.hb_point[list[j]].setVisible(true);
          } else {
            this.hb_line[list[j]].setVisible(true);
          }
        }
      }
    },
    createWebGl() {
      this.vectorSource = new VectorSource({
        // url: 'https://openlayers.org/en/latest/examples/data/geojson/world-cities.geojson',
        // url: 'http://150.158.34.72:8080/geoserver/HB4547/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=HB4547%3ALXPOINT&maxFeatures=16000&outputFormat=application%2Fjson',
        projection: "EPSG:4547",
        // url: json,
        // format: new GeoJSON(),
        features: new GeoJSON().readFeatures(json),
        // warpX: true,
      });
      const layer = new WebGLPointsLayer({
        source: this.vectorSource,
        style: {
          symbol: {
            // symbolType: 'circle',
            // size: 8,
            // color: 'rgb(255, 0, 0)',
            // opacity: 0.5,
            symbolType: "image",
            color: ["match", ["get", "hover"], 1, "#ff3f3f", "#006688"], //设置属性hover值为1时的颜色为：#ff3f3f,默认颜色为：#006688
            src: require("@/assets/olImg/province_1.png"),
            size: [18, 18],
            color: "lightyellow",
            rotateWithView: false, //是否随视图旋转
            offset: [0, 9],
          },
        },
      });
      this.map.addLayer(layer);
    },
    createWmts() {
      const mGridset4548 = {
        gridNames: [
          'EPSG:4326:0',
          'EPSG:4326:1',
          'EPSG:4326:2',
          'EPSG:4326:3',
          'EPSG:4326:4',
          'EPSG:4326:5',
          'EPSG:4326:6',
          'EPSG:4326:7',
          'EPSG:4326:8',
          'EPSG:4326:9',
          'EPSG:4326:10',
          'EPSG:4326:11',
          'EPSG:4326:12',
          'EPSG:4326:13',
          'EPSG:4326:14',
          'EPSG:4326:15',
          'EPSG:4326:16',
          'EPSG:4326:17',
        ],
        resolutions: [
          73.40032, 36.70016, 18.35008, 9.17504, 4.58752, 2.29376, 1.14688, 0.57344, 0.28672, 0.14336, 0.07168, 0.03584,
          0.01792, 0.00896, 0.00448, 0.00224, 0.00112, 5.6e-4,
        ],
        projection: new Projection({
          code: 'EPSG:4547',
          units: 'm',
          axisOrientation: 'neu',
        }),
      }
      return new TileLayer({
        source: new WMTSSource({
          url: 'http://81.69.13.65:8080/geoserver/gwc/service/wmts',
          layer: 'HB:HBYX',
          matrixSet: 'HB4547',
          format: 'image/png',
          projection: mGridset4548.projection,
          tileGrid: new WMTSTileGrid({
            tileSize: [200,200],
            extent: [344577.87880979344,2380651.492038416,667539.2868097934,5037743.0760384165],
            origin: [344577.87880979344, 5037743.0760384165],
            resolutions: mGridset4548.resolutions,
            matrixIds: mGridset4548.gridNames,
          }),
          style: '',
          wrapX: true,
        }),
        visible: true,
      })
    },
  },
  created() {
    //   this.initBus()
  },
  beforeDestroy() {
    //   bus.$off('getMap')
  },
  mounted() {
    let vm = this;
    setTimeout(function () {
      let _this = vm;
      _this.initMap();
      // _this.$nextTick(() => {
      //   _this.map && bus.$emit('initMap', _this.map)
      // })
      _this.hb_point = {
        1: _this.hb_cxpoint,
        3: _this.hb_dxpoint,
        5: _this.hb_expoint,
        7: _this.hb_gdpoint,
        9: _this.hb_jspoint,
        11: _this.hb_jxpoint,
        13: _this.hb_kmpoint,
        15: _this.hb_kxpoint,
        17: _this.hb_ldpoint,
        19: _this.hb_lxpoint,
        21: _this.hb_mxpoint,
        23: _this.hb_ospoint,
        25: _this.hb_rspoint,
        27: _this.hb_tqpoint,
        29: _this.hb_ttpoint,
        31: _this.hb_tvpoint,
        33: _this.hb_wspoint,
        35: _this.hb_xhpoint,
        37: _this.hb_yspoint,
        39: _this.hb_zqpoint,
        41: _this.hb_zspoint,
      };
      _this.hb_line = {
        2: _this.hb_cxline,
        4: _this.hb_dxline,
        6: _this.hb_exline,
        8: _this.hb_gdline,
        10: _this.hb_jsline,
        12: _this.hb_jxline,
        14: _this.hb_kmline,
        16: _this.hb_kxline,
        18: _this.hb_ldline,
        20: _this.hb_lxline,
        22: _this.hb_mxline,
        24: _this.hb_osline,
        26: _this.hb_rsline,
        28: _this.hb_tqline,
        30: _this.hb_ttline,
        32: _this.hb_tvline,
        34: _this.hb_wsline,
        36: _this.hb_xhline,
        38: _this.hb_ysline,
        40: _this.hb_zqline,
        42: _this.hb_zsline,
      };
      _this.layerName = {
        2: "HB4547:CXLINE",
        4: "HB4547:DXLINE",
        6: "HB4547:EXLINE",
        8: "HB4547:GDLINE",
        10: "HB4547:JSLINE",
        12: "HB4547:JXLINE",
        14: "HB4547:KMLINE",
        16: "HB4547:KXLINE",
        18: "HB4547:LDLINE",
        20: "HB4547:LXLINE",
        22: "HB4547:MXLINE",
        24: "HB4547:OSLINE",
        26: "HB4547:RSLINE",
        28: "HB4547:TQLINE",
        30: "HB4547:TTLINE",
        32: "HB4547:TVLINE",
        34: "HB4547:WSLINE",
        36: "HB4547:XHLINE",
        38: "HB4547:YSLINE",
        40: "HB4547:ZQLINE",
        42: "HB4547:ZSLINE",
      };
      _this.pointName = {
        1: "HB4547:CXPOINT",
        3: "HB4547:DXPOINT",
        5: "HB4547:EXPOINT",
        7: "HB4547:GDPOINT",
        9: "HB4547:JSPOINT",
        11: "HB4547:JXPOINT",
        13: "HB4547:KMPOINT",
        15: "HB4547:KXPOINT",
        17: "HB4547:LDPOINT",
        19: "HB4547:LXPOINT",
        21: "HB4547:MXPOINT",
        23: "HB4547:OSPOINT",
        25: "HB4547:RSPOINT",
        27: "HB4547:TQPOINT",
        29: "HB4547:TTPOINT",
        31: "HB4547:TVPOINT",
        33: "HB4547:WSPOINT",
        35: "HB4547:XHPOINT",
        37: "HB4547:YSPOINT",
        39: "HB4547:ZQPOINT",
        41: "HB4547:ZSPOINT",
      };
      _this.layerID = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
        40, 41, 42,
      ];
      _this.mapAddLayer(_this.layerID);
      // bus.$on('layerArrayChange', (value) => {
      //   _this.$nextTick(() => {
      //     _this.controlLayer(value)
      //   })
      // })
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