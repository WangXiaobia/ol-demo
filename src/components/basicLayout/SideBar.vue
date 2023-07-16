<template>
  <a-menu
    mode="inline"
    @select="gotoMenu"
    :selectedKeys="activebar"
    :defaultOpenKeys="openbar"
  >
    <template v-for="item in menu">
      <a-menu-item
        class="top-level-item"
        :key="item.url"
        v-if="item.length != 0"
      >
        <span> <a-icon :type="item.icon" />{{ item.name }}</span>
      </a-menu-item>
    </template>
  </a-menu>
</template>
<script>
export default {
  data() {
    return {
      activebar: [this.$route.path.replace("/view/", "")],
      openbar: [this.$route.path.replace("/view/", "").split("/")[0]],
    };
  },
  watch: {
    $route(to) {
      this.activebar = [to.path.replace("/view/", "")];
      this.openbar = [this.$route.path.replace("/view/", "").split("/")[0]];
      this.getsidebar();
    },
  },
  created() {
    this.getsidebar();
  },
  methods: {
    /**
     * @description: 获取侧边栏导航菜单
     */
    getsidebar() {
      this.menu = this.$store.state.menu;
    },
    gotoMenu(e) {
      this.$router.push({ path: `/view/${e.key}` });
    },
  },
};
</script>
