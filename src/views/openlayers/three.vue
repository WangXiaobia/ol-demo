<template>
  <div>
    <div id="container"></div>
    <div class="controls-box">
      <section>
        <a-row>
          <a-checkbox v-model="properties.transparent" @change="redraw"
            >transparent</a-checkbox
          >
        </a-row>
        <a-row>
          <div v-for="(item, key) in properties" :key="key">
            <div v-if="item && item.name != undefined">
              <a-col :span="8">
                <span class="vertice-span">{{ item.name }}</span>
              </a-col>
              <a-col :span="13">
                <a-slider
                  v-model="item.value"
                  :min="item.min"
                  :max="item.max"
                  :step="item.step"
                  :tip-formatter="formatTooltip"
                  @change="redraw"
                />
              </a-col>
              <a-col :span="3">
                <span class="vertice-span">{{ item.value }}</span>
              </a-col>
            </div>
          </div>
        </a-row>
        <a-row>
          <a-col :span="8" class="label-col"><label> color</label></a-col>
          <a-col :span="16">
            <div @click="inputClick">
              <a-input :value="properties.color"></a-input>
            </div>
            <div v-show="isShowColors" class="color-select-layer">
              <sketch-picker
                v-model="properties.color"
                @input="colorChange"
              ></sketch-picker>
            </div>
          </a-col>
        </a-row>
        <a-row>
          <a-checkbox v-model="properties.sizeAttenuation" @change="redraw"
            >sizeAttenuation</a-checkbox
          >
        </a-row>
        <a-row class="changType">
          <a-radio-group v-model="properties.img" size="small" @change="redraw">
            <a-radio value="rain" style="margin-right: 80px; margin-left: 50px"
              >雨</a-radio
            >
            <a-radio value="snow">雪</a-radio>
          </a-radio-group>
        </a-row>
      </section>
    </div>
  </div>
</template>
<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Sketch } from "vue-color";
export default {
  mounted() {
    this.init();
  },
  components: {
    "sketch-picker": Sketch,
  },
  data() {
    return {
      rain: false,
      snow: true,
      properties: {
        size: {
          name: "size",
          value: 2.6,
          min: 0,
          max: 20,
          step: 0.1,
        },
        opacity: {
          name: "opacity",
          value: 0.6,
          min: 0,
          max: 1,
          step: 0.1,
        },
        transparent: true,
        sizeAttenuation: true,
        color: "#E9F0E9",
        img: "rain",
      },
      isShowColors: false,
      points: null,
      camera: null,
      scene: null,
      renderer: null,
      controls: null,
      showType: "rain",
    };
  },
  methods: {
    formatTooltip(val) {
      return val;
    },
    inputClick() {
      this.isShowColors = !this.isShowColors;
    },
    colorChange(val) {
      this.properties.color = val.hex;
      this.redraw();
    },

    init() {
      this.createScene(); // 创建场景
      this.createParticleSystem(); // 创建粒子系统
      this.createCamera(); // 创建相机
      this.createRender(); // 创建渲染器
      this.createControls(); // 创建控件对象
      this.render(); // 渲染
    },

    // 创建场景
    createScene() {
      this.scene = new THREE.Scene();
    },
    // 创建粒子
    createParticleSystem() {
      const THIS = this;
      const textureLoader = new THREE.TextureLoader();
      const loadTexture = textureLoader.load(
        require("./images/" + this.properties.img + ".png")
      );
      // 创建几何体
      const geom = new THREE.Geometry();
      const material = new THREE.PointsMaterial({
        map: loadTexture,
        size: this.properties.size.value,
        transparent: this.properties.transparent,
        opacity: this.properties.opacity.value,
        sizeAttenuation: this.properties.sizeAttenuation,
        color: this.properties.color,
        blending: THREE.AdditiveBlending,
        depthTest: false, // 解决透明度问题
      });
      const range = 160;
      for (let i = 0; i < 3000; i++) {
        const particle = new THREE.Vector3(
          Math.random() * range - range / 2,
          Math.random() * range * 1.5,
          Math.random() * range - range / 2
        );
        particle.velocityY = 0.1 + Math.random() / 5;
        particle.velocityX = (Math.random() - 0.5) / 3;
        // 给几何体添加顶点坐标
        geom.vertices.push(particle);
      }
      // 创建粒子系统对象
      this.points = new THREE.Points(geom, material);
      this.points.sortParticles = true;
      this.points.verticesNeedUpdate = true;
      // 将粒子系统对象添加到场景
      this.scene.add(this.points);
    },
    // 创建相机
    createCamera() {
      const element = document.getElementById("container");
      const width = element.clientWidth; // 窗口宽度
      const height = element.clientHeight; // 窗口高度
      const k = width / height; // 窗口宽高比
      // PerspectiveCamera( fov, aspect, near, far )
      this.camera = new THREE.PerspectiveCamera(45, k, 0.1, 1000);
      this.camera.position.set(0, 0, 160); // 设置相机位置

      this.camera.lookAt(new THREE.Vector3(10, 0, 0)); // 设置相机方向
      this.scene.add(this.camera);
    },
    // 创建渲染器
    createRender() {
      const element = document.getElementById("container");
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(element.clientWidth, element.clientHeight); // 设置渲染区域尺寸
      this.renderer.setClearColor(0x3f3f3f, 1); // 设置背景颜色
      element.appendChild(this.renderer.domElement);
    },
    redraw() {
      if (this.points) {
        this.scene.remove(this.points);
      }
      this.createParticleSystem();
    },
    rainAnimation() {
      const vertices = this.points.geometry.vertices;
      vertices.forEach((v) => {
        v.y = v.y - v.velocityY * 3;
        v.x = v.x - v.velocityX * 0.5;

        if (v.y <= -60) v.y = 60;
        if (v.x <= -20 || v.x >= 20) v.velocityX = v.velocityX * -1;
      });
      // 实时更新网格的顶点信息
      this.points.geometry.verticesNeedUpdate = true;
    },
    render() {
      this.rainAnimation();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this.render);
    },
    // 创建控件对象
    createControls() {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    },
  },
};
</script>
  
<style lang="less" scoped>
#container {
  height: 849px;
  width: 100%;
  position: relative;
  overflow: hidden;
}
.controls-box {
  position: absolute;
  left: 210px;
  top: 75px;
  width: 300px;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #c3c3c3;
}
.label-col {
  padding: 8px 5px;
}
.color-select-layer {
  position: relative;
  left: -20px;
  padding: 15px 0;
}
.vertice-span {
  line-height: 38px;
  padding: 0 2px 0 10px;
}
.changType {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
  margin-top: 20px;
}
</style>
  