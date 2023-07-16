<template>
  <div class="map-box">
    <!-- 图层控制控件 -->
    <div id="map" ref="rootmap"></div>
    <!-- 工具条-->
    <div class="tool-wrapper">
      <a-dropdown class="tool-item" :align="{ offset: [0, 5] }">
        <a-menu slot="overlay">
          <a-menu-item @click="vertical('vertical')"> 纵剖面分析 </a-menu-item>
          <a-menu-item @click="vertical('cross')"> 横断面分析 </a-menu-item>
          <a-menu-item @click="flow"> 流向分析 </a-menu-item>
          <a-menu-item @click="buffer"> 缓冲区分析 </a-menu-item>
        </a-menu>
        <div class="flex-1">
          <img
            src="../../assets/olImg/rode_analys.png"
            class="icon-item"
          />空间分析
        </div>
      </a-dropdown>
    </div>
    <!-- 工具条-->
    <!-- 查询管线选择列表 -->
    <div class="query-list" v-show="queryClick">
      <div class="list-title">
        <span class="detail-title">查询列表</span>
        <a
          href="#"
          id="list-closer"
          class="ol-list-closer"
          @click="closerList"
        ></a>
      </div>
      <div class="list-content">
        <div class="u-table">
          <a-table
            :columns="columns"
            :data-source="records"
            :pagination="false"
            :scroll="{ x: 260, y: 350 }"
          >
            <template slot="operation" slot-scope="record">
              <span class="solt-cloumn" @click="moveTo(record)"
                ><a>定位</a></span
              >
            </template>
          </a-table>
        </div>
        <div class="bar-analysis">
          <a-button
            type="primary"
            v-show="popup == 'verticalRun'"
            @click="verticalClick"
            :disabled="analyAble"
            >分析</a-button
          >
          <a-radio-group
            v-show="popup == 'bufferRun'"
            style="display: flex"
            default-value="1"
            button-style="solid"
            v-model="status"
            @change="switchTab"
          >
            <a-radio-button value="1"> 管点 </a-radio-button>
            <a-radio-button value="2"> 管线 </a-radio-button>
          </a-radio-group>
        </div>
        <div class="bar-wrapper" v-if="totalnumber > 0">
          <span>共 {{ totalnumber }}条数据</span>
        </div>
      </div>
    </div>
    <!-- 查询管线选择列表 -->
    <!-- 鼠标移动显示坐标 -->
    <div id="mouse-position" class="mouseMove"></div>
    <!-- 鼠标移动显示坐标 -->
    <!-- 纵剖面分析 -->
    <vertical
      :popupVisible="popupVisible"
      :queryRecord="queryCode"
      @closerList="closerListPopup"
    />
    <!-- 横断面分析 -->
    <cross
      :popupVisible="popupVisible"
      :queryRecord="queryCode"
      @closerList="closerCross"
    />
    <!-- 流向分析 -->
    <flow
      :popupVisible="popupVisible"
      :queryRecord="flowCode"
      @closerList="closerFlow"
      @flowLine="flowLine"
    />
    <!-- 缓冲区分析 -->
    <buffer
      :popupVisible="popupVisible"
      :queryRecord="queryCode"
      @closerList="closerListPopup"
      @turfBuffer="turfBuffer"
    />
  </div>
</template>
<script>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import {
  mdWslineGeoApi,
  mdYslineGeoApi,
  mdWsPointGeoApi,
  mdYsPointtGeoApi,
} from "../../utils/api/openlayers.js";
import GeoJSON from "ol/format/GeoJSON.js";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style, Icon } from "ol/style";
import { defaults as defaultControls } from "ol/control";
import MousePosition from "ol/control/MousePosition";
import { createStringXY } from "ol/coordinate";
import Overlay from "ol/Overlay";
import { Select } from "ol/interaction";
import { never } from "ol/events/condition";
import Draw, { createBox } from "ol/interaction/Draw";
import * as turf from "@turf/turf";
import vertical from "./modal/vertical.vue";
import flow from "./modal/flow.vue";
import buffer from "./modal/buffer.vue";
import cross from "./modal/cross";

export default {
  name: "",
  components: {
    vertical,
    flow,
    buffer,
    cross,
  },
  props: {
    legendList: {
      type: Object,
    },
  },
  watch: {
    legendList: {
      handler(newV, oldV) {
        if (newV) {
          this.md_wsline.setVisible(newV.layerList[0].checked);
          this.md_ysline.setVisible(newV.layerList[1].checked);
          this.zoomControl();
        }
      },
      deep: true,
    },
  },
  data() {
    return {
      map: null,
      tianditu_layers: null, // 3种类型的天地图
      activeKey: "1", //默认显示管线
      md_wsline: null,
      md_ysline: null,
      md_wspoint1: null,
      md_wspoint2: null,
      md_wspoint3: null,
      md_yspoint1: null,
      md_yspoint2: null,
      md_yspoint3: null,
      overlay: null, //点击弹窗
      overlayList: null, //弹窗列表
      queryClick: false, //查询点击事件
      detail: {}, //弹窗要素详情
      baseLayers: [], //卷帘底图
      topLayer: null, //卷帘上层图
      totalnumber: 0, //列表管线数据总量
      md_layer: {}, //所有要素图层
      md_all_layer: {}, //包括不同分辨率图层
      records: [], //列表管线数据
      sketch: null,
      mousePositionControl: null,
      helpTooltipElement: null,
      helpTooltip: null,
      drawLayer: null, //分析线段
      drawLineBox: null, //线段编辑事件
      selectAnalysis: null, //分析选择事件
      md_line: {},
      queryClick: false, //选择纵剖面点击事件
      columns: [
        {
          title: "ID",
          dataIndex: "id",
          width: 100,
        },
        {
          title: "操作",
          width: 70,
          scopedSlots: { customRender: "operation" },
        },
      ],
      records: [],
      totalnumber: 0,
      analyAble: true,
      popupVisible: "",
      queryCode: [],
      flowCode: [], //流向分析事件
      md_point: {}, //所有管点图层
      drawResBox: null, //矩形编辑事件
      popup: "",
      bufferFeature: {}, //选择缓冲要素
      bufferLayer: null, //缓冲图层
      status: "1",
      bufferTable: {}, //缓冲区选择存储要素
      records1: [],
      records2: [],
      dashLayer: null,
    };
  },
  mounted() {
    let vm = this;
    setTimeout(function () {
      let that = vm;
      that.md_wsline = that.createLayer("line", true);
      that.md_ysline = that.createLayer("line", true);
      that.md_wspoint1 = that.createLayer("point", true, 0.1);
      that.md_wspoint2 = that.createLayer("point", false, 0.25);
      that.md_wspoint3 = that.createLayer("point", false, 0.5);
      that.md_yspoint1 = that.createLayer("point", true, 0.06);
      that.md_yspoint2 = that.createLayer("point", false, 0.25);
      that.md_yspoint3 = that.createLayer("point", false, 0.5);
      that.initMap();
      that.creatSelect();
      that.getLine();
      that.getWsPoint();
      that.getRainPoint();
      that.mouseMove();
      that.createDash();
      that.md_layer = {
        1: that.md_wsline,
        2: that.md_ysline,
        3: that.md_wspoint1,
        4: that.md_yspoint1,
      };
      that.md_line = {
        1: that.md_wsline,
        2: that.md_ysline,
      };
      that.md_point = {
        1: that.md_wspoint1,
        2: that.md_yspoint1,
      };
      that.md_all_layer = {
        1: that.md_wsline,
        2: that.md_ysline,
        3: that.md_wspoint1,
        4: that.md_yspoint1,
        5: that.md_wspoint2,
        6: that.md_yspoint2,
        7: that.md_wspoint3,
        8: that.md_yspoint3,
      };
      let _this = that;
      //监听分辨率，显示不同图标大小
      _this.map.getView().on("change:resolution", () => {
        _this.zoomControl();
      });
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
        zoom: 13.8,
      });

      // 卫星图
      this.topLayer = new TileLayer({
        source: new XYZ({
          url: "http://t3.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=c6ea8a2d7a9794e4075bb6105b997762",
        }),
        visible: true,
      });
      // 行政图
      var tianditu_vec = new TileLayer({
        source: new XYZ({
          url: "http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=c6ea8a2d7a9794e4075bb6105b997762",
        }),
        visible: true,
      });
      this.baseLayers.push(tianditu_vec);
      this.baseLayers.push(this.topLayer);
      this.map = new Map({
        //底图注掉即可
        layers: this.baseLayers,
        target: "map",
        view: view,
        controls: defaultControls({
          zoom: false,
          rotate: false,
          attribution: false,
        }),
      });
    },
    //创建分析选择图层
    creatSelect() {
      // 创建绘制图层
      this.drawLayer = new VectorLayer({
        source: new VectorSource({}),
        style: new Style({
          fill: new Fill({
            color: "rgba(89, 148, 241, 0.3)",
          }),
          stroke: new Stroke({
            color: "#00BFFF",
            width: 2,
          }),
        }),
      });
      this.map.addLayer(this.drawLayer);
      this.bufferLayer = new VectorLayer({
        source: new VectorSource({}),
        style: new Style({
          stroke: new Stroke({
            color: "#07B9EE",
            width: 2,
          }),
          fill: new Fill({
            color: "rgba(89, 148, 241, 0.3)",
          }),
        }),
      });
      this.map.addLayer(this.bufferLayer);
      //查询选择图层
      let _this = this;
      this.selectAnalysis = new Select({
        condition: never,
        style: function (f) {
          if (f.values_.geometry.flatCoordinates.length > 2) {
            return _this.pipeStyle(f, 5);
          } else {
            return _this.iconStyle(f, 0.7);
          }
        },
      });
      this.map.addInteraction(this.selectAnalysis);
    },
    createDash(){
      let styleDash = [
        //实线
        new Style({
          stroke: new Stroke({
            color: "rgba(0, 255, 240, 1)",
            width: 3,
            lineDash: [0],
          }),
        }),
        //虚线
        new Style({
          stroke: new Stroke({
            color: [255, 250, 250, 1],
            width: 3,
            lineDash: [20, 27], //一组线段和间距交互的数组，可以控制虚线的长度
            lineDashOffset: 100,
          }),
        }),
      ];
      this.dashLayer = new VectorLayer({
        source: new VectorSource({}),
        style: styleDash,
        zIndex: 2000,
      });
      this.map.addLayer(this.dashLayer);
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
      if (this.legendList.layerList[2].checked == true) {
        if (zoom > 18) {
          this.md_wspoint1.setVisible(false);
          this.md_wspoint2.setVisible(false);
          this.md_wspoint3.setVisible(true);
        } else if (zoom > 15) {
          this.md_wspoint1.setVisible(false);
          this.md_wspoint2.setVisible(true);
          this.md_wspoint3.setVisible(false);
        } else {
          this.md_wspoint1.setVisible(true);
          this.md_wspoint2.setVisible(false);
          this.md_wspoint3.setVisible(false);
        }
      } else if (this.legendList.layerList[2].checked == false) {
        this.md_wspoint1.setVisible(false);
        this.md_wspoint2.setVisible(false);
        this.md_wspoint3.setVisible(false);
      }
      if (this.legendList.layerList[3].checked == true) {
        if (zoom > 18) {
          this.md_yspoint1.setVisible(false);
          this.md_yspoint2.setVisible(false);
          this.md_yspoint3.setVisible(true);
        } else if (zoom > 15) {
          this.md_yspoint1.setVisible(false);
          this.md_yspoint2.setVisible(true);
          this.md_yspoint3.setVisible(false);
        } else {
          this.md_yspoint1.setVisible(true);
          this.md_yspoint2.setVisible(false);
          this.md_yspoint3.setVisible(false);
        }
      } else if (this.legendList.layerList[3].checked == false) {
        this.md_yspoint1.setVisible(false);
        this.md_yspoint2.setVisible(false);
        this.md_yspoint3.setVisible(false);
      }
    },
    //复位地图
    resetMap() {
      let center = [103.916, 30.0665];
      this.map.getView().setCenter(center);
      this.map.getView().setZoom(13.8);
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
    //查询tab切换
    changeTab(key) {
      this.activeKey = key;
    },
    createHelpTooltip() {
      if (this.helpTooltipElement) {
        this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement);
      }
      this.helpTooltipElement = document.createElement("div");
      this.helpTooltipElement.className = "ol-tooltip hidden";
      this.helpTooltip = new Overlay({
        element: this.helpTooltipElement,
        offset: [15, 0],
        positioning: "center-left",
      });
      this.map.addOverlay(this.helpTooltip);
    },
    pointerMoveHandler(evt) {
      if (evt.dragging) {
        return;
      }
      let helpMsg = "单击开始";
      let continueLineMsg = "左键结束编辑";
      if (this.sketch) {
        helpMsg = continueLineMsg;
      }
      this.helpTooltipElement.innerHTML = helpMsg;
      this.helpTooltip.setPosition(evt.coordinate);
      $(this.helpTooltipElement).removeClass("hidden");
    },
    getLineList(evt) {
      return [
        [evt[0], evt[1]],
        [evt[2], evt[3]],
      ];
    },
    //纵断面、横断面分析
    vertical(str) {
      this.closerListPopup();
      this.closerCross();
      this.queryClick = false;
      this.queryCode = [];
      this.createHelpTooltip();
      //鼠标移动加提示
      this.map.on("pointermove", this.pointerMoveHandler);
      this.selectAnalysis.getFeatures().clear();
      //清除编辑图层
      this.drawLayer.getSource().clear();
      this.records = [];
      // 创建绘制分析工具
      this.drawLineBox = new Draw({
        source: this.drawLayer.getSource(),
        type: "LineString",
        maxPoints: 2,
      });
      this.map.addInteraction(this.drawLineBox);
      let vm = this;
      // 开始绘制，清除已有要素
      this.drawLineBox.on("drawstart", function (evt) {
        vm.sketch = evt.feature;
        vm.drawLayer.getSource().clear();
      });
      this.drawLineBox.on("drawend", function (evt) {
        vm.sketch = null;
        let List1 = vm.getLineList(
          evt.feature.values_.geometry.flatCoordinates
        );
        for (let key in vm.md_line) {
          if (vm.md_line[key].getVisible() == true) {
            let featureList = vm.md_line[key].getSource().getFeatures();
            for (let i = 0; i < featureList.length; i++) {
              let List2 = vm.getLineList(
                featureList[i].values_.geometry.flatCoordinates
              );
              const line1 = turf.lineString(List1);
              const line2 = turf.lineString(List2);
              const intersections = turf.lineIntersect(line1, line2);
              if (intersections.features.length > 0) {
                vm.selectAnalysis.getFeatures().push(featureList[i]);
              }
            }
          }
        }
        vm.map.removeOverlay(vm.helpTooltip);
        vm.map.removeInteraction(vm.drawLineBox);
        if (str == "vertical") {
          vm.selectList();
        } else {
          vm.crossList();
          vm.popupVisible = "crossShow";
        }
      });
    },
    //添加选择列表
    selectList() {
      if (this.selectAnalysis.getFeatures().array_.length > 0) {
        for (
          let i = 0;
          i < this.selectAnalysis.getFeatures().array_.length;
          i++
        ) {
          this.records.push(
            this.selectAnalysis.getFeatures().array_[i].values_
          );
        }
        this.totalnumber = this.records.length;
        this.queryClick = true;
        this.popup = "verticalRun";
        this.map.removeInteraction(this.drawLineBox);
      }
    },
    crossList() {
      if (this.selectAnalysis.getFeatures().array_.length > 0) {
        for (
          let i = 0;
          i < this.selectAnalysis.getFeatures().array_.length;
          i++
        ) {
          this.queryCode.push(
            this.selectAnalysis.getFeatures().array_[i].values_
          );
        }
      }
    },
    closerList() {
      this.queryClick = false;
      this.selectAnalysis.getFeatures().clear();
      this.drawLayer.getSource().clear();
      this.records = [];
      this.status = "1";
      this.resetMap();
      this.closerListPopup();
    },
    //流向分析
    flow() {
      this.closerFlow();
      this.createHelpTooltip();
      //鼠标移动加提示
      this.map.on("pointermove", this.pointerMoveHandler);
      this.selectAnalysis.getFeatures().clear();
      //清除编辑图层
      this.drawLayer.getSource().clear();
      this.flowCode = [];
      // 创建绘制分析工具
      this.drawLineBox = new Draw({
        source: this.drawLayer.getSource(),
        type: "LineString",
        maxPoints: 2,
      });
      this.map.addInteraction(this.drawLineBox);
      let vm = this;
      // 开始绘制，清除已有要素
      this.drawLineBox.on("drawstart", function (evt) {
        vm.sketch = evt.feature;
        vm.drawLayer.getSource().clear();
      });
      this.drawLineBox.on("drawend", function (evt) {
        vm.sketch = null;
        let List1 = vm.getLineList(
          evt.feature.values_.geometry.flatCoordinates
        );
        for (let key in vm.md_line) {
          if (vm.md_line[key].getVisible() == true) {
            let featureList = vm.md_line[key].getSource().getFeatures();
            for (let i = 0; i < featureList.length; i++) {
              let List2 = vm.getLineList(
                featureList[i].values_.geometry.flatCoordinates
              );
              const line1 = turf.lineString(List1);
              const line2 = turf.lineString(List2);
              const intersections = turf.lineIntersect(line1, line2);
              if (intersections.features.length > 0) {
                vm.selectAnalysis.getFeatures().push(featureList[i]);
              }
            }
          }
        }
        vm.flowList();
        vm.map.removeOverlay(vm.helpTooltip);
      });
    },
    flowList() {
      if (this.selectAnalysis.getFeatures().array_.length > 0) {
        for (
          let i = 0;
          i < this.selectAnalysis.getFeatures().array_.length;
          i++
        ) {
          this.flowCode.push(
            this.selectAnalysis.getFeatures().array_[i].values_
          );
        }
        this.popupVisible = "flowShow";
        //有数据的话停止选择
        if (this.records) {
          this.map.removeInteraction(this.drawLineBox);
        }
      }
    },

    //缓冲区分析
    buffer() {
      this.closerListPopup();
      this.createHelpTooltip();
      //鼠标移动加提示
      this.map.on("pointermove", this.pointerMoveHandler);
      this.selectAnalysis.getFeatures().clear();
      //清除编辑图层
      this.drawLayer.getSource().clear();
      this.queryCode = [];
      // 创建绘制矩形工具
      this.drawResBox = new Draw({
        source: this.drawLayer.getSource(),
        type: "Circle",
        geometryFunction: createBox(),
      });
      this.map.addInteraction(this.drawResBox);
      let vm = this;
      // 开始绘制，清除已有要素
      this.drawResBox.on("drawstart", function (evt) {
        vm.sketch = evt.feature;
        vm.drawLayer.getSource().clear();
      });
      // 结束绘制
      this.drawResBox.on("drawend", function (e) {
        if (e.feature) {
          // 获取圆的外接矩形范围
          let circle = e.feature.getGeometry();
          let extent = circle.getExtent();
          // 查询外接矩形范围内的所有点
          // 查询外接矩形范围内的所有点
          for (let key in vm.md_all_layer) {
            if (vm.md_all_layer[key].getVisible() == true) {
              vm.md_all_layer[key]
                .getSource()
                .forEachFeatureIntersectingExtent(extent, function (feature) {
                  // let coordinates = feature.getGeometry().getCoordinates();
                  // 判断该点是否在圆内部
                  // if (circle.intersectsCoordinate(coordinates)) {
                  vm.selectAnalysis.getFeatures().push(feature);
                  // }
                });
            }
          }
          vm.bufferList();
          vm.map.removeOverlay(vm.helpTooltip);
        }
      });
      this.bufferTable = this.selectAnalysis.getFeatures().array_;
    },
    bufferList() {
      if (this.bufferTable.length > 0) {
        for (let i = 0; i < this.bufferTable.length; i++) {
          if (this.bufferTable[i].values_.geometry.flatCoordinates.length > 2) {
            this.records1.push(this.bufferTable[i].values_);
          } else {
            this.records2.push(this.bufferTable[i].values_);
          }
        }
        this.load_data();
        this.queryClick = true;
        this.map.removeInteraction(this.drawResBox);
        this.popup = "bufferRun";
      }
    },
    load_data() {
      this.records = this.status === "1" ? this.records2 : this.records1;
      this.totalnumber = this.records.length;
    },
    switchTab(e) {
      this.status = e.target.value;
      this.load_data();
    },
    turfBuffer(radius) {
      this.bufferLayer.getSource().clear();
      let type =
        this.bufferFeature.values_.geometry.flatCoordinates.length > 3
          ? "Line"
          : "Point";
      let coords = this.bufferFeature.values_.geometry.flatCoordinates;
      const tf =
        type === "Point"
          ? turf.point(coords)
          : turf.lineString(this.getLineList(coords));
      const tbf = turf.buffer(tf, radius, {
        //半径
        units: "meters", //单位
      });
      const obf = new GeoJSON().readFeature(tbf);
      obf.setStyle(() => {
        return new Style({
          stroke: new Stroke({
            color: "#07B9EE",
            width: 2,
          }),
          fill: new Fill({
            color: "rgba(89, 148, 241, 0.3)",
          }),
        });
      });
      this.bufferLayer.getSource().addFeature(obf);
    },
    //复位地图
    resetMap() {
      let center = [103.916, 30.0665];
      this.map.getView().setCenter(center);
      this.map.getView().setZoom(13.8);
    },
    //定位要素
    moveTo(record) {
      this.closerListPopup();
      this.analyAble = false;
      this.drawLayer.getSource().clear();
      for (let key in this.md_layer) {
        let features = this.md_layer[key].getSource().getFeatures();
        for (let i = 0; i < features.length; i++) {
          if (features[i].get("id") == record.id) {
            this.bufferFeature = features[i];
            this.queryCode.push(features[i].values_);
            this.selectAnalysis.getFeatures().push(features[i]);
          }
        }
      }
      this.simpleMove(record);
      if (this.popup == "bufferRun") {
        this.popupVisible = "bufferShow";
        this.verticalClick();
      }
    },
    simpleMove(record) {
      let center = [];
      center.push(record.geometry.flatCoordinates[0]);
      center.push(record.geometry.flatCoordinates[1]);
      this.map.getView().setCenter(center);
      this.map.getView().setZoom(20);
    },
    flowLine(obj) {
      this.dashLayer.getSource().clear()
      this.selectAnalysis.getFeatures().clear();
      let LineID = obj.data.id;
      this.simpleMove(obj.data);
      for (let key in this.md_line) {
        let features = this.md_line[key].getSource().getFeatures();
        for (let j = 0; j < features.length; j++) {
          if (features[j].get("id") == LineID) {
            this.dashLayer.getSource().addFeature(features[j]);
          }
        }
      }
      //定时赋值
      setInterval(() => {
        let lineDashOffset = this.dashLayer.getStyle()[1].getStroke().getLineDashOffset();
        console.log(lineDashOffset,'111')
        this.dashLayer.setStyle([
          this.dashLayer.getStyle()[0],
          //虚线
          new Style({
            stroke: new Stroke({
              color: [255, 250, 250, 1], //白色虚线
              width: 3,
              lineDash: [10, 25],
              lineDashOffset: lineDashOffset == 0 ? 100 : lineDashOffset - 2,
            }),
          }),
        ]);
      }, 100);
    },
    verticalClick() {
      this.analyAble = true;
      if (this.popup == "verticalRun") {
        this.popupVisible = "verticalShow";
      }
    },
    closerListPopup() {
      this.analyAble = true;
      this.queryCode = [];
      this.popupVisible = "";
      this.selectAnalysis.getFeatures().clear();
      this.bufferLayer.getSource().clear();
    },
    closerFlow() {
      this.flowCode = [];
      this.popupVisible = "";
      this.selectAnalysis.getFeatures().clear();
      this.drawLayer.getSource().clear();
      this.dashLayer.getSource().clear();
    },
    closerCross() {
      this.queryCode = [];
      this.popupVisible = "";
      this.selectAnalysis.getFeatures().clear();
      this.bufferLayer.getSource().clear();
      this.drawLayer.getSource().clear();
    },
  },
};
</script>

<style lang="less">
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
  .query-list {
    position: absolute;
    width: 260px;
    height: 500px;
    top: 220px;
    right: 10px;
    background: #fff;
    box-shadow: 0px 8px 20px 0px rgba(15, 31, 60, 0.16);
    border-radius: 6px;
    .list-title {
      width: 260px;
      height: 50px;
      background: #1890ff;
      .detail-title {
        font-size: 16px;
        color: #fff;
        margin-left: 10px;
        line-height: 50px;
      }
      .ol-list-closer:after {
        position: absolute;
        content: "✖";
        z-index: 999;
        display: inline;
        color: #fff;
        right: 10px;
        font-size: 16px;
        line-height: 50px;
      }
    }
    .list-content {
      width: 260px;
      height: 387px;
      .u-table {
        width: 260px;
        height: 410px;
        .solt-cloumn {
          color: #1890ff;
        }
      }
      .bar-analysis {
        margin-top: 4px;
        float: left;
        margin-left: 10px;
      }
      .bar-wrapper {
        float: right;
        margin-right: 10px;
        margin-top: 10px;
      }
    }
  }
  .tool-wrapper {
    position: absolute;
    right: 30px;
    top: 19px;
    width: 140px;
    height: 35px;
    z-index: 999;
    background: rgba(255, 255, 255, 1);
    display: flex;
    z-index: 100;
    position: absolute;
    border-radius: 2%;
    flex-direction: row;
    .tool-item {
      height: 100%;
      width: 100%;
      // flex: 1;
      padding: 6px 4px;
      text-align: center;
      border-right: 1px dashed #1296db;
      .icon-item {
        width: 18px;
        height: 18px;
        margin-right: 5px;
      }
    }
  }
  .ol-tooltip {
    position: relative;
    border-radius: 4px;
    color: white;
    padding: 4px 2px;
    opacity: 1;
    white-space: nowrap;
    font-size: 12px;
    cursor: default;
    user-select: none;
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
}
</style>