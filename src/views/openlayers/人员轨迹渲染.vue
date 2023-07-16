<template>
  <div class="ssjk pb-24">
    <FirstTitle @cancel="cancel">
      <template v-slot:title>实时巡查数据</template>
    </FirstTitle>
    <section class="mx-16 mt-16">
      <section class="flex-align-center">
        <section class="flex-1 px-16 py-8 xc-1">
          <div>
            <span class="value mr-4">{{ pannelData.userNumber || 0 }}</span>
            <span class="unit">人</span>
          </div>
          <div class="name">在线巡查人数</div>
        </section>
        <section class="flex-1 px-16 py-8 ml-8 xc-2">
          <div>
            <span class="value mr-4">{{ pannelData.planNumber || 0 }}</span>
            <span class="unit">个</span>
          </div>
          <div class="name">今日巡查计划</div>
        </section>
        <section class="flex-1 px-16 py-8 ml-8 xc-3">
          <div>
            <span class="value mr-4">{{ pannelData.trackLength || 0 }}</span>
            <span class="unit">千米</span>
          </div>
          <div class="name">今日巡查轨迹</div>
        </section>
      </section>
      <section class="mt-12">
        <SecondTitle class="mt-14" mode="custom">
          <template slot="title"> 巡查列表 </template>
        </SecondTitle>
        <section class="gis-form-content">
          <section class="mt-12">
            <a-select
              style="width: 100%"
              v-model="query.person"
              @change="handleChange"
              autocomplete="off"
              placeholder="请选择巡查人"
              dropdownClassName="gis-select-dropdown"
            >
              <a-select-option v-for="item in examineUserList" :value="item" :key="item">
                {{ item }}
              </a-select-option>
            </a-select>
            <!-- <section class="ml-16">
              <a-date-picker
                style="width: 201px"
                :value="query.time"
                format="YYYY-MM-DD"
                show-time
                @change="onChange"
              />
            </section> -->
          </section>
          <!-- <section class="mt-8 select-tree px-7 py-11">
            <a-tree
              v-model="checkedKeys"
              checkable
              :expanded-keys="expandedKeys"
              :auto-expand-parent="autoExpandParent"
              :selected-keys="selectedKeys"
              :tree-data="treeData"
              @expand="onExpand"
              @select="onSelect"
            />
          </section> -->
        </section>
      </section>
    </section>
    <div id="btn-anmite">
      <a-button id="btn-an" @click="changeAnimation">{{ animationText }}</a-button>
    </div>
  </div>
</template>

<script>
import FirstTitle from '@/views/zhgis/component/firstTitle.vue'
import SecondTitle from '@/views/zhgis/component/secondTitle.vue'
import { RealTrack, PatrolPlanLength } from '@/api/Examine'
import { Point, LineString, Polygon } from 'ol/geom'
import { Circle as CircleStyle, Fill, Stroke, Style, Icon, Text } from 'ol/style'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Overlay from 'ol/Overlay'
import Feature from 'ol/Feature'
import bus from '@/bus'
import moment from 'moment'
import openClear from '@/views/zhgis/map/js/openClear.js'
import createPath from '@/views/zhgis/map/js/staticPath.js'
import { getVectorContext } from 'ol/render'
import { getDistance } from "ol/sphere";
import { transform } from "ol/proj";

const pathData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { _draw_type: 'line' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [119.6306720437136, 27.984876696647234],
          [119.63044928855, 27.984876696647234],
          [119.63039359975909, 27.984344559311953],
          [119.6295458926087, 27.98266770794147],
          [119.62842139274132, 27.98170791980394],
        ],
      },
    },
  ],
}
export default {
  components: { FirstTitle, SecondTitle },
  data() {
    return {
      query: {
        person: undefined,
      },
      form: this.$form.createForm(this),
      sjList: [{ name: '第一视角' }],
      treeData: [
        {
          title: '王玫玲',
          key: '0-0',
          children: [
            {
              title: '0-0-0',
              key: '0-0-0',
              children: [
                { title: '0-0-0-0', key: '0-0-0-0' },
                { title: '0-0-0-1', key: '0-0-0-1' },
                { title: '0-0-0-2', key: '0-0-0-2' },
              ],
            },
          ],
        },
        {
          title: '王小平',
          key: '0-1',
          children: [
            { title: '0-1-0-0', key: '0-1-0-0' },
            { title: '0-1-0-1', key: '0-1-0-1' },
            { title: '0-1-0-2', key: '0-1-0-2' },
          ],
        },
        {
          title: '吴建方',
          key: '0-2',
        },
        {
          title: '王仙平',
          key: '0-3',
        },
      ],
      expandedKeys: ['0-0-0', '0-0-1'],
      autoExpandParent: true,
      checkedKeys: ['0-0-0'],
      selectedKeys: [],
      pannelData: {}, //巡查统计数据
      trackData: [], //巡查数据
      examineUserList: [], //巡查员
      examineUser: undefined,
      animating: false,
      pathData,
      pathLayerHandler: null, // 路径图层的事件处理函数
      pathLayer: null, // 路径图层
      pointLayer: null, // 路径点图层
      carGeometry: null,
      speed: 2,
      animationText: '开始',
      carGeometry: null,
      carFeature: null,
      lastRouteIndex: 0,
      list: [],
      routesAll: [],
    }
  },

  methods: {
    moment,
    cancel() {
      this.$emit('cancel')
    },
    handleChange() {},
    onChange(date, dateString) {
      console.log(date, dateString)
      this.time = date
      this.load_examine()
    },
    onExpand(expandedKeys) {
      console.log('onExpand', expandedKeys)
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    onCheck(checkedKeys) {
      console.log('onCheck', checkedKeys)
      this.checkedKeys = checkedKeys
    },
    onSelect(selectedKeys, info) {
      console.log('onSelect', info)
      this.selectedKeys = selectedKeys
    },
    //加载巡查数据
    load_examine() {
      RealTrack().then((response) => {
        if (response.code == 1000) {
          this.list = [
            [119.6306720437136, 27.984876696647234],
            [119.63044928855, 27.984876696647234],
            [119.63039359975909, 27.984344559311953],
            [119.6295458926087, 27.98266770794147],
            [119.62842139274132, 27.98170791980394],
          ]
          console.log(response)
          this.drawLine(this.list)
          this.getRoutesAll()
          // this.showPathLayer() // 加载箭头轨迹
          this.drawAmite([119.60446190900007, 27.921963678000054], true)
          this.drawAmite([119.60446927600003, 27.921692691000032], false)
          this.trackData = response.data
          let num = 0
          for (let key in response.data) {
            //整理巡查员列表
            if (
              response.data[key].length != 0 &&
              this.examineUserList.indexOf(response.data[key][0][0].userName) == -1
            ) {
              this.examineUserList.push(response.data[key][0][0].userName)
            }
            console.log(this.examineUserList, '巡查数据')
            //渲染轨迹if没选择巡查员else选择巡查员
            // if (!this.examineUser) {
            //   this.drawLine(response.data[key], num)
            //   num++
            // } else {
            //   if (response.data[key].length != 0 && response.data[key][0][0].userName == this.examineUser) {
            //     this.drawLine(response.data[key], num)
            //     num++
            //   }
            // }
          }
        }
      })
    },
    // 展示轨迹
    showPathLayer() {
      this.cleanPathLayer()
      const { layer, handler, pointLayer } = createPath(this.map, this.pathData)
      this.pathLayer = layer
      this.pathLayerHandler = handler
      this.pointLayer = pointLayer
    },
    // 清除轨迹
    cleanPathLayer() {
      this.pathLayerHandler && this.pathLayer.un('postrender', this.pathLayerHandler)
      this.pathLayer && this.pathLayer.getSource().clear()
      this.pathLayer && this.map.removeLayer(this.pathLayer)
      this.pointLayer && this.pointLayer.getSOurce().clear()
      this.pointLayer && this.map.removeLayer(this.pointLayer)
      this.pathLayer = null
      this.pathLayerHandler = null
      this.pointLayer = null
    },
    routeStyle(f) {
      console.log(f, '要素')
      let text = f.values_.properties ? f.values_.properties.name : ''
      let markerStyleInfo = {
        labelImg: require('@/views/zhgis/map/img/label_name.png'),
        startImg: require('@/views/zhgis/map/img/person.png'),
        endImg: require('@/views/zhgis/map/img/yh_end.png'),
        startAnchor: [0.5, 0.08],
        endAnchor: [0.5, 0.1],
        labelAnchor: [0.5, -0.7],
        labelScale: 0.8,
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
        labelMarker: new Style({
          image: new Icon({
            src: markerStyleInfo.labelImg,
            anchor: markerStyleInfo.labelAnchor, //设置偏移
            scale: markerStyleInfo.labelScale,
            anchorOrigin: 'bottom-left',
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
        startMarker: new Style({
          image: new Icon({
            src: markerStyleInfo.startImg,
            anchor: markerStyleInfo.startAnchor, //设置偏移
            scale: markerStyleInfo.startScale,
            anchorOrigin: 'bottom-right',
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
      }
      return styles
    },
    drawLine(coord) {
      this.removeVectorLayer(this.trackLayer)
      let routeFeature = new Feature({
        type: 'route',
        geometry: new LineString(coord),
      })
      this.carGeometry = new Point(coord[0])
      this.carFeature = new Feature({
        type: 'startMarker',
        geometry: this.carGeometry,
      })
      // 创建结束图标
      let endMarker = new Feature({
        type: 'endMarker',
        geometry: new Point(coord[coord.length - 1]),
      })
      let labelMarker = new Feature({
        type: 'labelMarker',
        geometry: new Point(coord[0]),
        properties: {
          name: '王石',
        },
      })
      let _this = this
      this.trackLayer = new VectorLayer({
        source: new VectorSource({
          features: [routeFeature, this.carFeature, endMarker, labelMarker],
        }),
        style: function (feature) {
          // if (_this.animating && feature.get('type') === 'geoMarker') {
          //   return null
          // }
          let style = _this.routeStyle(feature)
          return style[feature.get('type')]
        },
        zIndex: 120,
      })
      this.map.addLayer(this.trackLayer)
      // 重置窗口视图的位置
      this.map.getView().fit(new Polygon([coord]), { padding: [150, 150, 150, 150] })
    },
    drawAmite(coord, type) {
      let element = document.createElement('mapEmit')
      element.className = type == true ? 'point_animation' : 'point_animation2'
      let p = document.createElement('p')
      let span = document.createElement('span')
      element.appendChild(p)
      element.appendChild(span)
      let point_overlay = new Overlay({
        element: element,
        positioning: 'center-center',
        position: coord,
        stopEvent: false,
      })
      this.map.addOverlay(point_overlay)
    },
    removeVectorLayer(vectorLayer) {
      if (vectorLayer) this.map.removeLayer(vectorLayer)
    },
    initBus() {
      bus.$emit('getMap')
      bus.$on('initMap', (map) => {
        this.map = map
      })
    },
    load_pannel() {
      PatrolPlanLength().then((response) => {
        if (response.code == 1000) {
          this.pannelData = response.data
          // console.log(this.pannelData)
        }
      })
    },
    //实时加载隐患和巡检任务
    load_data() {
      this.load_examine()
      this.load_pannel()
    },
    // 分割路径点
    getRoutesAll() {
      this.lastRouteIndex = 0
      let _routesAll = [
        {
          coordinate: this.list[0],
        },
      ]
      for (let i = 0, len = this.list.length; i < len - 1; i++) {
        const item = this.list[i]
        const itemNext = this.list[i + 1]
        const rotation = this.getRotation(...item, ...itemNext)
        let points = this.getCenterPoint(this.map, [item, itemNext], this.speed)
        points = points.map((item) => {
          return {
            rotation,
            coordinate: item,
          }
        })
        _routesAll = [..._routesAll, ...points]
      }
      this.routesAll = _routesAll
    },
    getRotation(lng1, lat1, lng2, lat2) {
      let rotation = Math.atan2(lng2 - lng1, lat2 - lat1)
      return rotation
    },
    getCenterPoint(map, pointDoubleArray, speed) {
      speed = speed == undefined ? 10 : speed
      let twolength = this.formatLength(map, pointDoubleArray)
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
    },
    formatLength(map, pointArray) {
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
    },
    startAnimation() {
      this.animating = true
      this.animationText = '停止'
      this.trackLayer.on('postrender', this.moveFeature)
      this.carFeature.setGeometry(null)
    },
    changeAnimation() {
      this.animating ? this.stopAnimation() : this.startAnimation();
    },
    // 停止动画
    stopAnimation() {
      this.animating = false;
      this.animationText = "开始";
      this.carFeature.setGeometry(this.carGeometry);
      this.trackLayer.un("postrender", this.moveFeature);
    },
    moveFeature(event) {
      const len = this.routesAll.length;
      if (this.lastRouteIndex < len - 1) {
        this.lastRouteIndex++;
      } else {
        this.lastRouteIndex = 0;
      }
      const current = this.routesAll[this.lastRouteIndex];
      this.carGeometry.setCoordinates(current.coordinate);
      const vectorContext = getVectorContext(event);
      let _Style = new Style({
        image: new Icon({
          anchor: [0.5, 0.8],
          // rotation: current.rotation,
          src: require('@/views/zhgis/map/img/person.png'),
          scale: 0.8,
        }),
      });
      vectorContext.setStyle(_Style);
      vectorContext.drawGeometry(this.carGeometry);
      this.map.render()
    },
  },
  mounted() {
    this.load_data()
    this.initBus()
  },
  beforeDestroy() {
    bus.$off('initMap')
    this.removeVectorLayer(this.trackLayer)
    // this.map.getOverlays().clear()
    this.map && openClear(this.map)
    this.cleanPathLayer()
  },
}
</script>

<style lang="less" scoped>
.ssjk {
  width: 450px;
  background: linear-gradient(149.91deg, rgba(32, 121, 255, 0.4) 0.25%, rgba(11, 21, 37, 0) 8.81%),
    radial-gradient(50% 3.57% at 50% 100%, rgba(45, 150, 255, 0.6) 0%, rgba(21, 44, 78, 0) 100%),
    linear-gradient(180deg, rgba(0, 0, 0, 0) 2.21%, rgba(24, 99, 206, 0.05) 100%), rgba(27, 45, 73, 0.9);
  box-shadow: 0px 2px 8px rgba(14, 33, 62, 0.4);
  backdrop-filter: blur(12px);
  /* Note: backdrop-filter has minimal browser support */

  border-radius: 8px;
  font-family: 'PingFang SC CT';
  font-style: normal;
  font-weight: 400;
  .select-tree {
    background: rgba(5, 23, 51, 0.15);
    /* 线/描边 */

    border: 1px solid rgba(128, 178, 255, 0.15);
    border-radius: 2px;
  }
  .xc-1 {
    background: url('~@/assets/gis/ssxc-block-bg1.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }

  .xc-2 {
    background: url('~@/assets/gis/ssxc-block-bg2.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
  .xc-3 {
    background: url('~@/assets/gis/ssxc-block-bg3.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
  .name {
    font-size: 14px;
    line-height: 20px;
    color: #a6c9ff;
  }
  .value {
    font-weight: 500;
    font-size: 24px;
    line-height: 34px;
    color: #ffffff;
  }
  .unit {
    font-size: 14px;
    line-height: 20px;
    color: rgba(229, 240, 255, 0.6);
  }
  #btn-anmite {
    position: absolute;
    bottom: 65px;
    right: 1px;
    z-index: 1000;
    #btn-an {
      margin-right: 15px;
    }
  }
}
</style>
