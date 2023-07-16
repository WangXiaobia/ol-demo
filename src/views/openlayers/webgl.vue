<template>
  <div id="map"></div>
</template>
    
  <script>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { defaults as defaultControls } from "ol/control";
import mapConfig from "../../config/mapConfig";
import dynamic from "../openlayers/js/dynamicLine";
import flowLayer from "../openlayers/js/flowLayer";
import VectorSource from "ol/source/Vector.js";
import WebGLPointsLayer from "ol/layer/WebGLPoints.js";
import GeoJSON from "ol/format/GeoJSON.js";
import VectorLayer from "ol/layer/Vector";
import json from "@/assets/json/features.json";
import Feature from "ol/Feature";
import { Point } from "ol/geom";
import RegularShape from "ol/style/RegularShape.js";
import { Style, Fill, Stroke, Circle as CircleStyle, Icon } from "ol/style";
import ImageStyle from "ol/style/Image.js";
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
    creatWebGl() {
      var randomFeatures2 = [];
      for (var i = 0; i < 100000; i++) {
        var anchor = new Feature({
          geometry: new Point([Math.random() * 180, Math.random() * 160 - 80]),
        });
        randomFeatures2.push(anchor);
      }
      this.vectorSource = new VectorSource({
        // url: "http://150.158.34.72:8080/geoserver/FX4326/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=FX4326%3AYSPOINT&maxFeatures=50000&outputFormat=application%2Fjson",
        projection: "EPSG:4326",
      });
      // let src1 = require("@/assets/olImg/province_1.png"),
      let src2 = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAkCAYAAACe0YppAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAfESURBVHgBrVdNbFxXFT73vjf+GRx7ElLbKjGZCCrUn9CJUlEhFGoKiwAqaSQWoC5qrxBSpY6FKhWx8FhsYIHaSkioQmpcFhUVC4IEigqLxKUSqURqq1EiSuvGTR3/JLEzyXicmfdzD985983EUWg6ifqk63vnvXfPd75zvnPus6EOL75ybpRC+zCRGSVDpRtPTJWYFojcHCVuxmzfc6ITe+a2YOdmC9RnyxSEh1x9tRR//CbRpVNE62fJ6k4mzg0Q9+0ic88jFO46QLZv+Bw5N2V2PvTqXQHz8nEw6znSuHi2WD/zR3IX50DYkSUMw9jIHpiN3KGU/bCDJeopPk6f2zO6QHEybkYOnOgYmM8dq0SN6uTq269QsvYfCk1KgSXMjoxxytYD+79OwQ2ADSWpUQfyuw/Q9gd/QF09/VNmz/crnwrM779e2ayuTi7861Xi6+tgye0RgKm1Hk4hDf4yAxj7hLEDMMBljjFsfgfv/vrTJj9wz5S578eVTwTm0y9XNq6tT5558zUKXINyAYEpQAEYYG3BNiDF8xuNAJIPN+ZUhwVrgs4I4JY46KYHvvkU9W3bPmX2/qRyCzDP/mZsc7N+5J1//pXSZo1yyhLhDRhrOBAIJzIIOZss1CzEjWGHOHtgzzaBB0nmQAQH2HbTo48fpny+61tm389PCJ5t042vTc6ePM7XanWKkKcI3kYcUJwG3HQB7oW4F1LTyZwzzRTD5agp9zlkHWkgLFn2RansF3DLm9djmj0JvLjxCs+WC21gfqtc/vCD/xYvrFw2MV70I5AZQIFRwDTM5gCgMAxnYgFzodFnAsripF/L82ZiqZFag3zz0sol/nD+vSJt0rM3GEe1Z//97vtQP3ETLwpY09m2gdhlhpS5rMHKASQRp7J7GC0H/D1LQkCip/Zg9735RfyolQUy5GM/HL2wtFpcrzWpO4BIpFZSSSAigd+hsZo/qJoNsiuPrWY5Kyd2Ws6pCYxLHSPPRnPsRGAMxxiEZBCdX75Ki0srBT725GhIce3QB+erEAVSIFJJmJuYRCg52E+wKRdobZoA0NI88BiSEjGLAwExjGsdw+sUikvhOIRlFDyRNavgYhidX1yjXX39h0JKrpaW16/jBWkD1mRqQ/1osYC11ZIBH7agi6HVS60qFh8A4JywZa9uBXVt1gBlrI2QW1nbBEMG40attHQlRR1apQFriCgMKbqGkh3QIHIjVrVrGS1libSRBiIxAK4wB7gAYHYabiOEYjgSC2us12qpwY1CGMdxYaNhOBc6jWCrspUTrIIm8g42CIWwtVuax9b34KgAwgFpoR5c6jjVZiKhdhCco3pNHEiLYTPxnqEdk++4QsKaMPAGQpiUfAcOjUPA9YDAu9bccE42eUASpjJkr4AhzCbLb3vdhNDCKOUqtFNAOEgDDIshZm2DonJHekA4aVtua7tkddFlURd8AZOQY4+GOkYE0jao01nabhRTNYwTt9CbM6Xqps1Ch5w6AYUDwsBI6zQItXZHybE2SqtRlju+nBSUhbUAsyo6BbqwjGWWqsGfe/vxO+GFsJHQ3PA2Ll2swU2Spi5E1AE97oAvoTOB9YqSPLc6j1MfPKiKjD1TFRgYplrPWYjhEYBNoZe4kdJcCNozI9t57NR5AUuFrQFbzWsowMboUSh4gbC1mQJV+yp9fyaLqllBdS2lk2qoha0HR6h5cBsJ46Nh3bqjg330AmwWogTmAIpgQ0xGndDaNVLOJrv8Way9g/x5rJAZoDxpCUxHxlZElc+xGSnQlY2rNGP3TSxU45hevH/IaVuLEqe5kLA0oY4IbsJDE0H9EepDnsNBauBZM85+x3iOkwBClT2k92Vv4ksIa32vtEtb51/2TS1UvaJieun+YVPtDtQIeRAPLqDNxBtrRsxRZljv69r557JHAOBotl+c4Tj2rbI3x1T8PFUbUWNKIOWDgl6eqTbGHxtoDvXzwbPLqlPKFMq+GWgYs/VNYdT8pVnZ6FraZdYis7xqn35iL1GXcc9/45dLb9zy6fP3578wfXbZPH3q40xMwU359Y3DtEbWQLL8cmbL+ebhm4gXFT1SJHpoiKe/86sL4y2scCtwrjtXvm8weRhelmYXWT9jfJtUMYuStaMLmm8iXmHMmbj82ZFFRMqReP8XyXx5J83VGvWJrVi3fGX+uVwskE2OrG24J9+aFxEZfzCgxNugxrTbtWKK1jPaWQPh3i4yjxaJhvrpKLnN8cMvVqu3BW5drz8zPLkR28qZJaaP1n3opT9njeumndqytZRkJhoeYP7abuQ0cBM/+u3qS//P/m3/hTlSHi7aBh2fv0zF00vGM/WJ3YpJ2aeBfpl+ZYjpSztpIUyDw0/9/sLcJ9m+LbCCjxULLtd4oR7x2NsfWboe3fqOoKNceP8ImUK3m7ZpNDE+fXNo7xi4df1ubHCyHlPlncUAec9OwyzXPajR/SOO8qGt/HR6ZaoTewF1eP1trj7z3VLf1R359OBa3ehnjQS4F0fY3ntT6rZUfuYPF3/dqb2OgeV64936yYNfzdNAD49eqgcK/OBwLP9pVH722uWOQe8YWK5/nN6c+fYDvXuAWcrnHG3rSqd/8ae1iTu1Y+kuLnwzlQs9cXVHPlnAsddRTj+z67nvFUrPPVF4jO7y+h+XDLxE6v5TfQAAAABJRU5ErkJggg==`;
      let src3 = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJKSURBVHgBvVZRbtNAEH2zjRDlKzeo+wkSyJwg4QhVJQTig3CC5AZxblBOQPuFiFT1CHFPUCM++MS9Qb6oBO0OM+O15TakSZNVnxTvbrw7b553dmYJK8Bf0740fRD3pE3CDyDMwShkRoEbd0IfiuI+O3QvAfHYSNZDDqYJvS/ytYj4S9rFLjLpDdF4zsfY4RzuuqDDn5c27/T5Hm46CbwbBGeSYOEIV25Cn4r5UiJRkYiKM+mmRqCLfrvPdxf9D/zt1VgUZWFYSP9A1JULRJUSnhkJUMrEN+2J6yA4OgvqClyJjeCka2bZ59qcxLzWNbLWbKitXT++pShs/Kxyi/Y3IWnDlDm+kKjsBqfzSlEVXdpm25KYGbMh+9uyTTxNU3hhF7n07vs+IoHPZM//8K9alQP7j+FdjoigAw0CORYK53tCRGkYHCM63Lk1TH0n4VAR7XRKxIZHnZYSZ99QQIcXl4iMVmAlDo8EJSq1w6ev9xAZdp6sg3lDhL/XKeIjsSehkGCQrFyN+ogN4nB0WIh8E4IDS6xx0benFEYXClUu8rp45oeIBNmfDNWny7X6VlEnldFaT6NmA7cjSZr86XxmjT5MFUkSVFWSxbcha9UkHR3R2x/nDZHhiZtodEDlbki2WPjcpH63WMqdlHIOaam6bGRYRaBB9BQjWTsMmWZ5KW8WWXr3Wv9H4S+drDecE+3Xi80pdUgyM4gGdSpb63Jyi3D6siehn+Eh1y3Z+HpP7oJWrebpCymMHTl4lFqmbzw3paUdePktI6jxD901FBqS79DyAAAAAElFTkSuQmCC`;
      // let src1 = require("@/assets/olImg/province_1.png");
      // let src2 = require("@/assets/olImg/province_2.png");
      // let src3 = require("@/assets/olImg/province_6.png");
      // let _this = this;
      let srcFive = new RegularShape({
        fill: new Fill({ color: "red" }),
        stroke: new Stroke({ color: "black", width: 1 }),
        points: 5,
        radius: 10,
        radius2: 4,
        angle: 0,
      })
        .getImage(10)
        .toDataURL(); //五角星
      let srcFive2 = new RegularShape({
        fill: new Fill({ color: "blue" }),
        stroke: new Stroke({ color: "black", width: 1 }),
        points: 5,
        radius: 10,
        radius2: 4,
        angle: 0,
      })
        .getImage(10)
        .toDataURL(); //五角星
      let srcFive3 = new RegularShape({
        fill: new Fill({ color: "green" }),
        stroke: new Stroke({ color: "black", width: 1 }),
        points: 5,
        radius: 10,
        radius2: 4,
        angle: 0,
      })
        .getImage(10)
        .toDataURL(); //五角星
      const layer = new WebGLPointsLayer({
        source: this.vectorSource,
        style: {
          symbol: {
            symbolType: "image",
            src: srcFive3,
            // src: [
            //   "case",
            //   ["==", ["get", "characteristics"], "雨水井"],
            //   srcFive,
            //   ["==", ["get", "characteristics"], "雨水篦"],
            //   srcFive2,
            //   srcFive3,
            // ],
            size: [10, 9],
            // color:"#ffdc00",
            rotateWithView: false, //是否随视图旋转
            offset: [0, 0],
          },
        },
        // style: {
        //   symbol: {
        //     symbolType: "circle",
        //     // src: [
        //     //   "case",
        //     //   ["==", ["get", "characteristics"], "雨水井"],
        //     //   src2,
        //     //   ["==", ["get", "characteristics"], "雨水篦"],
        //     //   src3,
        //     //   src1,
        //     // ],
        //     // color:['match', ['get', 'characteristics'], '雨水井', "red", "green"],
        //     size: [9, 9],
        //     color: [
        //       "case",
        //       ["==", ["get", "characteristics"], "雨水井"],
        //       "#ff3f3f",
        //       ["==", ["get", "characteristics"], "雨水篦"],
        //       "#ffdc00",
        //       "#006688",
        //     ],
        //     rotateWithView: false, //是否随视图旋转
        //     offset: [0, 0],
        //   },
        // },
      });
      layer.getSource().addFeatures(randomFeatures2);
      this.map.addLayer(layer);
    },
  },
  mounted() {
    let vm = this;
    setTimeout(function () {
      let that = vm;
      that.initMap();
      that.creatWebGl();
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
    