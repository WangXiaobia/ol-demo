<template>
  <div class="chart">
    <div id="myChart3" class="pieChart"></div>
  </div>
</template>
<script>
import * as echarts from "echarts";
export default {
  props: {
    queryRecord: [],
  },
  data() {
    return {
      up: 0,
      down: 0,
    };
  },
  watch: {
    queryRecord: function (newval, oldval) {
      this.queryRecord = newval;
      this.up=0
      if (this.queryRecord.length != 0) {
        for (let i=0;i < this.queryRecord.length; i++) {
          if (this.queryRecord[i].flow == "0") {
            this.up = this.up + 1;
          }
        }
        this.down = this.queryRecord.length - this.up;
        this.drawPie();
      }
    },
  },
  methods: {
    drawPie() {
      //  this.data = this.queryRecord
      // 基于准备好的dom，初始化echarts实例
      let myChart = echarts.init(document.getElementById("myChart3"));
      window.onresize = function () {
        myChart.resize(); //自动响应图表和容器大小
      };
      // 绘制图表
      myChart.setOption({
        tooltip: {
          trigger: "item",
        },
        legend: {
          orient: "vertical",
          left: "left",
        },
        color: ["#1890ff", "#e32224"],
        label: {
          show: true,
          formatter: "{b} : {c} ({d}%)",
        },
        labelLine: { show: true },
        series: [
          {
            name: "流向",
            type: "pie",
            radius: "70%",
            data: [
              { value: this.up, name: "顺流" },
              { value: this.down, name: "逆流" },
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      });
    },
  },
  mounted() {},
};
</script>
<style lang="less" scoped>
.pieChart {
  width: 588px;
  height: 150px;
  // display: flex;
  padding: 5px;
}
</style>