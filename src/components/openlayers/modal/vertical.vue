<template>
  <!-- 弹出框容器 -->
  <div class="longgit-container" v-show="popupVisible == 'verticalShow'">
    <!-- popup title -->
    <div class="longgit-title">
      <div class="list-title">
        <span class="detail-title">纵剖面分析</span>
        <a
          href="#"
          id="list-closer"
          class="ol-list-closer"
          @click="closerList"
        ></a>
      </div>
    </div>
    <div class="longgit-body">
      <a-card class="card1" :body-style="{ padding: '0' }">
        <vertialChart
          class="chart"
          ref="linechart"
          :queryRecord="this.queryRecord"
        ></vertialChart>
      </a-card>
      <a-card class="card2" :body-style="{ padding: '10px 15px 5px 15px' }">
        <div class="line-table">
          <a-table
            :columns="columns3"
            :dataSource="queryRecord"
            :pagination="false"
            :scroll="{ x: 220 }"
            rowKey="ID"
            size="middle"
          >
          <template slot="flowScope"  slot-scope="text,record">
              <span class="solt-cloumn" v-show="record.flow=='0'"><a>正向</a></span
              >
              <span class="solt-cloumn" v-show="record.flow=='1'"><a>逆向</a></span
              >
            </template>
          </a-table>
        </div>
      </a-card>
    </div>
  </div>
</template>
  
  <script>
import vertialChart from "./vertialChart.vue";
import { columns3 } from "../js/column";
export default {
  components: {
    vertialChart,
  },
  props: {
    queryRecord: [],
    popupVisible: "",
  },
  data() {
    return {
      columns3,
    };
  },
  methods: {
    closerList() {
      this.$emit("closerList");
    },
  },
  watch: {
    queryRecord: function (newval, oldval) {
      this.queryRecord = newval;
    },
  },
  mounted() {},
};
</script>
  
  <style lang="less" scoped>
.longgit-container {
  position: absolute;
  width: 600px;
  height: 495px;
  left: 10px;
  top: 30px;
  border-radius: 4px;
  .longgit-title {
    width: 600px;
    height: 50px;
    background: #1890ff;
    border-radius: 4px 4px 0px 0px;
    .detail-title {
      font-size: 16px;
      color: #fff;
      margin-left: 10px;
      line-height: 50px;
    }
    .ol-list-closer:after {
      position: absolute;
      content: "✖";
      z-index: 999;
      display: inline;
      color: #fff;
      right: 10px;
      font-size: 16px;
      line-height: 50px;
    }
  }
  .longgit-body {
    background: #ececec;
    height: calc(100% - 50px);
    flex-direction: row;
  }
  .card1 {
    flex: 1;
    margin: 0px 0px 3px 0px;
    .chart {
      height: 300px;
      padding: 5px;
    }
  }
  .card2 {
    height: 140px;
    // flex: 0.8;
    // margin: 0 5px 5px 5px;
  }
}
/deep/ .ant-timeline-item {
  padding: 3px 0 12px;
}
</style>