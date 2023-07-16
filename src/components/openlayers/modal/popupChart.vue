<template>
  <div class="chart">
    <div id="myChart2" class="pieChart"></div>
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
      up: null,
      down: null,
      datalist: [
        {
          opacity: 0.95,
          color: "#f467ce",
        },
        {
          opacity: 0.88,
          color: "#7aabe2",
        },
        {
          opacity: 0.84,
          color: "#ff7123",
        },
        {
          opacity: 0.8,
          color: "#ffc400",
        },
        {
          opacity: 0.75,
          color: "#5e333f",
        },
        {
          opacity: 0.7,
          color: "#6b3442",
        },
        {
          opacity: 0.68,
          color: "#8a3647",
        },
        {
          opacity: 0.6,
          color: "#68333f",
        },
      ],
    };
  },
  watch: {
    queryRecord: function (newval, oldval) {
      this.queryRecord = newval;
      if(this.queryRecord.length!=0){
        this.drawPie()
      }
    },
  },
  methods: {
    drawPie() {
      let myChart = echarts.init(document.getElementById("myChart2"));
      window.onresize = function () {
        myChart.resize(); //自动响应图表和容器大小
      };
      var datas = [];
      for (var i = 0; i < this.queryRecord.length; i++) {
        var item = this.queryRecord[i];
        var index = Math.floor(Math.random() * 7)
        var x  = Math.floor(Math.random() * 100)
        var y  = Math.floor(Math.random() * 100)
        datas.push({
          name: item.id,
          value: [x,y],
          symbolSize: item.pip_diameter/20,
          label: {
            normal: {
              textStyle: {
                fontSize: 11,
              },
            },
          },
          itemStyle: {
            normal: {
              color: this.datalist[index].color,
              opacity: this.datalist[index].opacity,
            },
          },
        });
      }
      // 绘制图表
      myChart.setOption({
        tooltip:{
          trigger: 'item',
          backgroundColor: "#283b56",
          formatter: function(param){
                  return param.name+"管径:"+param.data.symbolSize*20
                },
        },
        grid: {
          show: false,
          top: 10,
          bottom: 10,
        },
        xAxis: [
          {
            gridIndex: 0,
            type: "value",
            show: false,
            min: 0,
            max: 100,
            nameLocation: "middle",
            nameGap: 5,
          },
        ],
        yAxis: [
          {
            gridIndex: 0,
            min: 0,
            show: false,
            max: 100,
            nameLocation: "middle",
            nameGap: 30,
          },
        ],
        series: [
          {
            type: "scatter",
            symbol: "circle",
            symbolSize: 120,
            label: {
              normal: {
                show: true,
                formatter: '{b}',
                color: "#fff",
                textStyle: {
                  fontSize: "20",
                },
              },
            },
            itemStyle: {
              normal: {
                color: "#00acea",
              },
            },
            data: datas,
          },
        ],
      });
    },
  },
  mounted() {
  
  },
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