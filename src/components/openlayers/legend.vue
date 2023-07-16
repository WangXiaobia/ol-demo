<template>
  <div class="legend-wrapper">
    <h3>{{ legendTitle }}</h3>
    <a-row type="flex" justify="space-between">
      <a-col :span="20">
        <p v-for="(item, index) in legendList.layerList" :key="index">
          <img class="legend-img" :src="item.src" alt="" /> {{ item.name }}
          <a-switch
              :checked="item.checked"
              @change="onLayerChange($event, index)"
              style="position:absolute;right: 0px"
          />
        </p>
      </a-col>
    </a-row>
  </div>
</template>
<script>
export default {
  components: {},
  props: {
    legendList: {
      type: Object,
      default: function() {
        return {
          layerList: [],
        };
      },
    },
  },
  data() {
    return {
      size: "small",
      legendTitle:"图例及图层控制",
    };
  },
  methods: {
    onLayerChange(checked, index) {
      this.legendList.layerList[index].checked = checked;
      this.$emit("legendLayerVisible", this.legendList);
    },
  },
};
</script>
<style lang="less" scoped>
.legend-wrapper {
  width: 260px;
  padding: 10px 0 0 10px;
  box-sizing: border-box;
  background: #fff;
  box-shadow: 0px 8px 20px 0px rgba(15, 31, 60, 0.16);
  border-radius: 6px;
  border: 1px solid #ffffff;
  position: absolute;
  left: 10px;
  bottom: 70px;
  h3 {
    font-size: 16px;
    font-weight: bold;
  }
}
.legend-img {
  width: 20px;
  margin-right: 5px;
}
.legend-span {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 6px;
  margin-right: 5px;
}
</style>
