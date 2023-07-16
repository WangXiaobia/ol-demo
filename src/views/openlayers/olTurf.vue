<template>
  <div id="container">
    <div class="input-card">
      <h4 style="font-size: 15px;position: absolute;margin:5px 0px;margin-left: 20px;">空间分析</h4>
      <a-row class="input-item2" style="margin-top: 10px;">
        <a-col span="12">
          <a-button class="btn2" id="union" @click="union">联合</a-button>
        </a-col>
        <a-col span="12">
          <a-button class="btn2" id="difference" @click="difference">差异</a-button>
        </a-col>
      </a-row>
      <a-row class="input-item2">
        <a-col span="12">
          <a-button class="btn2" id="intersect" @click="intersect">相交</a-button>
        </a-col>
        <a-col span="12">
          <a-button class="btn2" id="hole" @click="hole">挖洞</a-button>
        </a-col>
      </a-row>
      <a-row class="input-item2">
        <a-col span="12">
          <a-button class="btn2" id="simplify" @click="simplify">抽稀</a-button>
        </a-col>
        <a-col span="12">
          <a-button class="btn2" id="buffer" @click="buffer">缓冲</a-button>
        </a-col>
      </a-row>
      <a-row class="input-item2">
        <a-col span="12">
          <a-button class="btn2" id="restore" @click="restore">还原</a-button>
        </a-col>
      </a-row>
    </div>
    <olmap :pageType="pageType" :turfType="turfType"/>
  </div>
</template>
<script>
import olmap from "./OlMap.vue";
export default {
  data() {
    return{
      turfType:"",
    }
  },
  components:{
    olmap,
  },
  methods:{
    union(){
      this.turfType='union'
    },
    difference(){
      this.turfType='difference'
    },
    intersect(){
      this.turfType='intersect'
    },
    hole(){
      this.turfType='hole'
    },
    simplify(){
      this.turfType='simplify'
    },
    buffer(){
      this.turfType='buffer'
    },
    restore(){
      this.turfType='restore'
    },
  }

}
</script>

<style scoped lang="less">
html,
body {
  height: 100%;
}
#container{
  height: 100%;
  position: relative;
  overflow: hidden;
  .input-card{
    height:250px;
    width:300px;
    left:0px;
    top: 600px;
    z-index: 999;
    background: #e9f0ff;
    border-style: dashed;
    border-color: #cccccc;
    position: absolute;
    // display: flex;
    .input-item2{
      .btn2{
        top:10px;
        position: relative;
        margin-right: 20px;
        margin-left: 20px;
        width: 120px;
        margin-top: 20px;
      }
    }
    .input-card .btn:last-child{
      margin-right: 0;
    }
  }
}
</style>
