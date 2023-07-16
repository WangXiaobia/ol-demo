import Feature from 'ol/Feature.js'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Point, LineString } from 'ol/geom'
import GeoJSON from 'ol/format/GeoJSON'
import { Circle as CircleStyle, Fill, Icon, Stroke, Style, Text } from 'ol/style.js'
import { getVectorContext } from 'ol/render.js'
import WKT from 'ol/format/WKT.js'

let _map,
  features,
  layer, //线图层
  pointLayer,
  offsetList = []
/**
 * 管线流向展示
 * @param {*} map 地图
 * @param {*} polyline 线段的 geoJson 数据
 * @returns 路径所在的图层及事件处理函数
 */
const flowLayer = (map, polyline) => {
  // const arr = []
  // list.features.forEach((item) => {
  //   arr.push(createLine(item))
  // })
  // arr = createLine()
  // const polyline = {
  //   type: 'FeatureCollection',
  //   features: [...arr],
  // }
  // for (let i = 0; i < polyline.features.length; i++) {
  //   if (polyline.features[i].properties.flow === '1' || polyline.features[i].properties.flow === '逆流') {
  //     polyline.features[i].geometry.coordinates = polyline.features[i].geometry.coordinates.reverse()
  //   }
  // }
  _map = map
  features = new GeoJSON().readFeatures(polyline)

  layer = new VectorLayer({
    source: new VectorSource({}),
    zIndex: 5000,
  })
  _map.addLayer(layer)

  pointLayer = new VectorLayer({
    source: new VectorSource({}),
    zIndex: 10000,
  })
  _map.addLayer(pointLayer)
  for (let i = 0; i < features.length; i++) {
    const routeFeature = features[i]
    offsetList.push(i)
    layer.getSource().addFeature(routeFeature)
  }

  // _map.getView().fit(routeFeature.getGeometry())  // 将地图缩放至给定几何图形完全显示的最大zoom
  layer.on('postrender', handler)
  return { layer, handler, pointLayer }
}
const handler = (evt) => {
  let vct = getVectorContext(evt)
  pointLayer.getSource().clear()
  for (let i = 0; i < features.length; i++) {
    render(vct, features[i], i)
  }
  _map.render()
}
const render = (vct, routeFeature, i) => {
  vct.drawFeature(routeFeature, upperPathStyle)
let numArr = Math.ceil(routeFeature.getGeometry().getLength() / _map.getView().getResolution() / 20) //频率
  let points = []
  for (let i = 0; i <= numArr; i++) {
    let fracPos = i / numArr + offsetList[0]
    if (fracPos > 1) fracPos -= 1
    let pf = new Feature(new Point(routeFeature.getGeometry().getCoordinateAt(fracPos)))
    points.push(pf)
  }

  //确定方向并绘制
  routeFeature.getGeometry().forEachSegment((start, end) => {
    // console.log(start, end)
    points.forEach((item) => {
      let line = new LineString([start, end]) // 相邻两点组成线要素
      let coord = item.getGeometry().getFirstCoordinate() // 点要素的坐标
      let cPoint = line.getClosestPoint(coord) // 返回line线段上距离coord最近的点的坐标
      // Math.abs 差的绝对值
      // 此处 0.00001 用来控制渲染要素的最大偏差，如果过大，则会在同一点位渲染多次
      if (Math.abs(cPoint[0] - coord[0]) < 0.00001 && Math.abs(cPoint[1] - coord[1]) < 0.00001) {
        let myImage = new Image(24, 30)
        myImage.src = require('../images/arrow.png')
        let dx = end[0] - start[0]
        let dy = end[1] - start[1]
        let rotation = Math.atan(dx / dy)
        rotation = dy > 0 ? rotation : Math.PI + rotation
        vct.setStyle(arrowStyle(myImage, rotation))
        vct.drawGeometry(item.getGeometry())
      }
    })
    let lineType = routeFeature.values_.pipNature ? routeFeature.values_.pipNature : routeFeature.values_.pip_nature
    // if (lineType.substr(0, 2) === '污水') {
      const feature1 = new Feature({
        geometry: new Point(routeFeature.getGeometry().getFirstCoordinate()),
      })
      feature1.setStyle(ws_point)
      pointLayer.getSource().addFeature(feature1)
      const feature2 = new Feature({
        geometry: new Point(routeFeature.getGeometry().getLastCoordinate()),
      })
      feature2.setStyle(ws_point)
      pointLayer.getSource().addFeature(feature2)
    // } else {
    //   const feature1 = new Feature({
    //     geometry: new Point(routeFeature.getGeometry().getFirstCoordinate()),
    //   })
    //   feature1.setStyle(ys_point)
    //   pointLayer.getSource().addFeature(feature1)
    //   const feature2 = new Feature({
    //     geometry: new Point(routeFeature.getGeometry().getLastCoordinate()),
    //   })
    //   feature2.setStyle(ys_point)
    //   pointLayer.getSource().addFeature(feature2)
    // }
  })
  offsetList[i] = offsetList[i] + 0.003
  //复位
  if (offsetList[i] >= 1) offsetList[i] = 0.001
}
// 动态箭头样式
const arrowStyle = (myImage, rotation) => {
  return new Style({
    image: new Icon({
      img: myImage,
      imgSize: [24, 30],
      scale: 0.4,
      rotation: rotation,
      // anchor:[0.12, 0.15], //偏移可调
    }),
  })
}
//路径样式
const upperPathStyle = new Style({
  stroke: new Stroke({
    color: '#adebff',
    width: 12,
  }),
})

// 污水管线端点样式
const ws_point = new Style({
  image: new Icon({
    scale: 1.1,
    src: require('../images/ws_point.png'),
    anchor: [0.5, 0.5],
    anchorOrigin: 'bottom-center',
  }),
})

// 雨水管线端点样式
const ys_point = new Style({
  image: new Icon({
    scale: 1.1,
    src: require('../images/ys_point.png'),
    anchor: [0.5, 0.5],
    anchorOrigin: 'bottom-center',
  }),
})

const createFeature = (item) => {
  // const coordinates = new WKT().readFeature(item.shape).geometry.coordinates
  const coords = new WKT().readFeature(item.shape).values_.geometry.flatCoordinates
  const coordinates = [
    [coords[0], coords[1]],
    [coords[2], coords[3]],
  ]
  return {
    type: 'Feature',
    properties: { ...item },
    geometry: {
      type: 'LineString',
      coordinates,
    },
  }
}
const createLine = () => {
  // const coordinates = new WKT().readFeature(item.shape).geometry.coordinates
  const coords = [
    [119.6306720437136, 27.984876696647234],
    [119.63044928855, 27.984876696647234],
    [119.63039359975909, 27.984344559311953],
    [119.6295458926087, 27.98266770794147],
    [119.62842139274132, 27.98170791980394],
  ]
  return {
    type: 'Feature',
    // properties: item.properties,
    geometry: {
      type: 'LineString',
      coordinates: coords,
    },
  }
}

export default flowLayer
