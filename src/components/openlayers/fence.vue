<template>
  <a-modal
    :width="1300"
    :bodyStyle="{ height: '800px' }"
    :dialog-style="{ left: '120px', top: '140px' }"
    title="新增地理围栏"
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
        <a-card class="tool-window">
          <a-form label-width="80px">
            <a-form-item label="围栏名称" class="tool-item">
              <a-input
                size="small"
                v-model="name"
                placeholder="请输入围栏名称"
              ></a-input>
            </a-form-item>
            <a-form-item label="围栏样式" class="tool-item">
              <a-radio-group v-model="tool" size="small" @change="setType()">
                <a-radio-button class="radio" value="Circle"
                  >圆形</a-radio-button
                >
                <a-radio-button class="radio" value="Polygon"
                  >多边形</a-radio-button
                >
              </a-radio-group>
            </a-form-item>
            <a-form-item class="tool-item">
              <a-button
                class="button"
                type="warning"
                size="small"
                @click="handleClear"
                >清除</a-button
              >
              <a-button
                class="button"
                type="primary"
                size="small"
                @click="handleSave"
                >保存</a-button
              >
              <a-button class="button" size="small" @click="handleClose"
                >取消</a-button
              >
            </a-form-item>
          </a-form>
        </a-card>
      </div>
    </div>
  </a-modal>
</template>
  <script>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import MousePosition from "ol/control/MousePosition";
import { createStringXY } from "ol/coordinate";
import Draw from "ol/interaction/Draw";
import * as olProj from "ol/proj";
import { mapActions } from "vuex";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
export default {
  props: ["editVisible"],
  data() {
    return {
      fenceMap: null,
      baseLayer: null,
      detailVisible: false,
      mousePositionControl: null,
      name: "",
      drawLayer: null,
      fenceDraw: null,
      tool: "Circle",
      circleInfo: null,
      polygonPath: [],
    };
  },
  watch: {
    editVisible(val) {
      if (val) {
        this.getDetail();
      }
    },
  },
  components: {},
  methods: {
    ...mapActions(["addFences"]),
    handleCancel() {
      this.detailVisible = false;
      this.$emit("update");
    },
    initMap() {
      this.baseLayer = new TileLayer({
        source: new XYZ({
          url: "http://t4.tianditu.com/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=5e6b50c26b65e5cc974c9765758f753b",
        }),
        visible: true,
      });
      this.fenceSource = new VectorSource({ wrapX: false });
      // 创建绘制图层
      this.drawLayer = new VectorLayer({
        source: new VectorSource({}),
        style: new Style({
          fill: new Fill({
            color: "rgba(89, 175, 249, 0.7)",
          }),
          stroke: new Stroke({
            color: "rgba(89, 175, 249, 0.1)",
            width: 2,
          }),
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({
              color: "rgba(89, 175, 249, 0.7)",
            }),
          }),
        }),
      });
      this.fenceMap = new Map({
        layers: [this.baseLayer],
        target: "fence-map",
        view: new View({
          projection: "EPSG:4326",
          center: [103.916, 30.0665],
          zoom: 13.8,
        }),
      });
      this.fenceMap.addLayer(this.drawLayer);
    },
    mouseMove() {
      this.mousePositionControl = new MousePosition({
        coordinateFormat: createStringXY(4), //获取位置4位小数
        projection: "EPSG:4326",
        className: "custom-mouse-position",
        target: document.getElementById("mouse-position2"), //将位置数据放到那里
        undefinedHTML: "&nbsp",
      });
      this.fenceMap.addControl(this.mousePositionControl);
    },
    // 设置类型
    setType() {
      this.drawLayer.getSource().clear();
      this.fenceMap.removeInteraction(this.fenceDraw);
      this.addInteraction();
    },
    addInteraction() {
      this.fenceDraw = new Draw({
        source: this.drawLayer.getSource(),
        type: this.tool,
      });
      this.fenceMap.addInteraction(this.fenceDraw);
      this.fenceDraw.on("drawend", (e) => {
        // 绘制完成的回调
        this.drawEnd(e);
      });
      this.mapOnly();
    },
    // 绘制完成解析结构
    drawEnd(evt) {
      let geo = evt.feature.getGeometry();
      let type = geo.getType(); //获取类型
      const handle = {
        Circle: () => {
          //获取中心点和半径
          let center = geo.getCenter();
          let radius = geo.getRadius();
          this.circleInfo = {
            center: center,
            radius: radius,
          };
        },
        Polygon: () => {
          //获取坐标点
          let points = geo.getCoordinates();
          this.polygonPath = points[0];
        },
      };
      if (handle[type]) handle[type]();
    },
    // 检测是否重复绘制
    mapOnly() {
      this.fenceDraw.on("drawstart", () => {
        if (this.tool === "Polygon") {
          // 如果已经存在则删除上一个几何
          if (this.polygonPath)
            this.fenceSource.clear() && (this.polygonPath = []);
        } else {
          if (this.circleInfo)
            this.fenceSource.clear() && (this.circleInfo = null);
        }
      });
    },
    handleSave() {
      // 保存
      if (!this.name) {
        this.$message.error("请输入围栏名称");
        return;
      } else {
        const area = this.formatFenceData();
        if (area) {
          let data = {
            name: this.name,
            area: area,
          };
          // 可调用后端api进行保存，现在直接就存本地vuex中了
          this.addFences(data);
          this.$message.success("围栏保存成功");
        }
      }
    },
    handleClose() {
      this.detailVisible = false;
      this.$emit("update");
      this.name = '';
      this.tool='Circle'
    },
    // 数据处理
    formatFenceData() {
      const handle = {
        Circle: () => {
          if (!this.circleInfo) {
            this.$message.error(this.$t("lan_map.lan_map_fences.pdrwf"));
            return;
          }
          const center = this.circleInfo.center;
          const radius = this.circleInfo.radius;
          const p = olProj.toLonLat(center);
          return `Circle (${p[0]} ${p[1]}, ${radius})`;
        },
        Polygon: () => {
          if (this.polygonPath.length === 0) {
            this.$message.error(this.$t("lan_map.lan_map_fences.pdrwf"));
            return;
          }
          const path = this.polygonPath;
          const pathArr = [];
          path.forEach((item) => {
            const p = olProj.toLonLat(item);
            pathArr.push(`${p[0]} ${p[1]}`);
          });
          return `Polygon (${pathArr.join(", ")})`;
        },
      };
      const type = this.tool;
      if (handle[type]) {
        return handle[type]();
      }
    },
    handleClear() {
      this.drawLayer.getSource().clear();
    },
    getDetail() {
      this.detailVisible = true;
      let vm = this;
      setTimeout(function () {
        let that = vm;
        that.initMap();
        that.mouseMove();
        that.addInteraction();
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
    z-index: 999;
    box-shadow: inset 5em 1em #000000;
    .tool-window {
      width: 220px;
      position: absolute;
      bottom: 2px;
      right: 2px;
      padding: 8px;
      .radio {
        margin-right: 10px;
      }
      .button {
        font-size: 14px;
        margin-right: 10px;
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