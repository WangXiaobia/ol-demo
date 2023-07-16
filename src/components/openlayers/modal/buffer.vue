<template>
  <!-- 弹出框容器 -->
  <div class="longgit-container" v-show="popupVisible == 'bufferShow'">
    <!-- popup title -->
    <div class="longgit-title">
      <div class="list-title">
        <span class="detail-title">缓冲区分析</span>
        <a
          href="#"
          id="list-closer"
          class="ol-list-closer"
          @click="closerList"
        ></a>
      </div>
    </div>
    <div class="longgit-body" v-show="bufferType == 'point'">
      <!-- 管点弹出 -->
      <div class="tabs-container">
        <div class="flex-box flex-item">
          <div class="flex-box">
            <div class="attr-name">管点编号:<span></span></div>
            <div class="attr-value">{{ featureData.id }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">特征点:<span></span></div>
            <div class="attr-value">
              {{ featureData.characteristics }}
            </div>
          </div>
          <div class="flex-box">
            <div class="attr-name">附属物:<span></span></div>
            <div class="attr-value">
              {{ featureData.appendages }}
            </div>
          </div>
          <div class="flex-box">
            <div class="attr-name">井底深:<span></span></div>
            <div class="attr-value">
              {{ featureData.well_depth }}
            </div>
          </div>
          <div class="flex-box">
            <div class="attr-name">地面高程:<span></span></div>
            <div class="attr-value">
              {{ featureData.elevation }}
            </div>
          </div>
          <div class="flex-box">
            <div class="attr-name">X坐标:<span></span></div>
            <div class="attr-value">{{ featureData.x }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">设施编码:</div>
            <div class="attr-value">{{ featureData.fcode }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">监理单位:<span></span></div>
            <a-tooltip placement="topLeft" :title="featureData.suppervision_unit">
              <div class="attr-value">
                {{ featureData.suppervision_unit }}
              </div>
            </a-tooltip>
          </div>
          <div class="flex-box">
            <div class="attr-name">探测时间:<span></span></div>
            <div class="attr-value">
              {{ featureData.detection_time }}
            </div>
          </div>
        </div>
        <div class="flex-box flex-item">
          <div class="flex-box">
            <div class="attr-name">物探点号:<span></span></div>
            <div class="attr-value">{{ featureData.gp_point }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">所在道路:<span></span></div>
            <div class="attr-value">
              {{ featureData.rode_name }}
            </div>
          </div>
          <div class="flex-box">
            <div class="attr-name">井盖形状:<span></span></div>
            <div class="attr-value">{{ featureData.mc_type }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">井室规格:<span></span></div>
            <div class="attr-value">
              {{ featureData.井室规格 }}
            </div>
          </div>
          <div class="flex-box">
            <div class="attr-name">井盖材质:<span></span></div>
            <div class="attr-value">{{ featureData.mc_size }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">Y坐标:<span></span></div>
            <div class="attr-value">{{ featureData.y }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">地面高程:<span></span></div>
            <div class="attr-value">
              {{ featureData.elevation }}
            </div>
          </div>
          <div class="flex-box">
            <div class="attr-name">探测单位:<span></span></div>
            <a-tooltip placement="topLeft" :title="featureData.detection_unit">
              <div class="attr-value">
                {{ featureData.detection_unit }}
              </div>
            </a-tooltip>
          </div>
          <div class="flex-box">
            <div class="attr-name">备注:<span></span></div>
            <a-tooltip placement="topLeft" :title="featureData.remark">
              <div class="attr-value">
                {{ featureData.remark }}
              </div>
            </a-tooltip>
          </div>
        </div>
      </div>
      <div class="buffer-analysis">
        <span class="buffer-title">缓冲半径:</span>
        <a-select
          v-model="radius"
          show-search
          placeholder="选择一个缓冲半径"
          option-filter-prop="children"
          style="width: 320px; margin-left: 20px"
          :filter-option="filterOption"
        >
          <a-select-option value="5"> 5m </a-select-option>
          <a-select-option value="10"> 10m </a-select-option>
          <a-select-option value="20"> 20m </a-select-option>
        </a-select>
        <a-button type="primary" style="margin-left: 100px" @click="buffer"
          >分析</a-button
        >
      </div>
    </div>
    <div class="longgit-body" v-show="bufferType == 'line'">
      <!-- 管线弹窗 -->
      <div class="tabs-container">
        <div class="flex-box flex-item">
          <div class="flex-box">
            <div class="attr-name">管线编号<span></span></div>
            <div class="attr-value">{{ featureData.id }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">起点点号<span></span></div>
            <div class="attr-value">{{ featureData.to_point }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">终点点号<span></span></div>
            <div class="attr-value">{{ featureData.end_point }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">埋设类型<span></span></div>
            <div class="attr-value">{{ featureData.type }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">所在道路<span></span></div>
            <div class="attr-value">{{ featureData.rode_name }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">探测单位<span></span></div>
            <a-tooltip placement="topLeft" :title="featureData.detection_unit">
              <div class="attr-value">
                {{ featureData.detection_unit }}
              </div>
            </a-tooltip>
          </div>
          <div class="flex-box">
            <div class="attr-name">材质<span></span></div>
            <div class="attr-value">{{ featureData.material }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">流向<span></span></div>
            <div class="attr-value">{{ featureData.flow }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">孔径<span></span></div>
            <div class="attr-value">{{ featureData.aperture }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">起点埋深<span></span></div>
            <div class="attr-value">
              {{ featureData.to_depth }}
            </div>
          </div>
        </div>
        <div class="flex-box flex-item">
          <div class="flex-box">
            <div class="attr-name">起点高程<span></span></div>
            <div class="attr-value">
              {{ featureData.to_elevation }}
            </div>
          </div>
          <div class="flex-box">
            <div class="attr-name">终点高程<span></span></div>
            <div class="attr-value">
              {{ featureData.end_elevation }}
            </div>
          </div>
          <div class="flex-box">
            <div class="attr-name">管径<span></span></div>
            <div class="attr-value">{{ featureData.pip_diameter }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">埋设日期<span></span></div>
            <div class="attr-value">{{ featureData.elensitime }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">管线性质<span></span></div>
            <div class="attr-value">{{ featureData.pip_nature }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">权属单位<span></span></div>
            <div class="attr-value">{{ featureData.owner }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">长度<span></span></div>
            <div class="attr-value">
              {{ featureData.pip_length }}
            </div>
          </div>
          <div class="flex-box">
            <div class="attr-name">探测时间<span></span></div>
            <div class="attr-value">{{ featureData.detection_time }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">备注<span></span></div>
            <div class="attr-value">{{ featureData.elemetime }}</div>
          </div>
          <div class="flex-box">
            <div class="attr-name">终点埋深<span></span></div>
            <div class="attr-value">
              {{ featureData.end_depth }}
            </div>
          </div>
        </div>
      </div>
      <div class="buffer-analysis">
        <span class="buffer-title">缓冲半径:</span>
        <a-select
          v-model="radius"
          show-search
          placeholder="选择一个缓冲半径"
          option-filter-prop="children"
          style="width: 320px; margin-left: 20px"
          :filter-option="filterOption"
        >
          <a-select-option value="1"> 1m </a-select-option>
          <a-select-option value="3"> 3m </a-select-option>
          <a-select-option value="5"> 5m </a-select-option>
        </a-select>
        <a-button type="primary" style="margin-left: 100px" @click="buffer"
          >分析</a-button
        >
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    queryRecord: [],
    popupVisible: "",
  },
  data() {
    return {
      featureData: {},
      radius: "",
      bufferType: "",
    };
  },
  methods: {
    closerList() {
      this.bufferType='',
      this.$emit("closerList");
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text
          .toLowerCase()
          .indexOf(input.toLowerCase()) >= 0
      );
    },
    buffer() {
      this.$emit("turfBuffer", this.radius);
      // console.log(this.radius,'缓冲半径')
    },
  },
  watch: {
    queryRecord: function (newval, oldval) {
      if (newval.length != 0) {
        this.radius = "";
        this.featureData = newval[0];
        this.bufferType =
          this.featureData.geometry.flatCoordinates.length < 3
            ? "point"
            : "line";
      }
    },
  },
};
</script>

<style lang="less" scoped>
.longgit-container {
  position: absolute;
  left: 10px;
  top: 20px;
  width: 650px;
  height: 550px;
  border-radius: 4px;
  .longgit-title {
    width: 650px;
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
    background: #ffffff;
    height: 500px;
    padding: 0 20px;
    font-size: 15px;
    .tabs-container {
      // background-color: #1384f2;
      width: 100%;
      height: 440px;
      padding: 20px 0 20px 20px;
      border-bottom: solid 5px #e8e8e8;
      margin-bottom: 10px;
      display: flex;
    }
    .buffer-analysis {
      .buffer-title {
        margin-left: 20px;
        font-weight: 600;
      }
    }
  }
  .flex-1 {
    width: 100%;
    height: calc(100% - 50px);
    display: flex;
    padding: 5px 0 0 0;
    margin-bottom: 5px;
    border-bottom: solid 3px #e8e8e8;
    .botterm {
      padding-bottom: 10px;
      margin-bottom: 10px;
      // border-bottom: solid 2px #e8e8e8;
      flex: 0.3;
    }
    .botterm2 {
      padding: 0 0 5px 0;
      flex: 1;
    }
  }
  .flex-2 {
    display: flex;
    justify-content: space-between;
    // .btn {
    //   // position:relative;
    //   text-align: center;
    //   width: 60px;
    //   height: 32px;
    //   margin-top: 14px;
    //   right: 0px;
    // }
  }
  .flex-box {
    display: flex;
    flex: 1;
  }
  .flex-item {
    flex-direction: column;
  }
  .attr-name {
    width: 80px;
    height: 30px;
    font-size: 15px;
    font-family: PingFang SC;
    font-weight: bold;
    line-height: 30px;
    color: #333333;
    text-align: justify;
    opacity: 1;
  }
  .attr-name > span {
    // 解决text-aglign:justify 失效的问题
    display: inline-block;
    padding-left: 100%; // 或者width:100%
  }
  .attr-value {
    width: 170px;
    padding-left: 10px;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis; // 文字溢出用...表示
    white-space: nowrap; // 文字溢出不换行
    height: 30px;
    font-size: 14px;
    font-family: PingFang SC;
    font-weight: 400;
    line-height: 30px;
    color: #737373;
    opacity: 1;
  }
  .popup-type-text {
    height: 17px;
    font-size: 14px;
    font-family: PingFang SC;
    font-weight: 500;
    line-height: 17px;
    letter-spacing: 1px;
    color: #030a11;
    opacity: 1;
  }
  .popup-area-text {
    height: 17px;
    font-size: 12px;
    font-family: PingFang SC;
    font-weight: 500;
    line-height: 17px;
    letter-spacing: 1px;
    color: #b3dcff;
    opacity: 1;
  }
  .btn {
    text-align: center;
    margin-left: 15px;
    margin-top: 3px;
    // width: 80px;
    // height: 30px;
  }
}
/deep/ .ant-timeline-item {
  padding: 3px 0 12px;
}
</style>