<template>
  <div class="chart">
    <div id="myChart" class="linechart"></div>
  </div>
</template>
<script>
import * as echarts from 'echarts';
export default {
  props: {
    queryRecord: [],

  },
  data() {
    return {
      data: null,
      longLh: [0],
      longMs: [],
    }
  },
  watch: {
    queryRecord: function (newval, oldval) {
      this.queryRecord = newval
      if(this.queryRecord.length!=0){
        this.drawLine()
      }
    },
  },
  mounted() {
    // setTimeout(() => this.drawLine(), 20);
  },
  methods: {
    drawLine() {
      this.longLh[1] = parseFloat(this.queryRecord[0].pip_length).toFixed(2)
      this.longMs[0] = parseFloat(this.queryRecord[0].to_depth).toFixed(2)
      this.longMs[1] = parseFloat(this.queryRecord[0].end_depth).toFixed(2)
      this.data = this.queryRecord
      // 基于准备好的dom，初始化echarts实例
      let myChart = echarts.init(document.getElementById('myChart'))
      window.onresize = function () {
        myChart.resize();  //自动响应图表和容器大小
      };
      // 绘制图表
      myChart.setOption({
        title: {
          text: '纵剖面折线图',
          textStyle: {
            fontSize: '15',
            color: '#262626',
          },
        },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: this.longLh,
          name: '长度(米)',
          nameLocation: 'center',
          boundaryGap: false,
          nameGap: 20,
          splitLine: {
            //网格线
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          name: '埋深(米)',
          inverse: true,
          boundaryGap: true,
          nameGap: 35,
          nameLocation: 'center',
          nameTextStyle: {
            margin: [10, 0, 0, 0],
          },
          axisLine: {
            show: false,
          },
        },
        dataZoom: [
          {
            type: 'inside', //详细配置
          },
        ],
        series: [
          {
            data: this.longMs,
            type: 'line',
          },
        ],
      })
    },
  },
}
</script>
<style lang="less" scoped>

.linechart {
  width: 588px;
  height: 290px;
  padding: 5px;
  position:absolute;
}
</style>