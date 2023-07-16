import Vue from 'vue'
import App from './App.vue'
import router from './router';
import store from './store';
import 'ant-design-vue/dist/antd.less';
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/css/Global.less';
// import './assets/iconfont/iconfont.css';
// import * as echarts from 'echarts'
import "./utils/antd-vue.js";
Vue.use(ElementUI)
Vue.config.productionTip = false
// Vue.prototype.$echarts = echarts // 将echarts存到Vue原型中
new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
