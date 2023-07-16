<template>
  <div>
    <div id="map"></div>
  </div>
</template>
  
<script>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { defaults as defaultControls } from "ol/control";
export default {
  components: {},
  data() {
    return {
      map: null,
    };
  },
  methods: {
    initLayer() {
      const view = new View({
        projection: "EPSG:4326",
        center: [125.9, 30.2],
        zoom: 5,
      });
      let tileLayer = new TileLayer({
        source: new XYZ({
          url: "http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=c6ea8a2d7a9794e4075bb6105b997762",
          layer: "img",
          style: "default",
          matrixSet: "c",
          format: "tiles",
          wrapX: false,
          tileLoadFunction: function (imageTile, src) {
            const img = new Image();
            img.crossOrigin = "";
            img.onload = function () {
              const canvas = document.createElement("canvas");
              const w = img.width;
              const h = img.height;
              canvas.width = w;
              canvas.height = h;
              const context = canvas.getContext("2d");
              context.drawImage(img, 0, 0, w, h, 0, 0, w, h);
              const imageData = context.getImageData(0, 0, w, h);
              for (var i = 0; i < imageData.height; i++) {
                for (var j = 0; j < imageData.width; j++) {
                  var x = i * 4 * imageData.width + j * 4;
                  imageData.data[x] =
                    imageData.data[x + 1] =
                    imageData.data[x + 2] =
                      imageData.data[x] * 0.3 +
                      imageData.data[x + 1] * 0.59 +
                      imageData.data[x + 2] * 0.11;
                      //基于灰色，设置为蓝色，这几个数值是我自己试出来的，可以根据需求调整 绿色（165.255.255）
                  imageData.data[x] = 55 - imageData.data[x];
                  imageData.data[x + 1] = 255 - imageData.data[x + 1];
                  imageData.data[x + 2] = 305 - imageData.data[x + 2];
                }
              }
              context.putImageData(imageData, 0, 0);
              imageTile.getImage().src = canvas.toDataURL("image/png");
            };
            img.src = src;
          },
        }),
      });
       // 文字注记
       var tianditu_cva = new TileLayer({
        source: new XYZ({
          url: "http://t3.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=c6ea8a2d7a9794e4075bb6105b997762",
        }),
        visible: true,
      });
      this.map = new Map({
        layers: [tileLayer,tianditu_cva],
        target: "map",
        view: view,
        controls: defaultControls({
          zoom: false,
          rotate: false,
          attribution: false,
        }),
      });
    },
  },
  mounted() {
    let vm = this;
    setTimeout(function () {
      let that = vm;
      that.initLayer();
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
  