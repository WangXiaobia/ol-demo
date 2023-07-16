import Feature from 'ol/Feature.js'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Point, LineString, Polygon } from 'ol/geom'
import GeoJSON from 'ol/format/GeoJSON'
import { Circle as CircleStyle, Fill, Icon, Stroke, Style, Text } from 'ol/style.js'
import { getVectorContext } from 'ol/render.js'
import { getDistance } from "ol/sphere";
import { transform } from "ol/proj";
let personGeometry, personFeature, trackLayer, startLayer, lastRouteIndex = 0, routesAll = []
let icon, scale
const init = (map, coord, name) => {
  trackLayer = new VectorLayer({
    source: new VectorSource({}),
    style: function (feature) {
      let style = routeStyle(feature)
      return style[feature.get('type')]
    },
    zIndex: 1200,
  })
  scale = name.length > 3 ? 0.4 : 0.8
  icon = name.length > 3 ? require('@/views/zhgis/map/img/person1.png') : require('@/views/zhgis/map/img/person.png')
  startLayer = new VectorLayer({
    source: new VectorSource({}),
    style: function (feature) {
      let style = routeStyle(feature)
      return style[feature.get('type')]
    },
    zIndex: 1200,
    visible: false
  })
  map.addLayer(trackLayer)
  map.addLayer(startLayer)
  routesAll = getRoutesAll(map, coord)
  for (let i = 0; i < coord.length; i++) {
    if (coord[i].length > 2) {
      let startFeature = new Feature({
        type: 'startMarker',
        geometry: new Point(coord[i][0])
      })
      let routeFeature = new Feature({
        type: 'route',
        geometry: new LineString(coord[i]),
      })
      personGeometry = new Point(coord[i][0])
      personFeature = new Feature({
        type: 'person',
        geometry: personGeometry,
        properties: {
          name: name,
        },
      })
      // 创建结束图标
      let endMarker = new Feature({
        type: 'endMarker',
        geometry: new Point(coord[i][coord[i].length - 1]),
      })
      trackLayer.getSource().addFeature(routeFeature)
      trackLayer.getSource().addFeature(personFeature)
      trackLayer.getSource().addFeature(endMarker)
      startLayer.getSource().addFeature(startFeature)
      let dynamic = trackLayer.on('postrender', function (event) {
        const len = routesAll[i].routes.length;
        if (routesAll[i].lastRouteIndex < len - 1) {
          routesAll[i].lastRouteIndex++;
          startLayer.setVisible(true)
        } else {
          routesAll[i].lastRouteIndex = 0;
        }
        const current = routesAll[i].routes[routesAll[i].lastRouteIndex];
        console.log(i,routesAll[i],current)
        personGeometry.setCoordinates(current.coordinate);
        map.render()
      })
    }
  }
  map.getView().animate({
    center: coord[0][0],
    zoom: 19,
    duration: 1000,
  })
  const extent = trackLayer.getSource().getExtent();
  let polygon = new Polygon([
    [
      [extent[0], extent[1]],
      [extent[2], extent[1]],
      [extent[2], extent[3]],
      [extent[0], extent[3]],
      [extent[0], extent[1]],
    ],
  ]);
  // 重置窗口视图的位置
  map.getView().fit(polygon, { padding: [150, 150, 150, 150] })
  return { trackLayer, startLayer }
}
const routeStyle = (f) => {
  let text = f.values_.properties ? f.values_.properties.name : ''
  let markerStyleInfo = {
    personImg: icon,
    startImg: require('@/views/zhgis/map/img/yh_start.png'),
    endImg: require('@/views/zhgis/map/img/yh_end.png'),
    personAnchor: [0.5, 0.08],
    startAnchor: [0.5, 0.1],
    endAnchor: [0.5, 0.1],
    personScale: scale,
    startScale: 0.8,
    endScale: 0.8,
  }
  let lightStroke = new Style({
    stroke: new Stroke({
      color: [238, 134, 255, 0.6],
      width: 5,
      lineDash: [4, 8],
    }),
  })
  let styles = {
    // 如果类型是 route，startMarker，endMarker 的样式
    route: [lightStroke],
    person: new Style({
      image: new Icon({
        src: markerStyleInfo.personImg,
        anchor: markerStyleInfo.personAnchor, //设置偏移
        scale: markerStyleInfo.personScale,
        anchorOrigin: 'bottom-right',
      }),
      text: new Text({
        offsetX: 0,
        offsetY: -50,
        text: text,
        textAlign: 'center',
        justify: 'center', //位置
        textBaseline: 'middle', //基准线
        font: 'normal 14px 微软雅黑', //文字样式
        fill: new Fill({
          //文本填充样式（即文字颜色)
          color: '#FFFFFF',
        }),
      }),
    }),
    endMarker: new Style({
      image: new Icon({
        src: markerStyleInfo.endImg,
        anchor: markerStyleInfo.endAnchor, //设置偏移
        scale: markerStyleInfo.endScale,
        anchorOrigin: 'bottom-right',
      }),
    }),
    startMarker: new Style({
      image: new Icon({
        src: markerStyleInfo.startImg,
        anchor: markerStyleInfo.startAnchor, //设置偏移
        scale: markerStyleInfo.startScale,
        anchorOrigin: 'bottom-right',
      }),
    }),
  }
  return styles
}
// 分割路径点
const getRoutesAll = (map, list) => {
  let all = []
  for (let i = 0; i < list[i].length; i++) {
    if (list[i].length > 2) {
      let speed = list[i].length / 35
      lastRouteIndex = 0
      let _routesAll = [
        {
          coordinate: list[i][0],
        },
      ]
      for (let j = 0, len = list[i].length; j < len - 1; j++) {
        const item = list[i][j]
        const itemNext = list[i][j + 1]
        const rotation = getRotation(...item, ...itemNext)
        let points = getCenterPoint(map, [item, itemNext], speed)
        points = points.map((item) => {
          return {
            rotation,
            coordinate: item,
          }
        })
        _routesAll = [..._routesAll, ...points]
      }
      let route = {
        lastRouteIndex: lastRouteIndex,
        routes: _routesAll
      }
      all.push(route)
    }
  }
  return all
}
const getRotation = (lng1, lat1, lng2, lat2) => {
  let rotation = Math.atan2(lng2 - lng1, lat2 - lat1)
  return rotation
}
const getCenterPoint = (map, pointDoubleArray, speed) => {
  speed = speed == undefined ? 10 : speed
  let twolength = formatLength(map, pointDoubleArray)
  let rate = twolength / speed //比例 默认10m/点
  let step = Math.ceil(rate) //步数（向上取整）
  let arr = new Array() //定义存储中间点数组
  let c1 = pointDoubleArray[0] //头部点
  let c2 = pointDoubleArray[1] //尾部点
  let x1 = c1[0],
    y1 = c1[1]
  let x2 = c2[0],
    y2 = c2[1]
  for (let i = 1; i < step; i++) {
    let coor = new Array(2)
    coor[0] = ((x2 - x1) * i) / rate + x1
    coor[1] = ((y2 - y1) * i) / rate + y1
    arr.push(coor) //此时arr为中间点的坐标
  }
  arr.push(c2)
  return arr
}
const formatLength = (map, pointArray) => {
  let length = 0
  if (map.getView().getProjection().code_ == 'EPSG:4326') {
    for (let i = 0, ii = pointArray.length - 1; i < ii; ++i) {
      let c1 = pointArray[i]
      let c2 = pointArray[i + 1]

      length += getDistance(c1, c2)
    }
  } else if (map.getView().getProjection().code_ == 'EPSG:3857') {
    for (let i = 0, ii = pointArray.length - 1; i < ii; ++i) {
      let c1 = pointArray[i]
      let c2 = pointArray[i + 1]
      c1 = transform(c1, 'EPSG:3857', 'EPSG:4326')
      c2 = transform(c2, 'EPSG:3857', 'EPSG:4326')
      length += getDistance(c1, c2)
    }
  }
  return length
}
export default init
