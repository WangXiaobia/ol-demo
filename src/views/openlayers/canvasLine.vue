<template>
  <div id="map"></div>
</template>
    
  <script>
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { Point, LineString, Polygon } from "ol/geom";
import ImageLayer from "ol/layer/Image";
import ImageCanvasSource from "ol/source/ImageCanvas";
import XYZ from "ol/source/XYZ";
import Feature from "ol/Feature";
import mapConfig from "../../config/mapConfig";
import { defaults as defaultControls } from "ol/control";
import {
  create as createTransform,
  multiply as multiplyTransform,
  compose as composeTransform,
  makeInverse,
} from "ol/transform";
import CanvasImmediateRenderer from "ol/render/canvas/Immediate";
import { getSquaredTolerance } from "ol/renderer/vector";
import { getUserProjection, getTransformFromProjections } from "ol/proj";
import { Style, Fill, Stroke, Circle as CircleStyle, Icon } from "ol/style";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { DEVICE_PIXEL_RATIO } from "ol/has";
export default {
  components: {},
  data() {
    return {
      map: null,
      tianditu_layers: null, // 3种类型的天地图
    };
  },
  methods: {
    /**
     * @name: 初始化地图
     */
    initMap() {
      const view = new View({
        projection: "EPSG:4326",
        center: [104, 30],
        zoom: 1,
      });
      // 行政图
      var tianditu_vec = new TileLayer({
        source: new XYZ({
          url: mapConfig.tianditu_vecUrl,
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
    createLine() {
      var lineStyle = new Style({
        stroke: new Stroke({
          color: [255, 0, 0, 1],
          width: 1,
        }),
      });
      let getStackedStyle = new Style({
        renderer(coordinates, state) {
          console.log(coordinates[0],'0坐标')
          const pointsX = coordinates[0].map((obj) => obj[0]);//筛选coordinates[0]数组的每个数组的第一个坐标为数组
          const pointsY = coordinates[0].map((obj) => obj[1]);//筛选coordinates[0]数组的每个数组的第二个坐标为数组
          console.log(pointsX,'X坐标')
          console.log(pointsY,'Y坐标')
          const startPoint = [Math.min(...pointsX), Math.min(...pointsY)];//横纵坐标的最小值，左上角
          const endPoint = [Math.max(...pointsX), Math.max(...pointsY)];//横纵坐标的最大值，右下角
          const ctx = state.context;
          const grad = ctx.createLinearGradient(
            startPoint[0],
            startPoint[1],
            startPoint[0],
            endPoint[1]
          );
          grad.addColorStop(0, "#00FFFF");
          grad.addColorStop(0.3, "#66FFFF");
          grad.addColorStop(0.5, "#CCFFFF");
          grad.addColorStop(0.7, "#66FFFF");
          grad.addColorStop(1, "#00FFFF");
          ctx.beginPath();
          ctx.fillStyle = grad;
          ctx.moveTo(coordinates[0][0][0], coordinates[0][0][1]);
          for (let i = 0; i < coordinates[0].length; i++) {
            ctx.lineTo(coordinates[0][i][0], coordinates[0][i][1]);
          }
          ctx.fill();
        },
      });
      // var canvas2 = document.createElement("canvas");
      // var context = canvas2.getContext("2d");
      // var pixelRatio = DEVICE_PIXEL_RATIO;
      // var gradient = (function () {
      //   var grad = context.createLinearGradient(0, 0, 512 * pixelRatio, 0);
      //   grad.addColorStop(0, "rgba(89, 175, 249, 0)");
      //   grad.addColorStop(1 / 10, "rgba(89, 175, 249, 0.1)");
      //   grad.addColorStop(2 / 10, "rgba(89, 175, 249, 0.2)");
      //   grad.addColorStop(3 / 10, "rgba(89, 175, 249, 0.3)");
      //   grad.addColorStop(4 / 10, "rgba(89, 175, 249, 0.4)");
      //   grad.addColorStop(5 / 10, "rgba(89, 175, 249, 0.5)");
      //   grad.addColorStop(6 / 10, "rgba(89, 175, 249, 0.6)");
      //   grad.addColorStop(7 / 10, "rgba(89, 175, 249, 0.7)");
      //   grad.addColorStop(8 / 10, "rgba(89, 175, 249, 0.8)");
      //   grad.addColorStop(9 / 10, "rgba(89, 175, 249, 0.9)");
      //   grad.addColorStop(10 / 10, "rgba(89, 175, 249, 1)");
      //   return grad;
      // })();
      // var fill = new Fill();
      // fill.setColor(gradient);
      // let getStackedStyle = new Style({
      //   fill: fill,
      //   stroke: new Stroke({
      //     color: "#333",
      //     width: 1,
      //   }),
      // });

      var pointStyle = new Style({
        image: new CircleStyle({
          radius: 1,
          fill: new Fill({
            color: "rgba(89, 175, 249, 1)",
          }),
        }),
        // image: new Icon({
        //   src: require("@/assets/olImg/province_2.png"),
        //   anchor: [0.5, 0.5], //设置偏移
        //   scale: 1,
        // }), //
      });
      var randomFeatures = [];
      for (var i = 0; i < 10; i++) {
        var anchor = new Feature({
          geometry: new Polygon([[   //两个括号
            [Math.random() * 180, Math.random() * 160 - 80],
            [Math.random() * 180, Math.random() * 160 - 80],
            [Math.random() * 180, Math.random() * 160 - 80],
            [Math.random() * 180, Math.random() * 160 - 80],
            [Math.random() * 180, Math.random() * 160 - 80],
            [Math.random() * 180, Math.random() * 160 - 80],
          ]]),
          // geometry: new LineString([  //一个括号
          //   [Math.random() * 180, Math.random() * 160 - 80],
          //   [Math.random() * 180, Math.random() * 160 - 80],
          //   [Math.random() * 180, Math.random() * 160 - 80],
          // ]),
        });
        randomFeatures.push(anchor);
      }

      // var randomFeatures2 = [];
      // for (var i = 0; i < 100000; i++) {
      //   var anchor = new Feature({
      //     geometry: new Point([Math.random() * 180, Math.random() * 160 - 80]),
      //   });
      //   randomFeatures2.push(anchor);
      // }
      // var canvas = document.createElement("canvas");
      // var canvasLayer = new ImageLayer({
      //   source: new ImageCanvasSource({
      //     canvasFunction: (
      //       extent,
      //       resolution,
      //       pixelRatio,
      //       size,
      //       projection
      //     ) => {
      //       var vc = this.getCanvasVectorContext(
      //         canvas,
      //         extent,
      //         resolution,
      //         pixelRatio,
      //         size,
      //         projection
      //       );
      //       randomFeatures.forEach((item) => {
      //         vc.drawFeature(item, getStackedStyle);
      //       });
      //       return canvas;
      //     },
      //     projection: "EPSG:4326",
      //   }),
      // });
      var canvasLayer = new VectorLayer({
        source: new VectorSource(),
        style: getStackedStyle,
      });
      canvasLayer.getSource().addFeatures(randomFeatures);
      this.map.addLayer(canvasLayer);
    },
    getCanvasVectorContext(
      canvas,
      extent,
      resolution,
      pixelRatio,
      size,
      projection
    ) {
      canvas.width = size[0] * pixelRatio;
      canvas.height = size[1] * pixelRatio;
      let width = Math.round(size[0] * pixelRatio);
      let height = Math.round(size[1] * pixelRatio);
      let context = canvas.getContext("2d");

      let coordinateToPixelTransform = createTransform();
      let pixelTransform = createTransform();
      let inversePixelTransform = createTransform();

      let rotation = this.map.getView().getRotation();
      let center = this.map.getView().getCenter();
      composeTransform(
        coordinateToPixelTransform,
        size[0] / 2,
        size[1] / 2,
        1 / resolution,
        -1 / resolution,
        -rotation,
        -center[0],
        -center[1]
      );
      composeTransform(
        pixelTransform,
        size[0] / 2,
        size[1] / 2,
        1 / pixelRatio,
        1 / pixelRatio,
        rotation,
        -width / 2,
        -height / 2
      );
      makeInverse(inversePixelTransform, pixelTransform);
      const transform = multiplyTransform(
        inversePixelTransform.slice(),
        coordinateToPixelTransform
      );
      const squaredTolerance = getSquaredTolerance(resolution, pixelRatio);
      let userTransform;
      const userProjection = getUserProjection();
      if (userProjection) {
        userTransform = getTransformFromProjections(userProjection, projection);
      }
      return new CanvasImmediateRenderer(
        context,
        pixelRatio,
        extent,
        transform,
        rotation,
        squaredTolerance,
        userTransform
      );
    },
  },
  mounted() {
    let vm = this;
    setTimeout(function () {
      let that = vm;
      that.initMap();
      that.createLine();
      // layer.once("prerender", (evt) => {
      //   console.log("渲染前执行结果:");
      //   console.log(layer.getSource().getFeatures());
      // });
      //实现一次性顺序加载的效果，绑定prerender事件
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
    