<!-- 展示不同数据源底图 -->
<template>
  <div id="container">
    <ol-data-source/>
  </div>
</template>
    
    <script>
  import olDataSource from "../../components/openlayers/olDataSource.vue";
  export default {
    components: {
        olDataSource,
    },
    methods: {
    },
  };
  </script>
   <style scoped lang="less">
html,
body {
  height: 100%;
}
#container {
  height: 100%;
  position: relative;
  overflow: hidden;
}
</style>
    