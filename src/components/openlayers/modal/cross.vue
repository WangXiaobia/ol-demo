<template>
    <!-- 弹出框容器 -->
    <div class="longgit-container" v-show="popupVisible == 'crossShow'">
      <!-- popup title -->
      <div class="longgit-title">
        <div class="list-title">
        <span class="detail-title">横断面分析</span>
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
              <popupChart class="chart" :queryRecord="this.queryRecord"></popupChart>
            </a-card>
            <a-card class="card2" :body-style="{ padding: '10px 15px 5px 15px' }">
              <div class="line-table">
                <a-table
                  :columns="columns4"
                  :dataSource="queryRecord"
                  :scroll="{ x: 220 }"
                  :pagination="pagination"
                  rowKey="ID"
                >
                </a-table>
              </div>
            </a-card>
      </div>
    </div>
  </template>
  
  <script>
  import popupChart from './popupChart.vue'
  import {columns4} from '../js/column'
  export default {
    components: {
      popupChart,
    },
    props: {
      queryRecord: [],
      popupVisible:'',
    },
    data() {
      return {
        columns4,
        pagination: {
        pageSize: 4, // 默认每页显示数量
        showTotal: (total) => `共 ${total} 条数据`, // 显示总数
      }, //分页配置
      }
    },
    methods: {
      closerList(){
        this.$emit('closerList')
      }
    },
    watch: {
      queryRecord: function (newval, oldval) {
        this.queryRecord = newval
      },
    },
    mounted() {
       
    },
  }
  </script>
  
  <style lang="less" scoped>

/deep/.ant-table-pagination.ant-pagination {
  float: left;
}
.longgit-container {
    position: absolute;
    width: 600px;
    height: 565px;
    left:10px;
    top:10px;
    border-radius: 4px;
    .longgit-title {
      width: 600px;
      height: 50px;
      background:#1890FF;
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
        height: 160px;
        padding: 5px;
      }
    }
    .card2 {
      height: 360px;
      // flex: 0.8;
      // margin: 0 5px 5px 5px;
    }
  }
  /deep/ .ant-timeline-item {
    padding: 3px 0 12px;
  }
  </style>