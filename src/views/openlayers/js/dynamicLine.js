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
const init = (map, polyline) => {
  // const init = (map, list) => {
  // const arr = []
  // list.forEach((item) => {
  //   arr.push(createFeature(item))
  // })
  // const polyline = {
  //   type: 'FeatureCollection',
  //   features: [...arr],
  // }
  _map = map
  features = new GeoJSON().readFeatures(polyline)

  layer = new VectorLayer({
    source: new VectorSource({}),
    style: new Style({
      stroke: new Stroke({
        color: 'transparent',
        width: 0,
      }),
    }),
    zIndex: 1000,
  })
  _map.addLayer(layer)

  pointLayer = new VectorLayer({
    source: new VectorSource({}),
    style: function (f) {
      return pointStyle(f)
    },
    zIndex: 1001,
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
    // render(vct, features[i],i)
    render(vct, features[i])
  }
  _map.render()
}
// const render = (vct, routeFeature, i) => {
  const render = (vct, routeFeature) => {
  vct.drawFeature(routeFeature, upperPathStyle) // 路径样式
  let numArr = Math.ceil(routeFeature.getGeometry().getLength() / _map.getView().getResolution() / 10)
  let points = []
  for (let i = 0; i <= numArr; i++) {
    // let fracPos = i / numArr  
    // let fracPos = i / numArr + offsetList[0]
    // if (fracPos > 1) fracPos -= 1
    let pf = new Feature(new Point(routeFeature.getGeometry().getCoordinateAt(fracPos)))
    points.push(pf)
  }

  //确定方向并绘制
  routeFeature.getGeometry().forEachSegment((start, end) => {
    points.forEach((item) => {
      let line = new LineString([start, end]) // 相邻两点组成线要素
      let coord = item.getGeometry().getFirstCoordinate() // 点要素的坐标
      let cPoint = line.getClosestPoint(coord) // 返回line线段上距离coord最近的点的坐标
      // Math.abs 差的绝对值
      // 此处 0.00001 用来控制渲染要素的最大偏差，如果过大，则会在同一点位渲染多次
      if (Math.abs(cPoint[0] - coord[0]) < 0.00000000001 && Math.abs(cPoint[1] - coord[1]) < 0.00000000001) {
        let myImage = new Image(24, 30)
        myImage.src = require('../images/arrow-right.png')
        let dx = end[0] - start[0]
        let dy = end[1] - start[1]
        let rotation = Math.atan(dx / dy)
        rotation = dy >= 0 ? rotation - Math.PI / 2 : rotation + Math.PI / 2
        vct.setStyle(arrowStyle(myImage, rotation))
        vct.drawGeometry(item.getGeometry())
      }
    })
    // 渲染起点
    const feature1 = new Feature({
      geometry: new Point(routeFeature.getGeometry().getFirstCoordinate()),
    })
    feature1.setStyle(startStyle)
    pointLayer.getSource().addFeature(feature1)
    // 渲染终点
    const feature2 = new Feature({
      geometry: new Point(routeFeature.getGeometry().getLastCoordinate()),
    })
    feature2.setStyle(endStyle)
    pointLayer.getSource().addFeature(feature2)

    // 人物实时位置
    const personFeature = new Feature({
      geometry: new Point([119.63039359975909, 27.984344559311953]),
    })
    pointLayer.getSource().addFeature(personFeature)
  })
  // offsetList[i] = offsetList[i] + 0.002//快慢
  //复位
  // if (offsetList[i] >= 1) offsetList[i] = 0.001
}
// 动态箭头样式
const arrowStyle = (myImage, rotation) => {
  return new Style({
    image: new Icon({
      img: myImage,
      imgSize: [24, 30],
      scale: 0.6,
      rotation: rotation,
      // anchor:[0.12, 0.15], //偏移可调
    }),
  })
}
//路径样式
const upperPathStyle = new Style({
  stroke: new Stroke({
    color: 'transparent',
    width: 0,
  }),
})
// 起点样式
const startStyle = new Style({
  image: new Icon({
    src: require('../images/yh_start.png'),
    scale: 0.5,
    anchor: [0.4, 0.8],
  }),
})
// 终点样式
const endStyle = new Style({
  image: new Icon({
    src: require('../images/yh_end.png'),
    scale: 0.5,
    anchor: [0.5, 0.1],
    anchorOrigin: 'bottom-right'
  }),
})
const pointStyle = (f) => {
  return new Style({
    image: new Icon({
      src: require('../images/person.png'),
      scale: 0.5,
      anchor: [0.5, 0.1],
      anchorOrigin: 'bottom-right'
    }),
    // text: new Text({
    //   offsetX: 0,
    //   offsetY: -50,
    //   text: text,
    //   textAlign: 'center',
    //   justify: 'center', //位置
    //   textBaseline: 'middle', //基准线
    //   font: 'normal 14px 微软雅黑', //文字样式
    //   fill: new Fill({
    //     //文本填充样式（即文字颜色)
    //     color: '#FFFFFF',
    //   }),
    // }),
  })
}

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

export default init
