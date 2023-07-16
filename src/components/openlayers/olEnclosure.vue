<template>
  <div class="map-box">
    <!-- 信息弹框 -->
    <div ref="popup" class="popup" v-show="showPopup">
      <div class="info">
        <ul>
          <li>信息1：xxx</li>
          <li>信息2：xxx</li>
          <li>信息3：xxx</li>
        </ul>
        <div class="btns-box">
          <a-button @click="handleHistory"> 历史轨迹 </a-button>
        </div>
      </div>
    </div>
    <div id="lmap" ref="rootmap"></div>
    <!-- 鼠标移动显示坐标 -->
    <div id="mouse-position" class="mouseMove"></div>
    <!-- 鼠标移动显示坐标 -->
    <div ref="menuPopup" class="menu-popup" v-show="showMenuPopup">
      <div class="menus">
        <a-button @click.native="handleOperate">新增围栏</a-button>
      </div>
    </div>
    <!-- 列表选择器 -->
    <div class="map-toolbar" v-show="pageName == 'encloseure' ? true : false">
      <!-- 地图围栏 -->
      <span class="title">可选地理围栏</span>
      <a-select v-model="fence" style="width: 200px; height: 20px">
        <a-select-option value="-1" @click="handleSelectFence(null)"
          >不显示地理围栏</a-select-option
        >
        <a-select-option
          v-for="(item, index) in fences"
          :value="item.name"
          :key="index"
          @click="handleSelectFence(item)"
          >{{ item.name }}</a-select-option
        >
      </a-select>
      <!-- 地图选择 -->
    </div>
    <detail :editVisible="editVisible" @update="update" />
    <route :routeVisible="routeVisible" @close="close" />
  </div>
</template>
<script>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import {
  mdWsPointGeoApi,
  mdYsPointtGeoApi,
} from "../../utils/api/openlayers.js";
import GeoJSON from "ol/format/GeoJSON.js";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Overlay from "ol/Overlay";
import { defaults as defaultControls } from "ol/control";
import MousePosition from "ol/control/MousePosition";
import { createStringXY } from "ol/coordinate";
import { Polygon, Circle as gCircle } from "ol/geom";
import { Style, Fill, Stroke, Icon, Circle as sCircle } from "ol/style";
import Feature from "ol/Feature";
import detail from "./fence.vue";
import route from "./route.vue";
import * as olProj from "ol/proj";
import { mapGetters } from "vuex";
import { Select } from "ol/interaction";
import { never } from "ol/events/condition";
export default {
  name: "",
  components: {
    detail,
    route,
  },
  computed: {
    ...mapGetters(["fences"]),
  },
  props: {
    pageName: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      map: null,
      md_point: null,
      md_layer: {},
      mousePositionControl: null,
      baseLayer: null,
      menuPopup: null,
      showMenuPopup: false,
      editVisible: false,
      position: null,
      fence: null,
      fenceVector: null, // 围栏层
      select: null,
      popup: null,
      showPopup: false,
      routeVisible: false,
    };
  },
  mounted() {
    let vm = this;
    setTimeout(function () {
      let that = vm;
      that.md_point = that.createLayer("point", true, 0.4);
      that.initMap();
      that.getWsPoint();
      that.addOverlay();
      that.addEvent();
      that.mouseMove();
    }, 500);
  },
  beforeDestroy() {
    this.map = null;
  },
  methods: {
    /**
     * @name: 初始化地图
     */
    initMap() {
      const view = new View({
        projection: "EPSG:4326",
        center: [103.916, 30.0665],
        zoom: 14,
      });

      // 卫星图
      this.baseLayer = new TileLayer({
        source: new XYZ({
          url: "http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=5e6b50c26b65e5cc974c9765758f753b",
        }),
        visible: true,
      });
      this.map = new Map({
        //底图注掉即可
        layers: [this.baseLayer],
        target: "lmap", //对象映射：要将`map`对象附加到div，` map`对象将`target`作为参数，值是`div`的`id`
        view: view,
        controls: defaultControls({
          zoom: false,
          rotate: false,
          attribution: false,
        }),
      });
      //选择图层
      let that = this;
      this.select = new Select({
        condition: never,
        style: function (f) {
          if (f.values_.geometry.flatCoordinates.length > 2) {
            return this.pipeStyle(f, 5);
          } else {
            return that.iconStyle(f, 0.8);
          }
        },
      });
      this.map.addInteraction(this.select);
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
      }
    },
    //获取污水点数据
    getWsPoint() {
      mdWsPointGeoApi().then((res) => {
        let features = new GeoJSON().readFeatures(res);
        let wsFeatures = [];
        for (let i = 0; i < features.length; i++) {
          if (features[i].values_.characteristics == "预留口") {
            wsFeatures.push(features[i]);
          }
        }
        this.md_point.getSource().addFeatures(wsFeatures);
        this.map.addLayer(this.md_point);
      });
      mdYsPointtGeoApi().then((res) => {
        let features = new GeoJSON().readFeatures(res);
        let ysFeatures = [];
        for (let i = 0; i < features.length; i++) {
          if (features[i].values_.characteristics == "预留口") {
            ysFeatures.push(features[i]);
          }
        }
        this.md_point.getSource().addFeatures(ysFeatures);
      });
    },
    //鼠标移动
    mouseMove() {
      this.mousePositionControl = new MousePosition({
        coordinateFormat: createStringXY(4), //获取位置4位小数
        projection: "EPSG:4326",
        className: "custom-mouse-position",
        target: document.getElementById("mouse-position"), //将位置数据放到那里
        undefinedHTML: "&nbsp",
      });
      this.map.addControl(this.mousePositionControl);
    },
    // 监听事件统一调用
    addEvent() {
      this.mouseClick();
    },
    mouseClick() {
      // 左键点击
      if (this.pageName == "trace") {
        this.map.on("singleclick", (e) => {
          // 隐藏右键菜单
          this.showMenuPopup = false;
          this.md_point.getFeatures(e.pixel).then((clickedFeatures) => {
            if (clickedFeatures.length) {
              const features = clickedFeatures[0].values_;
              this.showPopup = true;
              // 设置弹窗位置
              let coordinates = features.geometry.flatCoordinates;
              this.position = coordinates;
              this.popup.setPosition(coordinates);
            } else {
              this.showPopup = false;
            }
          });
        });
      }
      // 右键点击
      if (this.pageName == "encloseure") {
        this.map.getViewport().oncontextmenu = (e) => {
          // 取消默认右键事件
          e.preventDefault();
          this.showMenuPopup = true;
          // 设置弹窗位置
          let coordinates = this.map.getEventCoordinate(e);
          this.position = coordinates;
          this.menuPopup.setPosition(coordinates);
        };
      }
    },
    // 按边界缩放
    mapFit(extent) {
      this.map
        .getView()
        .fit(extent, { duration: 1000, padding: [200, 200, 200, 200] });
    },
    //点击编辑围栏按钮
    handleOperate() {
      this.showMenuPopup = false;
      this.editVisible = true;
    },
    //点击历史轨迹按钮
    handleHistory() {
      this.showPopup = false;
      this.routeVisible = true;
    },
    // 关闭弹窗
    update() {
      this.editVisible = false;
    },
    // 关闭历史轨迹弹窗
    close() {
      this.routeVisible = false;
    },
    // 展示围栏
    handleSelectFence(data) {
      if (this.fenceVector) {
        this.map.removeLayer(this.fenceVector);
      }
      if (!data) {
        this.fence = null;
        this.select.getFeatures().clear();
        let center = [103.916, 30.0665];
        this.map.getView().setCenter(center);
        this.map.getView().setZoom(14);
        return false;
      }
      const area = this.areaFomart(data.area);
      this.setFenceSource(area);
    },
    // 围栏数据转换
    areaFomart(area) {
      // eslint-disable-next-line
      const point = area.match(/[^\(\)]+(?=\))/g)[0].split(", ");
      if (area.match("Circle")) {
        return {
          type: "Circle",
          center: olProj.fromLonLat(point[0].split(" ")),
          radius: Number(point[1]),
        };
      }
      if (area.match("Polygon")) {
        const path = [];
        point.forEach((item) => {
          path.push(olProj.fromLonLat(item.split(" ")));
        });
        return {
          type: "Polygon",
          path: path,
        };
      }
    },
    // 绘制围栏
    setFenceSource(area) {
      let feature;
      switch (area.type) {
        case "Circle": {
          feature = new Feature(new gCircle(area.center, area.radius));
          break;
        }
        case "Polygon": {
          feature = new Feature(new Polygon([area.path]));
          break;
        }
        default:
          break;
      }
      // 缩放到围栏区域
      this.mapFit(feature.getGeometry());
      //矢量图层
      let source = new VectorSource({
        features: [feature],
      });
      let vector = new VectorLayer({
        source,
        style: new Style({
          fill: new Fill({
            color: "rgba(49,173,252, 0.2)",
          }),
          stroke: new Stroke({
            color: "#0099FF",
            width: 3,
          }),
          image: new sCircle({
            radius: 7,
            fill: new Fill({
              color: "#0099FF",
            }),
          }),
        }),
      });
      this.fenceVector = vector;
      this.map.addLayer(vector);
      //清除选择图层，判断是否在区域内，添加到选择图层
      let polygon = feature.getGeometry();
      let extent = polygon.getExtent();
      let _this = this;
      this.select.getFeatures().clear();
      this.md_point
        .getSource()
        .forEachFeatureIntersectingExtent(extent, function (feature) {
          let coordinates = feature.getGeometry().getCoordinates();
          // 判断该点是否在圆内部;
          if (polygon.intersectsCoordinate(coordinates)) {
            _this.select.getFeatures().push(feature);
          }
        });
    },
    addOverlay() {
      // 创建Overlay
      let elPopup = this.$refs.popup;
      this.popup = new Overlay({
        element: elPopup,
        positioning: "bottom-center",
        stopEvent: false,
        offset: [0, -20],
      });
      this.map.addOverlay(this.popup);

      // 创建右键Overlay
      let elMenuPopup = this.$refs.menuPopup;
      this.menuPopup = new Overlay({
        element: elMenuPopup,
      });
      this.map.addOverlay(this.menuPopup);
    },
  },
};
</script>

<style lang="less">
.map-box {
  width: 100%;
  height: 100%;
  position: relative;
  #lmap {
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
  .mouseMove {
    color: rgb(255, 255, 255);
    position: absolute;
    bottom: 10px;
    left: 10px;
    z-index: 999;
    width: 150px;
    font-size: 16px;
  }
  .icon-label {
    z-index: 1000;
    position: absolute;
    top: 200px;
    left: 20px;
    .label-top {
      width: 170px;
      height: 40px;
      background: rgba(10, 26, 52, 0.6);
      border: 1px solid rgba(89, 175, 249, 0.7);
      box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
      backdrop-filter: blur(5px);
      display: flex;
      .img-top {
        width: 40px;
        margin-top: 5px;
        text-align: center;
        border-right: 1px dashed rgba(89, 175, 249, 0.7);
      }
      .label-name {
        font-family: "PingFang SC";
        font-style: normal;
        font-weight: 500;
        font-size: 18px;
        line-height: 25px;
        text-align: center;
        color: #ffffff;
        margin-top: 5px;
        margin-left: 10px;
      }
    }
    .label-bottom {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .menus {
    border-radius: 5px;
    padding: 5px;
    background: #fff;
  }
  .modal-detail {
    width: 100%;
    height: 100%;
    position: relative;
    .map-area {
      z-index: 99999;
      box-shadow: inset 5em 1em #000000;
      .tool-window {
        width: 200px;
        position: absolute;
        bottom: 5px;
        right: 5px;
        .radio {
          margin-right: 10px;
        }
        .button {
          font-size: 14px;
          margin-right: 10px;
        }
      }
    }
  }
  .map-toolbar {
    z-index: 999;
    position: absolute;
    bottom: 16px;
    right: 20px;
    .title {
      color: rgb(255, 255, 255);
      font-size: 16px;
      margin-right: 10px;
    }
  }
  .popup {
    width: 200px;
    background-color: white;
    padding: 18px;
    border-radius: 10px;
    box-shadow: 0 0 15px rgb(177, 177, 177);
    .info {
      font-size: 14px;
      text-align: left;
      ul {
        padding-left: 0;
      }
    }
    .btns-box {
      display: flex;
      margin-top: 20px;
    }
  }
}
</style>