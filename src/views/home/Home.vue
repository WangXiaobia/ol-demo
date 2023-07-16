<template>
  <div></div>
</template>
<script>
export default {
  data() {
    return {};
  },
  created() {
    /**
     * @description:直接进入有权限的第一个页面
     */
    const userInfo = {
      userName: "admin",
      pic: "https://csi.tmuyun.com/webpic/W0202103/W020210325/W020210325320727977214.jpg",
    };
    //模拟导航，一般是通过接口获取权限导航
    const menuList = [
      {
        id: 10,
        name: "多源地图",
        url: "openlayers/mapDataSource",
        children: [],
      },
      {
        id: 20,
        name: "基础功能",
        url: "openlayers/initMap",
        children: [],
      },
      {
        id: 30,
        name: "地理围栏",
        url: "openlayers/enclosure",
        children: [],
      },
      {
        id: 40,
        name: "动态轨迹",
        url: "openlayers/trace",
        children: [],
      },
      {
        id: 50,
        name: "空间分析",
        url: "openlayers/analys",
        children: [],
      },
      {
        id: 70,
        name: "几何分析",
        url: "openlayers/olTurf",
        children: [],
      },
      {
        id: 80,
        name: "图层遮罩",
        url: "openlayers/cover",
        children: [],
      },
      {
        id: 90,
        name: "剪贴蒙版",
        url: "openlayers/telescope",
        children: [],
      },
      {
        id: 100,
        name: "地图样式",
        url: "openlayers/customColor",
        children: [],
      },
      {
        id: 110,
        name: "台风轨迹",
        url: "openlayers/typhoon2",
        children: [],
      },
      {
        id: 120,
        name: "流动风场",
        url: "openlayers/wind",
        children: [],
      },
      {
        id: 130,
        name: "雨雪天气",
        url: "openlayers/three",
        children: [],
      },
      {
        id: 140,
        name: "Geojson转csv",
        url: "openlayers/geojsonTocsv",
        children: [],
      },
      // {
      //   id: 150,
      //   name: "模块高亮",
      //   url: "openlayers/hightLight",
      //   children: [],
      // },
      {
        id: 160,
        name: "动态导航线",
        url: "openlayers/dynamicLine",
        children: [],
      },
      {
        id: 170,
        name: "WMS瓦片数据",
        url: "openlayers/wmsTile",
        children: [],
      },
      {
        id: 180,
        name: "webGl",
        url: "openlayers/webGl",
        children: [],
      },
      {
        id: 190,
        name: "canvasLine",
        url: "openlayers/canvasLine",
        children: [],
      },
    ];
    this.$store.dispatch("setUserInfo", userInfo);
    this.$store.dispatch("getMenuList", menuList);
    this.$router.push({ name: menuList[0].url.split("/")[1] });
  },
  methods: {},
};
</script>
