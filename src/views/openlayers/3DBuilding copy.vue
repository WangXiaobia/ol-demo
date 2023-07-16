<template>
  <div>
    <div class="info">
    This example add a setRenderer3D function to vector layers that do the job in a postcompose loop.
    <br />
    Buildings from <a href="http://professionnels.ign.fr/bdtopo">BDTopo &copy; IGN-France</a>.
    <br />
    POI informations from <a href="https://www.wikipedia.org/">WikiPedia</a>
    <br/>
    <button onclick="doAnime();">Animate!</button>
  </div>

  <!-- DIV pour la carte -->
  <div id="map"></div>
  <div class="loading">Please wait while loading data...</div>
  </div>
</template>
<script>
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import OSM from "ol/source/OSM.js";
// import "ol-ext/dist/ol-ext.min.css";
// import "ol-ext/dist/ol-ext.js";
export default {
  components: {},
  data() {
    return {};
  },
  methods: {},
  mounted() {
    var layer = new TileLayer({ name:"OSM", source: new OSM() });
    var map = new Map({
    target: 'map',
    view: new View ({
      zoom: 19,
      center: [-245406, 5986536]// [-245575, 5986863], //[-244777, 5989809]
    }),
    layers: [ layer ]
  });

  // Create layer
  var vectorSource = new VectorSource({
    url: './data/ignf.json',
    // projection: 'EPSG:3857',
    format: new GeoJSON(),
    attributions: [ "&copy; <a href='http://professionnels.ign.fr/bdtopo'>ign.fr</a>" ]
  });
  var vector = new VectorLayer({
    source: vectorSource,
    maxResolution: 2
  });
  map.addLayer(vector);

  var dbpSource = new VectorSource({
    url: './data/dbpedia.json',
    format: new GeoJSON(),
    attributions: [ "&copy; DBPedia" ]
  });
  var dbp = new VectorLayer({
    source: dbpSource
  });
  map.addLayer(dbp);
  
  // Set 3D renderer
  var r3D = new render3D({
    /** /
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'blue',
        width: 2
      }),
      fill: new ol.style.Fill({ color: 'red' })
    }),
    /**/
    // ghost: true,
    height:0, 
    maxResolution:0.6, 
    defaultHeight:3.5 
  });
  vector.setRender3D(r3D);
  var listenerKey = vectorSource.on('change', function(e) {
    if (vectorSource.getState() == 'ready') {
      ol.Observable.unByKey(listenerKey)
      $(".loading").hide();
      setTimeout (doAnime, 200);
    }
  });
  var r3D2 = new render3D({ height:100, maxResolution:10 });
  dbp.setRender3D(r3D2);

  var height = 0;
  function doAnime() {
    if (r3D.animating()) return;
    r3D2.animate({ height: height ? 0:100 });
    height = height ? 0 : "HAUTEUR";
    r3D.animate({ height:height });
  }
    
  },
};
</script>
 <style scoped lang="less">
@import "./style.css";
#map {
      position:fixed;
      top: 4em;
      left: 0;
      right:0;
      bottom:0;
      margin:0;
    }
    .info {
      position: fixed;
      right: 0.5em;
      top: 4em;
      width: 300px;
      z-index: 1;
    }
    .loading {
      background: #fff;
      border: 2px solid #369;
      left: 50%;
      margin: -2em -100px;
      padding: 0.5em;
      position: fixed;
      text-align: center;
      top: 50%;
      width: 200px;
      z-index: 1;
      box-sizing: border-box;
      box-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }
</style>
  