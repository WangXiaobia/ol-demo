<template>
  <a-modal
    :width="1300"
    :bodyStyle="{ height: '800px' }"
    :dialog-style="{ left: '120px', top: '140px' }"
    title="历史轨迹"
    :visible="detailVisible"
    @cancel="handleCancel"
    :footer="null"
    :destroyOnClose="true"
  >
    <div class="modal-detail">
      <div id="fence-map" style="height: 607px"></div>
      <!-- 鼠标移动显示坐标 -->
      <div id="mouse-position2" class="mouseMove2"></div>
      <!-- 鼠标移动显示坐标 -->
      <div class="map-area">
        <a-card class="tool-window" style="width: 380px">
          <a-range-picker
            format="YYYY-MM-DD"
            :value="[
              moment(startTime, 'YYYY-MM-DD'),
              moment(endTime, 'YYYY-MM-DD'),
            ]"
            @change="onChange"
          >
          </a-range-picker>
          <div style="margin-top: 15px">
            <a-button type="primary" @click="getList">查询</a-button>
          </div>
          <div class="speed">
            速度：
            <div class="speed-input">
              <a-slider
                v-model="speed"
                :min="10"
                :max="100"
                :step="10"
              ></a-slider>
            </div>
            <a-button type="primary" @click="changeAnimation">{{
              animationText
            }}</a-button>
          </div>
        </a-card>
      </div>
    </div>
  </a-modal>
</template>
  <script>
import "ol/ol.css";
import { Map, View, Feature } from "ol";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import MousePosition from "ol/control/MousePosition";
import { createStringXY } from "ol/coordinate";
import { Style, Fill, Stroke, Circle as sCircle, Icon } from "ol/style";
import { getVectorContext } from "ol/render";
import { getRotation, getCenterPoint } from "@/utils/route";
import { Point, LineString } from "ol/geom";
import * as olProj from "ol/proj";
import moment from "moment";
export default {
  props: ["routeVisible"],
  data() {
    return {
      fenceMap: null,
      baseLayer: null,
      detailVisible: false,
      mousePositionControl: null,
      startTime: "2022-12-09",
      endTime: "2022-12-10",
      speed: 20,
      animationText: "开始",
      animating: false, // 动画是否进行中
      routeSource: null,
      routeLayer: null,
      routes: [],
      routesAll: [],
      routeGeometry: null,
      carGeometry: null,
      carFeature: null,
      lastRouteIndex: 0,
    };
  },
  watch: {
    routeVisible(val) {
      if (val) {
        this.getDetail();
      }
    },
    speed() {
      this.getRoutesAll();
    },
  },
  components: {},
  methods: {
    moment,
    handleCancel() {
      this.detailVisible = false;
      this.speed = 20;
      this.animationText = "开始";
      this.animating = false;
      this.$emit("close");
    },
    styles(f, type) {
      switch (type) {
        case "route":
          return new Style({
            stroke: new Stroke({
              lineDash: [2, 6, 10],
              width: 4,
              color: [0, 255, 0, 1],
            }),
          });
          break;
        case "marker":
          return new Style({
            image: new sCircle({
              radius: 5,
              stroke: new Stroke({
                color: "#fff",
              }),
              fill: new Fill({
                color: "#3399CC",
              }),
            }),
          });
          break;
        case "carMarker":
          return new Style({
            image: new Icon({
              rotation: f.rotation || 0,
              src: require("@/assets/olImg/car.png"),
              imgSize: [20, 36],
            }),
          });
          break;
      }
    },
    initMap() {
      this.baseLayer = new TileLayer({
        source: new XYZ({
          url: "http://t3.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=c6ea8a2d7a9794e4075bb6105b997762",
        }),
        visible: true,
      });
      this.routeSource = new VectorSource({ wrapX: false });

      this.routeLayer = new VectorLayer({
        source: this.routeSource,
        style: (feature) => {
          return this.styles(feature, feature.get("type"));
        },
      });
      this.fenceMap = new Map({
        layers: [this.baseLayer, this.routeLayer],
        target: "fence-map",
        view: new View({
          center: [103.916, 30.0665],
          zoom: 13.8,
        }),
      });
    },
    mouseMove() {
      this.mousePositionControl = new MousePosition({
        coordinateFormat: createStringXY(4), //获取位置4位小数
        projection: "EPSG:3857",
        className: "custom-mouse-position",
        target: document.getElementById("mouse-position2"), //将位置数据放到那里
        undefinedHTML: "&nbsp",
      });
      this.fenceMap.addControl(this.mousePositionControl);
    },
    getList() {
      let data = [
        [103.8803613, 30.04679117],
        [103.88678919, 30.06549832],
        [103.89906232, 30.07891946],
        [103.9151663, 30.08182314],
        [103.9292244, 30.07533256],
        [103.96006313, 30.08169968],
      ];
      this.routes = data.map((item) => {
        return olProj.fromLonLat(item);
      });
      this.getRoutesAll();
      this.drawRoute();
    },
    // 绘制轨迹
    drawRoute() {
      if (this.routeGeometry) {
        this.routeSource.clear();
      }
      this.routeGeometry = new LineString(this.routes);
      let route = new Feature({
        type: "route",
        geometry: this.routeGeometry,
      });
      // 绘制点
      let opints = this.drawPoint();
      // 添加小车
      let car = this.drawCar();
      this.routeSource.addFeatures([route, ...opints, car]);
      // 按轨迹边界缩放
      this.mapFit();
    },
    // 画点
    drawPoint() {
      let iconFeatures = [];
      this.routes.forEach((item) => {
        let feature = new Feature({
          type: "marker",
          geometry: new Point(item),
        });
        iconFeatures.push(feature);
      });
      return iconFeatures;
    },
    // 小车
    drawCar() {
      this.carGeometry = new Point(this.routeGeometry.getFirstCoordinate());
      const carMarker = new Feature({
        type: "carMarker",
        geometry: this.carGeometry,
      });
      this.carFeature = carMarker;
      return carMarker;
    },
    changeAnimation() {
      this.animating ? this.stopAnimation() : this.startAnimation();
    },
    // 开始动画
    startAnimation() {
      this.animating = true;
      this.animationText = "停止";
      this.routeLayer.on("postrender", this.moveFeature);
      this.carFeature.setGeometry(null);
    },
    // 停止动画
    stopAnimation() {
      this.animating = false;
      this.animationText = "开始";
      this.carFeature.setGeometry(this.carGeometry);
      this.routeLayer.un("postrender", this.moveFeature);
    },
    // 移动动画
    moveFeature(event) {
      const len = this.routesAll.length;
      if (this.lastRouteIndex < len - 1) {
        this.lastRouteIndex++;
      } else {
        this.lastRouteIndex = 0;
      }
      const current = this.routesAll[this.lastRouteIndex];
      this.carGeometry.setCoordinates(current.coordinate);
      const vectorContext = getVectorContext(event);
      let _Style = new Style({
        image: new Icon({
          anchor: [0.5, 0.5],
          rotation: current.rotation,
          src: require("@/assets/olImg/car.png"),
          imgSize: [20, 36],
        }),
      });
      vectorContext.setStyle(_Style);
      vectorContext.drawGeometry(this.carGeometry);
      this.fenceMap.render();
    },
    // 分割路径点
    getRoutesAll() {
      this.lastRouteIndex = 0;
      let _routesAll = [
        {
          coordinate: this.routes[0],
        },
      ];
      for (let i = 0, len = this.routes.length; i < len - 1; i++) {
        const item = this.routes[i];
        const itemNext = this.routes[i + 1];
        const rotation = getRotation(...item, ...itemNext);
        let points = getCenterPoint(
          this.fenceMap,
          [item, itemNext],
          this.speed
        );
        points = points.map((item) => {
          return {
            rotation,
            coordinate: item,
          };
        });
        _routesAll = [..._routesAll, ...points];
      }
      this.routesAll = _routesAll;
    },
    onChange(value) {
      let vm = this;
      vm.startTime = value[0].format("YYYY-MM-DD");
      vm.endTime = value[1].format("YYYY-MM-DD");
    },
    mapFit() {
      let mapView = this.fenceMap.getView();
      mapView.fit(this.routeGeometry, {
        padding: [120, 120, 120, 120],
      });
    },
    getDetail() {
      this.detailVisible = true;
      let vm = this;
      setTimeout(function () {
        let that = vm;
        that.initMap();
        that.getList();
        that.mouseMove();
      }, 500);
    },
  },
};
</script>
<style lang="less" scoped>
.modal-detail {
  width: 100%;
  height: 100%;
  position: relative;
  .map-area {
    box-shadow: inset 5em 1em #000000;
    position: relative;
    .tool-window {
      width: 200px;
      position: absolute;
      bottom: 20px;
      right: 20px;
      .button {
        font-size: 20px;
      }
      .speed {
        margin-top: 15px;
        display: flex;
        align-items: center;
        .speed-input {
          flex: 1;
          margin: 0 10px;
        }
      }
    }
  }
  .mouseMove2 {
    color: rgb(255, 255, 255);
    position: absolute;
    bottom: 10px;
    left: 10px;
    z-index: 999;
    width: 150px;
    font-size: 16px;
  }
}
</style>
<style>
.ant-card-body {
  padding: 8px;
  zoom: 1;
}
.ant-form-item {
  margin-bottom: 0px;
}
</style>