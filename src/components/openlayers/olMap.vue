<template>
  <div class="map-box">
    <!-- 查询输入框 -->
    <a-input-search
      placeholder="请输入编号"
      autocomplete="off"
      class="search-input"
      v-model="pipeNumber"
      @search="onQuery"
    >
      <a-button slot="enterButton" @click="onQuery" icon="search"> </a-button>
    </a-input-search>
    <a-button type="primary" class="clearButton" @click="clearButton"
      >清空</a-button
    >
    <!-- 查询输入框 -->
    <!-- 图层控制控件 -->
    <div class="control-function">
      <a-tooltip placement="left">
        <template slot="title">
          <span>放大</span>
        </template>
        <div class="control-item">
          <img src="@/assets/olImg/add.png" class="item-img" @click="zoomAdd" />
        </div>
      </a-tooltip>
      <a-tooltip placement="left">
        <template slot="title">
          <span>缩小</span>
        </template>
        <div class="control-item">
          <img
            src="@/assets/olImg/reduce.png"
            class="item-img"
            @click="zoomReduce"
          />
        </div>
      </a-tooltip>
      <a-tooltip placement="left">
        <template slot="title">
          <span>平移</span>
        </template>
        <div class="control-item">
          <img src="@/assets/olImg/moveTo.png" class="item-img" @click="pan" />
        </div>
      </a-tooltip>
      <a-tooltip placement="left">
        <template slot="title">
          <span>卷帘</span>
        </template>
        <div class="control-item">
          <img
            src="@/assets/olImg/rollerShutter.png"
            class="item-img"
            @click="rollerShutter"
          />
        </div>
      </a-tooltip>
      <a-tooltip placement="left">
        <template slot="title">
          <span>复位</span>
        </template>
        <div class="control-item">
          <img
            src="@/assets/olImg/reset.png"
            class="item-img"
            @click="resetMap"
          />
        </div>
      </a-tooltip>
    </div>
    <!-- 图层控制控件 -->
    <div id="map" ref="rootmap">
      <!-- 卷帘控件 -->
      <div
        ref="sliderEl"
        id="swipeContainer"
        :style="{ left: left + 'px' }"
        class="slider"
        @mousedown="onMouseDown"
        v-show="roller"
      >
        <div id="swipeDiv" @mousedown="onMouseDown">
          <div class="handle"></div>
        </div>
      </div>
      <!-- 卷帘控件 -->
    </div>
    <!-- 点击弹窗 -->
    <div id="popup" class="ol-popup">
      <div class="item-title">
        <span class="detail-title">{{ detail.appendages }}</span>
        <a href="#" id="popup-closer" class="ol-popup-closer"></a>
      </div>
      <div class="popup-content">
        <a-row class="popup-row">
          <a-col :span="12">
            <span>x坐标:{{ detail.x }}</span>
          </a-col>
          <a-col :span="12"> </a-col>
          <span>y坐标:{{ detail.y }}</span>
        </a-row>
        <a-row class="popup-row">
          <a-col :span="12"
            ><span>井底深:{{ detail.well_depth }}</span>
          </a-col>
          <a-col :span="12">
            <span>地面高:{{ detail.elevation }}</span>
          </a-col></a-row
        >
        <a-row class="popup-row">
          <a-col :span="12"
            ><span>所在道:{{ detail.rode_name }}</span></a-col
          ></a-row
        >
        <a-row class="popup-row"
          ><span>探测单:{{ detail.detection_unit }}</span></a-row
        >
        <a-row
          class="popup-row"
          style="text-decoration: underline; color: #16d5ff"
          ><span>查看详情</span></a-row
        >
      </div>
    </div>
    <!-- 点击弹窗 -->
    <!-- 查询弹窗 -->
    <div id="list" class="ol-list" v-show="queryClick">
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
        <a-tabs :activeKey="activeKey" class="list-tab" @change="changeTab">
          <a-tab-pane key="1" tab="管线">
            <div class="u-table">
              <a-table
                :columns="columns"
                :data-source="records"
                :pagination="false"
                :scroll="{ x: 450, y: 240 }"
              >
                <template slot="operation" slot-scope="record">
                  <span class="solt-cloumn" @click="moveTo(record)"
                    ><a>定位</a></span
                  >
                </template>
                <!-- <template slot="sq" slot-scope="record, text, index">
                <span>
                  {{ (currentPage - 1) * pagesize + parseInt(index) + 1 }}
                </span>
              </template> -->
              </a-table>
            </div>
            <div class="bar-wrapper" v-if="totalnumber > 0">
              <span>第1-{{ totalnumber }}条 / 共 {{ totalnumber }}条</span>
            </div>
          </a-tab-pane>
          <a-tab-pane key="2" tab="管点">
            <div class="u-table">
              <a-table
                :columns="columns2"
                :data-source="records2"
                :pagination="false"
                :scroll="{ x: 450, y: 250 }"
              >
                <template slot="operation" slot-scope="record">
                  <span class="solt-cloumn" @click="moveTo(record)"
                    ><a>定位</a></span
                  >
                </template>
              </a-table>
            </div>
            <div class="bar-wrapper" v-if="totalnumber2 > 0">
              <span>第1-{{ totalnumber2 }}条 / 共 {{ totalnumber2 }}条</span>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
    <!-- 查询弹窗 -->
    <!-- 工具条-->
    <div class="tool-wrapper">
      <a-dropdown class="tool-item" :align="{ offset: [0, 5] }">
        <a-menu slot="overlay">
          <a-menu-item @click="create('point')"> 画点 </a-menu-item>
          <a-menu-item @click="create('line')"> 画线 </a-menu-item>
          <a-menu-item @click="create('polygon')"> 画面 </a-menu-item>
          <a-menu-item @click="stopEditing"> 停止编辑 </a-menu-item>
        </a-menu>
        <div class="flex-1">
          <img src="../../assets/olImg/edit.png" class="icon-item" />编辑
        </div>
      </a-dropdown>
      <a-dropdown
        placement="bottomCenter"
        class="tool-item"
        :align="{ offset: [0, 5] }"
      >
        <a-menu slot="overlay">
          <a-menu-item @click="measureShp('distance')"> 测距 </a-menu-item>
          <a-menu-item @click="measureShp('Area')"> 测面积 </a-menu-item>
          <a-menu-item @click="measureShp('Angle')"> 测角度</a-menu-item>
          <a-menu-item @click="undo">清除测量图层</a-menu-item>
        </a-menu>
        <div class="flex-1">
          <img src="../../assets/olImg/tool.png" class="icon-item img2" />工具
        </div>
      </a-dropdown>
      <a-dropdown class="tool-item" :align="{ offset: [0, 5] }">
        <a-menu slot="overlay">
          <a-menu-item @click="searchSelect('Rectangle')">
            矩形查询
          </a-menu-item>
          <a-menu-item @click="searchSelect('Polygon')">
            多边形查询
          </a-menu-item>
        </a-menu>
        <div class="flex-1">
          <img src="../../assets/olImg/query.png" class="icon-item" />空间查询
        </div>
      </a-dropdown>
    </div>
    <!-- 工具条-->
    <!-- 鼠标移动显示坐标 -->
    <div id="mouse-position" class="mouseMove"></div>
    <!-- 鼠标移动显示坐标 -->
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
import { Circle as CircleStyle, Fill, Stroke, Style, Icon } from "ol/style";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import Overlay from "ol/Overlay";
import { Select } from "ol/interaction";
import { click, never } from "ol/events/condition";
import { defaults as defaultControls } from "ol/control";
import { columns, columns2 } from "./js/column";
import Draw, { createBox } from "ol/interaction/Draw";
import { getArea, getLength, getDistance } from "ol/sphere";
import { unByKey } from "ol/Observable";
import { LineString, Polygon } from "ol/geom";
import MousePosition from "ol/control/MousePosition";
import { createStringXY } from "ol/coordinate";
import mapConfig from '../../config/mapConfig';
export default {
  name: "",
  components: {},
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
      selectClick: null, //单击选择
      pipeNumber: "", //搜索框
      select: null, //查询选择
      detail: {}, //弹窗要素详情
      baseLayers: [], //卷帘底图
      topLayer: null, //卷帘上层图
      mapWidth: 0, //卷帘宽度
      minClientLeft: 0, //卷帘按钮移动最小距离
      maxClientLeft: 0, //卷帘按钮移动最大距离
      left: 0, //卷帘按钮位置
      clientleft: 0, //卷帘移动距离
      isMove: false,
      roller: false,
      totalnumber: 0, //列表管线数据总量
      totalnumber2: 0, //列表管点数据总量
      columns, //列表管线表头
      columns2, //列表管点表头
      md_layer: {}, //所有要素图层
      md_all_layer: {}, //包括不同分辨率图层
      records: [], //列表管线数据
      records2: [], //列表管点数据
      drawLayer: null, //查询编辑图层
      drawBox: null, //查询编辑交互
      output: "", //测量标注
      sketch: null,
      measure: null, //测量交互
      messureLayer: null, //测量编辑图层
      measureTooltip: null, //测量标注图层
      measureTooltipElement: null,
      mousePositionControl: null,
      createDraw: null, //新增编辑图层
      createFeature: null, //新增编辑交互
      value: "", //编辑要素类型
      domTarget: null, // 鼠标样式设置
      closer: null,
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
      that.initOverlay();
      that.initSelect();
      that.initSearchSelect();
      that.mouseMove();
      that.getLine();
      that.getWsPoint();
      that.getRainPoint();
      that.md_layer = {
        1: that.md_wsline,
        2: that.md_ysline,
        3: that.md_wspoint1,
        4: that.md_yspoint1,
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
      //实现卷帘功能
      // 拖动事件注册在 doucment 上面，防止拖拽过程中鼠标丢失情况
      document.addEventListener("mousemove", _this.onMouseMove);
      document.addEventListener("mouseup", _this.onMouseUp);
    }, 500);
  },
  beforeDestroy() {
    this.map = null;
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
  },
  methods: {
    /**
     * @name: 初始化地图
     */
    initMap() {
      proj4.defs(
        "EPSG:2379",
        "+proj=tmerc +lat_0=0 +lon_0=102 +k=1 +x_0=500000 +y_0=0 +ellps=IAU76 +units=m +no_defs"
      );
      register(proj4);
      const view = new View({
        // projection: "EPSG:2379",
        // center: [505928.659, 3327727.803],
        projection: "EPSG:4326",
        center: mapConfig.olcenter,
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
      // setTimeout( function(){mthis.routeMap.map.setSize([mthis.routeMap.map.getViewport().offsetWidth,mthis.routeMap.map.getViewport().offsetHeight])},2)
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
      /*鼠标样式设置*/
      var target = this.map.getTarget();
      this.domTarget =
        typeof target === "string" ? document.getElementById(target) : target;
      // 创建测量数据存储图层
      this.messureLayer = new VectorLayer({
        source: new VectorSource({}),
        style: new Style({
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.2)",
          }),
          stroke: new Stroke({
            color: "#ffcc33",
            width: 2,
          }),
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({
              color: "#ffcc33",
            }),
          }),
        }),
      });
      // 创建绘制图层
      this.createDraw = new VectorLayer({
        source: new VectorSource({}),
        style: {
          "fill-color": "rgba(255, 255, 255, 0.2)",
          "stroke-color": "#ffcc33",
          "stroke-width": 2,
          "circle-radius": 7,
          "circle-fill-color": "#ffcc33",
        },
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
    initOverlay() {
      // 初始化overlay点击弹窗
      let container = document.getElementById("popup");
      this.closer = document.getElementById("popup-closer");
      this.overlay = new Overlay({
        element: container, //绑定 Overlay 对象和 DOM 对象的
        autoPan: true, // 定义弹出窗口在边缘点击时候可能不完整 设置自动平移效果
        autoPanAnimation: {
          duration: 250, //自动平移效果的动画时间 9毫秒
        },
        positioning: "center-right",
        offset: [-10, 0],
      });
      this.map.addOverlay(this.overlay);
      // 关闭overlay弹窗
      let _this = this;
      this.closer.onclick = function () {
        _this.overlay.setPosition(undefined);
        _this.closer.blur();
        _this.selectClick.getFeatures().clear();
        return false;
      };
    },
    initSelect() {
      //定义选择事件单击要素显示弹窗
      let _this = this;
      this.selectClick = new Select({
        condition: click,
        layers: [
          this.md_wsline,
          this.md_ysline,
          this.md_wspoint1,
          this.md_wspoint2,
          this.md_wspoint3,
          this.md_yspoint1,
          this.md_yspoint2,
          this.md_yspoint3,
        ],
        style: function (f) {
          if (f.values_.geometry.flatCoordinates.length > 2) {
            return _this.pipeStyle(f, 5);
          } else {
            return _this.iconStyle(f, 0.7);
          }
        },
      });
      this.map.addInteraction(this.selectClick);
      this.selectClick.on("select", function (evt) {
        if (evt.selected.length == 1) {
          _this.overlay.setPosition(
            evt.selected[0].values_.geometry.flatCoordinates
          );
          _this.closer.blur();
          _this.detail = evt.selected[0].values_;
        } else {
          _this.overlay.setPosition(undefined);
          _this.closer.blur();
          _this.selectClick.getFeatures().clear();
          return false;
        }
      });
    },
    initSearchSelect() {
      let that = this;
      //查询选择图层
      this.select = new Select({
        condition: never,
        style: function (f) {
          if (f.values_.geometry.flatCoordinates.length > 2) {
            return that.pipeStyle(f, 5);
          } else {
            return that.iconStyle(f, 0.7);
          }
        },
      });
      this.map.addInteraction(this.select);
    },
    mouseMove() {
      //鼠标移动
      this.mousePositionControl = new MousePosition({
        coordinateFormat: createStringXY(4), //获取位置4位小数
        projection: "EPSG:4326",
        className: "custom-mouse-position",
        target: document.getElementById("mouse-position"), //将位置数据放到那里
        undefinedHTML: "&nbsp",
      });
      this.map.addControl(this.mousePositionControl);
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
        if (zoom > 19) {
          this.md_wspoint1.setVisible(false);
          this.md_wspoint2.setVisible(false);
          this.md_wspoint3.setVisible(true);
        } else if (zoom > 16) {
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
        if (zoom > 19) {
          this.md_yspoint1.setVisible(false);
          this.md_yspoint2.setVisible(false);
          this.md_yspoint3.setVisible(true);
        } else if (zoom > 16) {
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
    //放大
    zoomAdd() {
      let zoom = this.map.getView().getZoom(); //获取当前地图的缩放级别
      this.map.getView().setZoom(zoom + 1);
    },
    //缩小
    zoomReduce() {
      let zoom = this.map.getView().getZoom(); //获取当前地图的缩放级别
      this.map.getView().setZoom(zoom - 1);
    },
    // 改变手势
    pan() {
      let that = this;
      this.domTarget.onmouseover = function (e) {
        that.domTarget.style.cursor = "pointer";
      };
    },
    //平移地图
    moveTo(record) {
      let center = [];
      center.push(record.geometry.flatCoordinates[0]);
      center.push(record.geometry.flatCoordinates[1]);
      this.map.getView().setCenter(center);
      this.map.getView().setZoom(21);
    },
    //复位地图
    resetMap() {
      let center = [103.916, 30.0665];
      this.map.getView().setCenter(center);
      this.map.getView().setZoom(13.8);
      this.endRoller();
      let that = this;
      this.domTarget.onmouseover = function (e) {
        that.domTarget.style.cursor = "";
      };
    },
    //卷帘功能
    rollerShutter() {
      this.roller = true;
      this.mapWidth = this.$refs.rootmap.offsetWidth;
      this.left = this.mapWidth / 2;
      // 保证卷帘始终在地图内，并两边留一部分
      this.minClientLeft = this.$refs.rootmap.offsetLeft + 66;
      this.maxClientLeft = this.minClientLeft + this.mapWidth - 50;
      this.topLayer.on("prerender", (e) => {
        const ctx = e.context;
        const width = ctx.canvas.width * (this.left / this.mapWidth);
        ctx.save();
        ctx.beginPath();
        ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
        ctx.clip(); // 裁剪
      });
      // 请求完成，渲染
      this.topLayer.on("postrender", function (e) {
        const ctx = e.context;
        ctx.restore();
      });
    },
    endRoller() {
      this.roller = false;
      this.left = 0;
      this.map.render();
    },
    onMouseDown(e) {
      this.isMove = true;
      this.clientleft = e.clientX;
      this.$refs.sliderEl.style.cursor = "move";
    },
    onMouseMove(e) {
      if (!this.isMove) return;
      if (e.clientX < this.minClientLeft || e.clientX > this.maxClientLeft)
        return;

      const mx = e.clientX - this.clientleft;
      this.clientleft = e.clientX;

      this.left = this.left + mx;
      this.map.render();
    },
    onMouseUp() {
      this.isMove = false;
      this.$refs.sliderEl.style.cursor = "default";
    },
    // 鼠标移入获取清空按钮
    clearButton() {
      this.pipeNumber = "";
      this.select.getFeatures().clear();
      this.queryClick = false;
      //复位地图
      this.resetMap();
    },
    //搜索查询
    onQuery() {
      this.select.getFeatures().clear();
      this.records = [];
      this.records2 = [];
      for (let key in this.md_layer) {
        let features = this.md_layer[key].getSource().getFeatures();
        for (let i = 0; i < features.length; i++) {
          if (features[i].get("id") == this.pipeNumber) {
            this.select.getFeatures().push(features[i]);
          }
        }
      }
      this.selectList();
    },
    //添加选择列表
    selectList() {
      for (let i = 0; i < this.select.getFeatures().array_.length; i++) {
        if (
          this.select.getFeatures().array_[i].values_.geometry.flatCoordinates
            .length > 2
        ) {
          this.records.push(this.select.getFeatures().array_[i].values_);
        } else {
          this.records2.push(this.select.getFeatures().array_[i].values_);
        }
      }
      console.log(this.select.getFeatures(), "dasd");
      this.totalnumber = this.records.length;
      this.totalnumber2 = this.records2.length;
      this.queryClick = true;
      //有数据的话停止选择
      if (this.records || this.records2) {
        this.map.removeInteraction(this.drawBox);
      }
    },
    //关闭选择列表
    closerList() {
      this.queryClick = false;
      this.pipeNumber = "";
      this.select.getFeatures().clear();
      this.activeKey = "1";
      //关闭弹窗复位地图
      // this.resetMap();
    },
    //查询tab切换
    changeTab(key) {
      this.activeKey = key;
    },
    // 多边形查询
    searchSelect(e) {
      let value;
      let geometryFunction;
      if (e == "Rectangle") {
        value = "Circle";
        geometryFunction = createBox();
      } else {
        value = "Polygon";
      }
      // 创建绘制图层
      this.drawLayer = new VectorLayer({
        source: new VectorSource({}),
        style: new Style(),
      });
      // 创建绘制矩形工具
      this.drawBox = new Draw({
        source: this.drawLayer.getSource(),
        type: value,
        geometryFunction: geometryFunction,
      });
      this.map.addInteraction(this.drawBox);
      let vm = this;
      // 开始绘制，清除已有要素
      vm.drawBox.on("drawstart", function () {
        vm.select.getFeatures().clear();
        vm.drawLayer.getSource().clear();
      });
      // 结束绘制
      vm.drawBox.on("drawend", function (e) {
        if (e.feature) {
          // 获取圆的外接矩形范围
          let circle = e.feature.getGeometry();
          let extent = circle.getExtent();
          // 查询外接矩形范围内的所有点
          for (let key in vm.md_all_layer) {
            if (vm.md_all_layer[key].getVisible() == true) {
              vm.md_all_layer[key]
                .getSource()
                .forEachFeatureIntersectingExtent(extent, function (feature) {
                  // let coordinates = feature.getGeometry().getCoordinates();
                  // 判断该点是否在圆内部
                  // if (circle.intersectsCoordinate(coordinates)) {
                  vm.select.getFeatures().push(feature);
                  // }
                });
            }
          }
          vm.selectList();
        }
      });
    },
    // 测距和测面
    formatLength(line) {
      let sourceProj = this.map.getView().getProjection();
      const length = getLength(line, { projection: sourceProj });
      if (length > 100) {
        this.output = Math.round((length / 1000) * 100) / 100 + " " + "km";
      } else {
        this.output = Math.round(length * 100) / 100 + " " + "m";
      }
    },
    formatArea(polygon) {
      let sourceProj = this.map.getView().getProjection();
      const area = getArea(polygon, { projection: sourceProj });
      if (area > 10000) {
        this.output =
          Math.round((area / 1000000) * 100) / 100 + " " + "km<sup>2</sup>";
      } else {
        this.output = Math.round(area * 100) / 100 + " " + "m<sup>2</sup>";
      }
    },
    formatAngle(line) {
      var coordinates = line.getCoordinates();
      var angle = 0;
      for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
        var c1 = coordinates[i];
        var c2 = coordinates[i + 1];
        var c3 = 0;
        //当绘制两个及以上点的时候，将c1的值传给C3，C2的值传给C1
        if (i >= 1) {
          c3 = coordinates[i - 1];
          var disa = getDistance(c3, c1);
          var disb = getDistance(c1, c2);
          var disc = getDistance(c2, c3);
          //由于绘制结束的时候双击会导致c1=c2，从而disb=0，而分母不能为零，导致angle=NAN值，所以需要取双击的前一次值。
          //当有三个以上的点的时候，形成了角度，需要对角度进行测量输出。
          if (disb === 0 && i >= 2) {
            c1 = coordinates[i - 1];
            c2 = coordinates[i];
            c3 = coordinates[i - 2];
            disa = getDistance(c3, c1);
            disb = getDistance(c1, c2);
            disc = getDistance(c2, c3);
          }
          var cos =
            (disa * disa + disb * disb - disc * disc) / (2 * disa * disb); //利用余弦定理公式计算cos值
          angle = (Math.acos(cos) * 180) / Math.PI; //求反余弦值，得到弧度制，并将弧度值转角度值
          angle = angle.toFixed(2) + "度"; //对计算完成的角度，保留两位小数
          //由于绘制结束的时候双击会导致c1=c2，从而disb=0，而分母不能为零，导致angle=NAN值，所以需要取双击的前一次值。
          //当只有两个点的时候，只是一条线，并不形成角度，需要提示继续绘制。
          if (disb === 0 && i < 2) {
            angle = "请继续绘制形成角度";
          }
        }
        //当只是绘制一个点的时候，提示继续绘制。
        else {
          angle = "请继续绘制形成角度";
        }
        this.output = angle;
      }
    },
    createMeasureTooltip() {
      if (this.measureTooltipElement) {
        this.measureTooltipElement.parentNode.removeChild(
          this.measureTooltipElement
        );
      }
      this.measureTooltipElement = document.createElement("div");
      this.measureTooltipElement.className = "ol-tooltip ol-tooltip-measure";
      this.measureTooltip = new Overlay({
        element: this.measureTooltipElement,
        offset: [0, -15],
        positioning: "bottom-center",
        stopEvent: false,
        insertFirst: false,
      });
      this.map.addOverlay(this.measureTooltip);
    },
    measureShp(type) {
      this.map.interactions.remove(this.measure);
      const char = type == "Area" ? "Polygon" : "LineString";
      // 创建绘制图层
      this.measure = new Draw({
        source: this.messureLayer.getSource(),
        type: char,
        style: new Style({
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.2)",
          }),
          stroke: new Stroke({
            color: "#ffcc33",
            lineDash: [10, 10],
            width: 2,
          }),
          image: new CircleStyle({
            radius: 5,
            stroke: new Stroke({
              color: "#ffcc33",
            }),
            fill: new Fill({
              color: "rgba(255, 255, 255, 0.2)",
            }),
          }),
        }),
      });
      this.map.addInteraction(this.measure);
      this.createMeasureTooltip();
      let listener;
      let vm = this;
      this.measure.on("drawstart", function (evt) {
        // set sketch
        vm.sketch = evt.feature;
        let tooltipCoord = evt.coordinate;
        listener = vm.sketch.getGeometry().on("change", function (evt) {
          const geom = evt.target;
          if (geom instanceof Polygon) {
            vm.formatArea(geom);
            tooltipCoord = geom.getInteriorPoint().getCoordinates();
          } else if (geom instanceof LineString) {
            if (type == "distance") {
              vm.formatLength(geom);
            } else {
              vm.formatAngle(geom);
            }
            tooltipCoord = geom.getLastCoordinate();
          }
          vm.measureTooltipElement.innerHTML = vm.output;
          vm.measureTooltip.setPosition(tooltipCoord);
        });
      });

      vm.measure.on("drawend", function () {
        vm.measureTooltipElement.className = "ol-tooltip ol-tooltip-static";
        vm.measureTooltip.setOffset([0, -7]);
        // unset sketch
        vm.sketch = null;
        // uns;et tooltip so that a new one can be created
        vm.measureTooltipElement = null;
        vm.createMeasureTooltip();
        unByKey(listener);
      });
      this.map.addLayer(this.messureLayer);
    },
    //清除测量结果
    undo() {
      //移除测量事件
      this.map.interactions.remove(this.measure);
      //移除测量图层
      this.messureLayer.getSource().clear();
      this.map.removeLayer(this.messureLayer);
      //移除标注图层
      $("div.ol-tooltip-static").remove();
      // this.map.getOverlays().clear();
    },
    //点、线、面编辑
    create(str) {
      if (this.value) {
        this.map.removeInteraction(this.createFeature);
        if (str == "point") {
          this.value = "Point";
        } else if (str == "line") {
          this.value = "LineString";
        } else {
          this.value = "Polygon";
        }
        // 创建绘制矩形工具
        this.createFeature = new Draw({
          source: this.createDraw.getSource(),
          type: this.value,
        });
        this.map.addInteraction(this.createFeature);
      } else {
        if (str == "point") {
          this.value = "Point";
        } else if (str == "line") {
          this.value = "LineString";
        } else {
          this.value = "Polygon";
        }
        // 创建绘制矩形工具
        this.createFeature = new Draw({
          source: this.createDraw.getSource(),
          type: this.value,
        });
        this.map.addLayer(this.createDraw);
        this.map.addInteraction(this.createFeature);
      }
    },
    //停止编辑
    stopEditing() {
      this.value = "";
      this.createDraw.getSource().clear();
      this.map.removeLayer(this.createDraw);
      this.map.removeInteraction(this.createFeature);
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
  .ol-tooltip {
    position: relative;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 4px;
    color: white;
    padding: 4px 8px;
    opacity: 0.7;
    white-space: nowrap;
    font-size: 12px;
    cursor: default;
    user-select: none;
  }
  .ol-tooltip-measure {
    opacity: 1;
    font-weight: bold;
  }
  .ol-tooltip-static {
    background-color: #ffcc33;
    color: black;
    border: 1px solid white;
  }
  .ol-tooltip-measure:before,
  .ol-tooltip-static:before {
    border-top: 6px solid rgba(0, 0, 0, 0.5);
    border-right: 6px solid transparent;
    border-left: 6px solid transparent;
    content: "";
    position: absolute;
    bottom: -6px;
    margin-left: -7px;
    left: 50%;
  }
  .ol-tooltip-static:before {
    border-top-color: #ffcc33;
  }
  .ol-popup:before {
    //这里就是小三角了
    content: "";
    position: absolute;
    display: block;
    right: -20px; //给小三角定位，更具实际需求调整
    top: 80px; //给小三角定位，更具实际需求调整
    border-width: 10px;
    border-style: dashed dashed dashed solid; //四个参数分别代表向下，左，上右的小三角(对应方向的小三角设置为solid，其他的为dashed。我这里演示向左的小三角，所以设置第二个）
    border-color: transparent transparent transparent #f8f5f5; //四个参数分别代表向下，左，上右的小三角。对应方向的小三角设置你想要的颜色（为了直观我这里设置黑色），其他的为transparent。我这里演示向左的小三角，所以设置第二个。
  }
  .ol-popup {
    position: relative;
    width: 270px;
    height: 180px;
    background: #fef2f2;
    .ol-popup-closer:after {
      position: absolute;
      content: "✖";
      z-index: 999;
      display: inline;
      color: #0f1f3c;
      right: 10px;
      line-height: 28px;
    }
    .item-title {
      width: 270px;
      height: 30px;
      background: #1890ff;
      border-bottom-color: #c2c4c7;
      .detail-title {
        font-size: 14px;
        margin-left: 5px;
        line-height: 28px;
      }
    }
    .popup-content {
      .popup-row {
        text-align: left;
        margin-top: 10px;
        margin-left: 5px;
        font-size: 12px;
      }
    }
  }
  .ol-list {
    position: absolute;
    width: 500px;
    height: 440px;
    top: 120px;
    left: 10px;
    background: #fff;
    box-shadow: 0px 8px 20px 0px rgba(15, 31, 60, 0.16);
    border-radius: 6px;
    .list-title {
      width: 500px;
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
      width: 500px;
      height: 387px;
      .list-tab {
        .u-table {
          margin-top: -15px;
          width: 500px;
          height: 280px;
          .solt-cloumn {
            color: #1890ff;
          }
        }
        .bar-wrapper {
          float: right;
          margin-right: 30px;
          margin-top: 28px;
        }
      }
    }
  }
  .search-input {
    position: absolute;
    left: 30px;
    top: 19px;
    z-index: 200;
    width: 240px;
    height: 25px;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.4);
    .ant-btn {
      padding-top: 1px;
      width: 40px;
      background: #1890ff;
      border: 1px solid #1890ff;
    }
    svg {
      font-size: 17px;
      color: #ffffff;
    }
  }
  .clearButton {
    position: absolute;
    left: 290px;
    top: 19px;
    z-index: 200;
    width: 60px;
    height: 31px;
  }
  .control-function {
    z-index: 100;
    position: absolute;
    border-radius: 8%;
    right: 20px;
    bottom: 20px;
    width: 40px;
    height: 200px;
    background: #fff;
    display: flex;
    flex-direction: column;
    .control-item {
      border-radius: 8%;
      height: 25%;
      width: 100%;
      // background: #1296db;
      flex: 1;
      padding: 5px 6px;
      .item-img {
        height: 100%;
        width: 100%;
        font-size: 29px;
        color: #fff;
        border-radius: 10%;
        border: 2px solid #1296db;
        background: #fff;
        opacity: 0.7;
      }
    }
  }
  #swipeContainer {
    position: absolute;
    opacity: 0.8;
    width: 0.625rem;
    height: 100%;
    top: 0;
    left: 50%;
    background-color: rgba(50, 50, 50, 0.75);
    cursor: col-resize;
    z-index: 2;
  }

  #swipeContainer:hover {
    opacity: 0.5;
  }

  #swipeDiv {
    border: solid 0.5px #ffffff;
    height: 100%;
    width: 0px;
    margin: 0 auto;
  }

  #swipeDiv .handle {
    width: 51px;
    height: 24px;
    margin-top: -12px;
    margin-left: -20px;
    top: 50%;
    left: 0;
    position: absolute;
    z-index: 30;
    font-family: "SimHei";
    speak: none;
    font-size: 12px;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    text-indent: 0;
    line-height: 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: black;
    color: rgb(255, 255, 255);
    opacity: 0.6;
  }

  *,
  *:before,
  *:after {
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  .handle:before {
    margin: 0 18px 0 5px;
    content: "\0399\0399\0399";
    width: 20px;
    height: 24px;
    line-height: 2;
  }
  .tool-wrapper {
    position: absolute;
    right: 30px;
    top: 19px;
    width: 400px;
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
      width: 33%;
      flex: 1;
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