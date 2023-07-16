<template>
  <div class="map_type_change">
    <div
      v-for="(item, index) in mapType"
      @click="changeBaseMapFunc(item, index)"
      :key="index"
      class="map_type_item"
      :class="[item.className, { map_type_item_active: activeIndex == index }]"
    >
      <span>{{ item.text }}</span>
    </div>
  </div>
</template>
  
  <script>
export default {
  name: "changeBaseMap",
  data() {
    return {
      mapType: [
        { type: "land", text: "地形", className: "map_type_item_land" },
        { type: "admin", text: "行政", className: "map_type_item_admin" },
        { type: "moon", text: "卫星", className: "map_type_item_moon" },
        { type: "baidu", text: "百度", className: "map_type_item_baidu" },
        { type: "gaode", text: "高德", className: "map_type_item_gaode" },
        { type: "arcgis", text: "ArcGIS", className: "map_type_item_arcgis" },
      ],
      activeIndex: 1,
    };
  },
  methods: {
    changeBaseMapFunc(item, index) {
      (this.activeIndex = index),
        this.$emit("changeBaseValue", this.mapType[index].type);
    },
  },
  mounted() {},
};
</script>
  
  <style scoped>
.map_type_change {
  position: absolute;
  bottom: 10px;
  left: 10px;
  width: 54px;
  height: 56px;
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
  z-index: 10001;
  padding: 4px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  transition: width 0.5s ease;
  -webkit-transition: width 0.5s ease;
  /* Safari */
}

.map_type_change:hover {
  width: 305px;
}
.map_type_item {
  width: 46px;
  height: 46px;
  margin-right: 4px;
  border-radius: 3px;
  /*float: left;*/
  display: inline-block;
  -webkit-box-flex: 0;
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
  color: #e9f0ff;
  cursor: pointer;
  order: 5;
  opacity: 0.7;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.map_type_item:hover {
  border: 1px solid #1890ff;
}

.map_type_item span {
  line-height: 1;
  padding: 3px 5px;
  font-size: 12px;
  display: inline-block;
}
.map_type_item_moon {
  background: url("../../assets/olImg/ditu@2x.png") center no-repeat;
  background-size: cover;
}
.map_type_item_admin {
  background: url("../../assets/olImg/weixingtu@2x.png") center no-repeat;
  background-size: cover;
}

.map_type_item_land {
  background: url("../../assets/olImg/dixing@2x.png") center no-repeat;
  background-size: cover;
}
.map_type_item_baidu{
  background: url("../../assets/olImg/baidu.png") center no-repeat;
  background-size: cover;
}
.map_type_item_gaode{
  background: url("../../assets/olImg/gaode.png") center no-repeat;
  background-size: cover;
}
.map_type_item_arcgis{
  background: url("../../assets/olImg/arcgis.png") center no-repeat;
  background-size: cover;
}
.map_type_item_tile{
  background: url("../../assets/olImg/tile.png") center no-repeat;
  background-size: cover;
}
.map_type_item.map_type_item_active {
  order: 1;
  opacity: 1;
  border: 2px solid #1890ff;
}

.map_type_item_active > span {
  background: #1890ff;
  border-radius: 0 4px 4px;
}
</style>
  