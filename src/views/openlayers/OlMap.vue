<template>
  <div class="map-box">
    <div id="map" ref="rootmap"></div>
  </div>
</template>

<script>
import "ol/ol.css";
import TileLayer from "ol/layer/Tile";
import { Map, View } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Stroke, Fill, Circle } from "ol/style";
import XYZ from "ol/source/XYZ";
import GeoJSON from "ol/format/GeoJSON";
import WKT from "ol/format/WKT";
import * as turf from "@turf/turf";
export default {
  props: {
    turfType: {
      type: String,
      default: "",
    },
  },
  watch: {
    turfType(newV, oldV) {
      if (newV) {
        if (newV == "restore") {
          this.restore();
        } else {
          this.getTurf();
        }
      }
    },
  },
  methods: {
    initVectorLayer() {
      let defaultStyle = new Style({
        //边框样式
        stroke: new Stroke({
          color: "white",
          width: 2,
        }),
        //填充样式
        fill: new Fill({
          color: "rgba(255, 255, 255, 0.7)",
        }),
        image: new Circle({
          radius: 5,
          fill: new Fill({
            color: "white",
          }),
        }),
      });
      //实例化一个矢量图层Vector作为绘制层
      let source = new VectorSource({});
      //创建一个图层
      let customVectorLayer = new VectorLayer({
        source: source,
        zIndex: 2,
        //设置样式
        style: defaultStyle,
      });
      //将绘制层添加到地图容器中
      this.map.addLayer(customVectorLayer);

      return customVectorLayer;
    },
    getFeatureByWKT(wkt, sourceCode, targetCode) {
      try {
        let view = this.map.getView();
        if (!wkt) {
          return null;
        }
        let format = new WKT();

        let feature;

        feature = format.readFeature(wkt, {
          featureProjection: targetCode || view.getProjection(),
          dataProjection: sourceCode || view.getProjection(),
        });

        return feature;
      } catch (e) {
        console.log(e);
        return null;
      }
    },
    getGeoJsonByFeature(feature, sourceCode, targetCode) {
      if (!feature) {
        return null;
      }

      let view = this.map.getView();

      let geojson;

      if (feature instanceof Array) {
        geojson = new GeoJSON().writeFeatures(feature, {
          dataProjection: sourceCode || view.getProjection(), // 设定JSON数据使用的坐标系
          featureProjection: targetCode || view.getProjection(), // 设定当前地图使用的feature的坐标系
        });
      } else {
        geojson = new GeoJSON().writeFeature(feature, {
          dataProjection: sourceCode || view.getProjection(), // 设定JSON数据使用的坐标系
          featureProjection: targetCode || view.getProjection(), // 设定当前地图使用的feature的坐标系
        });
      }
      return geojson;
    },
    getFeatureByGeoJson(geojson, sourceCode, targetCode) {
      let view = this.map.getView();
      if (!geojson) {
        return null;
      }
      let feature;
      if (typeof geojson == "string") {
        // 替换 null 字符
        while (geojson.indexOf("null") != -1) {
          // geojson = geojson
          geojson = geojson.replace("null", "");
        }
      }
      feature = new GeoJSON().readFeature(geojson, {
        dataProjection: sourceCode || view.getProjection(), // 设定JSON数据使用的坐标系
        featureProjection: targetCode || view.getProjection(), // 设定当前地图使用的feature的坐标系
      });
      return feature;
    },
    getFeatures() {
      this.layer = this.initVectorLayer();
      this.features.push(
        this.getFeatureByWKT(
          "POLYGON((112.80630306271966 46.27140545436643,116.23403743771966 44.33781170436643,117.81606868771966 40.29484295436643,117.90395931271966 38.36124920436643,117.81606868771966 35.02140545436643,116.14614681271966 32.38468670436643,113.50942806271966 33.26359295436643,111.75161556271966 34.58195232936643,110.60903743771966 35.46085857936643,113.28970150021968 36.03214764186642,111.35610775021968 36.33976482936642,110.91665462521968 36.91105389186642,111.22427181271968 37.52628826686642,112.10317806271968 37.30656170436642,112.41079525021968 37.78996014186642,112.32290462521968 38.36124920436642,111.44399837521968 38.66886639186642,110.52114681271968 39.10831951686642,110.38931087521968 39.81144451686642,111.09243587521968 40.07511639186642,112.19106868771968 40.38273357936642,112.49868587521968 41.04191326686642,111.88345150021968 41.21769451686642,111.26821712521968 40.86613201686642,110.43325618771968 40.91007732936642,110.65298275021968 41.39347576686642,110.47720150021968 42.66788982936642,111.79556087521968 42.75578045436642,110.38931087521968 43.19523357936642,110.56509212521968 44.24992107936642,111.44399837521968 43.76652264186642,111.79556087521968 44.16203045436642,111.09243587521968 44.60148357936642,111.22427181271968 45.30460857936642,112.10317806271968 44.95304607936642,112.67446712521968 45.26066326686642,111.75161556271968 45.78800701686642,111.88345150021968 46.40324139186642,112.14712337521968 47.94132732936642,112.45474056271968 47.15031170436642,113.99282650021968 47.28214764186642,113.28970150021968 46.79874920436642,114.95962337521968 46.71085857936642,112.80630306271966 46.27140545436643))"
        )
      );
      this.features.push(
        this.getFeatureByWKT(
          "POLYGON((124.1455078125 44.03320312500001,114.6533203125 37.26562500000001,129.990234375 28.212890625,136.8896484375 42.01171875,133.1982421875 45.5712890625,124.1455078125 44.03320312500001))"
        )
      );
      this.features.push(
        this.getFeatureByWKT(
          "POLYGON((125.48696587513709 40.418890353749546,124.32241509388709 39.715765353749546,125.17934868763709 39.188421603749546,124.73989556263709 38.023870822499546,125.81655571888709 37.694280978749546,126.58559868763709 37.079046603749546,125.92641900013709 36.639593478749546,126.43179009388709 35.694769259999546,125.55288384388709 34.486273166249546,127.33266900013709 33.871038791249546,129.3761260313871 34.793890353749546,129.8814971251371 36.046331759999546,129.3321807188871 37.914007541249546,128.2335479063871 39.254339572499546,127.61831353138709 40.155218478749546,128.0357940001371 40.968206759999546,126.62954400013709 40.968206759999546,125.94839165638709 41.034124728749546,125.48696587513709 40.418890353749546))"
        )
      );

      this.layer.getSource().addFeatures(this.features);

      this.map.getView().fit(this.layer.getSource().getExtent(), {
        duration: 1, //动画的持续时间,
        callback: null,
      });
    },
    // 渐变色
    // 基础线样式参考默认样式即可
    lineStyle() {
      //渐变色线
      let styleLine = [];
      let steps = 10;
      // 渐变色原理，其实就是多个样式共同使用
      for (let i = 0; i < steps; i++) {
        styleLine.push(
          new Style({
            stroke: new Stroke({
              color: [0, 255, 255, 1 / (steps - i)],
              width: (steps - i) * 2 - 1,
            }),
            //填充样式
            fill: new Fill({
              color: "rgba(0, 0, 255, 0.05)",
            }),
          })
        );
      }
      return styleLine;
    },
    restore() {
      if (this.tempFeatures.length !== 0) {
        for (let i = 0; i < this.tempFeatures.length; i++) {
          this.layer.getSource().removeFeature(this.tempFeatures[i]);
        }
        this.tempFeatures = [];
      }
    },
    getTurf() {
      this.restore();
      // 注意，turf 需要传入 geojson 格式对象
      let geoObj1 = JSON.parse(this.getGeoJsonByFeature(this.features[0]));
      let geoObj2 = JSON.parse(this.getGeoJsonByFeature(this.features[1]));
      let geoObj3 = JSON.parse(this.getGeoJsonByFeature(this.features[2]));
      // geojson 对象
      let unionObj;
      switch (this.turfType) {
        // 联合，两个多边形联合成为一个多边形
        case "union":
          unionObj = turf.union(geoObj1, geoObj2);
          alert("两个多边形联合成为一个多边形！");
          break;
        // 交叉，多边形A跟多边形B重合的部分
        case "intersect":
          unionObj = turf.intersect(geoObj1, geoObj2);
          alert("多边形A跟多边形B重合的部分！");
          break;
        // 差异，多边形A去除与多边形B重合的部分
        case "difference":
          unionObj = turf.difference(geoObj1, geoObj2);
          alert("多边形A去除与多边形B重合的部分！");
          break;
        // 挖洞，多边形挖去多边形C部分
        case "hole":
          unionObj = turf.difference(geoObj2, geoObj3);
          alert("多边形B挖去多边形C部分！");
          break;
        // 抽稀，多边形A简化
        case "simplify":
          let options = { tolerance: 100, highQuality: true, mutate: false };
          unionObj = turf.simplify(geoObj1, options);
          alert("多边形A简化！");
          break;
        // 缓冲，多边形A的周边范围
        case "buffer":
          unionObj = turf.buffer(geoObj1, 50, { units: "kilometers" });
          alert("多边形A的周边范围！");
          break;
      }
      // 获取图形要素 feature
      let tempFeature = this.getFeatureByGeoJson(unionObj);

      // 设置样式
      tempFeature.setStyle(this.lineStyle());

      this.tempFeatures.push(tempFeature);

      this.layer.getSource().addFeatures([tempFeature]);
    },
  },
  data() {
    return {
      map: null,
      features: [],
      layer: null,
      tempFeatures: [],
    };
  },
  mounted() {
    var vm = this;
    setTimeout(function () {
      const _this = vm;

      // 卫星图
      var tianditu_img = new TileLayer({
        source: new XYZ({
          url: "http://t3.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=c6ea8a2d7a9794e4075bb6105b997762",
        }),
        visible: false,
      });
      // 行政图
      var tianditu_vec = new TileLayer({
        source: new XYZ({
          url: "http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=c6ea8a2d7a9794e4075bb6105b997762",
        }),
        visible: false,
      });
      // 地形图
      var tianditu_ter = new TileLayer({
        source: new XYZ({
          url: "http://t4.tianditu.com/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=c6ea8a2d7a9794e4075bb6105b997762",
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
      // 地图
      _this.map = new Map({
        target: "map",
        layers: [tianditu_ter, tianditu_vec, tianditu_img, tianditu_cva],
        view: new View({
          projection: "EPSG:4326",
          center: [125.9, 30.2],
          zoom: 5,
        }),
      });
      _this.getFeatures();
    }, 500);
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
    }
  }
}
</style>
