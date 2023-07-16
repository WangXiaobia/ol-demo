<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <router-view></router-view>
    </div>
  </a-config-provider>
</template>

<script>
import zhCN from "ant-design-vue/lib/locale-provider/zh_CN";
export default {
  name: "App",
  data() {
    return {
      locale: zhCN,
    };
  },
};
</script>

<style>
::-webkit-scrollbar { width:5px;}
::-webkit-scrollbar-track { background:#f2f2f2; }
::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.2); }
::-webkit-scrollbar-thumb:hover { background:#f2f2f2 }
::-webkit-scrollbar-thumb:active { background:rgba(0,0,0,0.2); }
#app {
  width: 100%;
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
