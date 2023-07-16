<template>
  <div>
    <div id="map"></div>
    <a-button type="primary" @click="getTyphData" class="btn-typhon"
      >开始</a-button
    >
  </div>
</template>
  
<script>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { defaults as defaultControls } from "ol/control";
import { typhoonGeoApi } from "../../utils/api/openlayers.js";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import Overlay from "ol/Overlay";
import { Style, Fill, Circle, Stroke } from "ol/style";
import { Point, LineString } from "ol/geom";
import * as format from "ol/format";
export default {
  components: {},
  data() {
    return {
      map: null,
      tianditu_layers: null, // 3种类型的天地图
      drawLayer: null,
      tfStyle: [],
      tfLinStyle: [],
      config: {
        x: 122.91345321106421, //台风圈中心点经度
        y: 30.324543879896564, //台风圈中心点维度
        r: {
          SE: 0.5,
          NE: 0.3,
          NW: 0.2,
          SW: 0.5,
        },
        interval: 6, // 6° 一个间隔；间隔越小，台风圈越平滑
      },
      vectorImg: null,
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
      let tfsource = new VectorSource({});
      this.tflayer = new VectorLayer({
        source: tfsource,
      });
      this.map.addLayer(this.tflayer);

      this.addEventMapClick();
      this.vectorImg = new VectorLayer({
        source: new VectorSource({}),
        style: this.styleFunc,
      });
      this.map.addLayer(this.vectorImg);
    },
    getTyphData() {
      typhoonGeoApi().then((res) => {
        let data = res.features;
        this.drawLine(data);
        for (let i = 0; i < data.length; i++) {
          let obj = {
            x: data[i].geometry.coordinates[0], //台风圈中心点经度
            y: data[i].geometry.coordinates[1], //台风圈中心点维度
            r: {
              SE: 1.25,
              NE: 0.75,
              NW: 0.5,
              SW: 1.25,
            },
            interval: 18, // 6° 一个间隔；间隔越小，台风圈越平滑
          };
          console.log(obj,'112131')
          this.init(obj);
        }
      });
    },
    drawLine(data) {
      this.tflayer.getSource().clear();
      this.map.removeLayer(this.tflayer);
      let _this = this;
      for (let index = 0; index < data.length; index++) {
        setInterval(function () {
          let point = data[index];
          let vm = _this;
          let pointColor = vm.setPointFillColor(point.properties.storm_spd);
          // 添加点
          const feature = new Feature({
            geometry: new Point([point.properties.lon, point.properties.lat]),
            properties: point,
          });
          // this.tfStyle为我提前定义到的各种类型的点样式
          feature.setStyle(vm.tfStyle[pointColor.index]);
          vm.tflayer.getSource().addFeature(feature);
          // 添加线
          let lineDash; //线段样式 实线或者虚线
          if (index == 0) {
            lineDash = [0];
          } else {
            lineDash = [10];
          }
          if (index > 0) {
            let startPoint = [point.properties.lon, point.properties.lat]; //开始点
            let endPonit = [
              data[index - 1].properties.lon,
              data[index - 1].properties.lat,
            ]; //结束点
            let coords = [startPoint, endPonit];
            let lineStyle =
              lineDash[0] === 0
                ? vm.tfLinStyle[pointColor.index]
                : vm.tfLinStyle[6];
            let feature2 = new Feature({
              geometry: new LineString(coords),
              properties: point,
            });
            feature2.setStyle(lineStyle);
            vm.tflayer.getSource().addFeature(feature2);
          }
        }, 50);
      }
      _this.map.addLayer(_this.tflayer);
    },
    drawTyphoon() {},
    addEventMapClick() {
      const nameDom = document.createElement("div");
      nameDom.setAttribute("class", "typhoon-popup");
      nameDom.style.background = "#fff";
      nameDom.style.padding = "10px";
      const nameOverlay = new Overlay({
        element: nameDom,
        position: [0, 0],
        positioning: "bottom-right",
        stopEvent: false,
        insertFirst: false,
        autoPanAnimation: {
          duration: 250,
        },
      });
      this.map.addOverlay(nameOverlay);
      this._popup = nameOverlay;
      // 监听地图点击事件
      this.map.on("singleclick", (e) => {
        this._popup.getElement().parentElement.style.display = "none";
        this.map.forEachFeatureAtPixel(e.pixel, (result) => {
          if (result) {
            let Properties = result.values_.properties.properties;
            let html = `<div class="typhoonLyer"><div class="con">名称: 
              烟花</div>
              <div class="con">时间: ${Properties.iso_time || "--"}</div>
              <div class="con">中心位置: ${Properties.usa_lon}, ${
              Properties.usa_lat
            }</div></div>`;
            this._popup.getElement().innerHTML = html;
            this._popup.setPosition([Properties.usa_lon, Properties.usa_lat]);
            this._popup.getElement().parentElement.style.display = "block";
          }
        });
      });
    },
    setPointFillColor(type) {
      let pointFillColor = "#eed139";
      let index = 0;
      switch (type) {
        case 1:
        case 2:
          pointFillColor = "#eed139";
          index = 0;
          break;
        case 3:
        case 4:
        case 5:
        case 6:
          pointFillColor = "#0000ff";
          index = 1;
          break;
        case 7:
        case 8:
        case 9:
          pointFillColor = "#0f8000";
          index = 2;
          break;
        case 10:
          pointFillColor = "#fe9c45";
          index = 3;
          break;
        case 11:
        case 12:
        case 13:
          pointFillColor = "#fe00fe";
          index = 4;
          break;
        case 14:
        case 15:
        case 16:
          pointFillColor = "#fe0000";
          index = 5;
          break;
      }
      return { pointFillColor, index };
    },
    init(param) {
      this.vectorImg.getSource().clear();
        var wktformat = new format.WKT();
        var features = [];
        var wkt = `POLYGON((`;
        var wkt0 = "";
        for (var i = 0; i < 360 / param.interval; i++) {
          var r = 0;
          var ang = i * param.interval;
          //第一象限
          if (ang > 0 && ang <= 90) {
            r = param.r.NE;
          }
          //第二象限
          else if (ang > 90 && ang <= 180) {
            r = param.r.NW;
          }
          // 第三象限
          else if (ang > 180 && ang <= 270) {
            r = param.r.SW;
          }
          // 第四象限
          else {
            r = param.r.SE;
          }
          var x = param.x + r * Math.cos((ang * Math.PI) / 180);
          var y = param.y + r * Math.sin((ang * Math.PI) / 180);
          wkt = wkt + `${x} ${y},`;
          if (i === 0) {
            wkt0 = `${x} ${y}`;
          }
        }
        wkt = wkt + wkt0 + "))";
        features.push(wktformat.readFeature(wkt));
        features.push(
          wktformat.readFeature("POINT(" + param.x + " " + param.y + ")")
        );
        this.vectorImg.getSource().addFeatures(features);
    },
    styleFunc() {
      return new Style({
        fill: new Fill({
          color: "rgba(255, 0, 0, 0.2)",
        }),
        stroke: new Stroke({
          color: "#ffcc33",
          width: 2,
        }),
        image: new Circle({
          radius: 2,
          fill: new Fill({
            color: "#ff0000",
          }),
        }),
      });
    },
  },
  mounted() {
    let vm = this;
    setTimeout(function () {
      let that = vm;
      that.initMap();
      that.tfStyle = [
        new Style({
          image: new Circle({
            radius: 3,
            fill: new Fill({
              color: "#eed139",
            }),
            stroke: new Stroke({
              color: "rgba(0, 0, 0, 0.6)",
              width: 1,
            }),
          }),
        }),
        new Style({
          image: new Circle({
            radius: 3,
            fill: new Fill({
              color: "#0000ff",
            }),
            stroke: new Stroke({
              color: "rgba(0, 0, 0, 0.6)",
              width: 1,
            }),
          }),
        }),
        new Style({
          image: new Circle({
            radius: 3,
            fill: new Fill({
              color: "#0f8000",
            }),
            stroke: new Stroke({
              color: "rgba(0, 0, 0, 0.6)",
              width: 1,
            }),
          }),
        }),
        new Style({
          image: new Circle({
            radius: 3,
            fill: new Fill({
              color: "#fe9c45",
            }),
            stroke: new Stroke({
              color: "rgba(0, 0, 0, 0.6)",
              width: 1,
            }),
          }),
        }),
        new Style({
          image: new Circle({
            radius: 3,
            fill: new Fill({
              color: "#fe00fe",
            }),
            stroke: new Stroke({
              color: "rgba(0, 0, 0, 0.6)",
              width: 1,
            }),
          }),
        }),
        new Style({
          image: new Circle({
            radius: 3,
            fill: new Fill({
              color: "#fe0000",
            }),
            stroke: new Stroke({
              color: "rgba(0, 0, 0, 0.6)",
              width: 1,
            }),
          }),
        }),
      ];
      that.tfLinStyle = [
        new Style({
          stroke: new Stroke({
            color: "#eed139",
            width: 2,
            lineDash: [0],
          }),
        }),
        new Style({
          stroke: new Stroke({
            color: "#0000ff",
            width: 2,
            lineDash: [0],
          }),
        }),
        new Style({
          stroke: new Stroke({
            color: "#0f8000",
            width: 2,
            lineDash: [0],
          }),
        }),
        new Style({
          stroke: new Stroke({
            color: "#fe9c45",
            width: 2,
            lineDash: [0],
          }),
        }),
        new Style({
          stroke: new Stroke({
            color: "#fe00fe",
            width: 2,
            lineDash: [0],
          }),
        }),
        new Style({
          stroke: new Stroke({
            color: "#fe0000",
            width: 2,
            lineDash: [0],
          }),
        }),
        new Style({
          stroke: new Stroke({
            color: "#fe0000",
            width: 2,
            lineDash: [10],
          }),
        }),
      ];
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
  