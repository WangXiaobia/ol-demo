<template>
  <a-layout class="layout-container">
    <alink-header
        :collapsed="collapsed"
        @changeSidebar="changeSidebar"
    ></alink-header>
    <a-layout class="layout-sub-container">
      <a-layout-sider
          class="layout-sidebar"
          v-model="collapsed"
          :trigger="null"
      >
        <SideMenu :collapsed="collapsed" />
        <div class="bt-part">
          <a-icon
              class="trigger"
              :type="collapsed ? 'menu-unfold' : 'menu-fold'"
              @click="sidebarcontrol"
          />
        </div>
      </a-layout-sider>
      <a-layout id="main_layout">
        <a-layout-content class="layout-content">
          <keep-alive include="olmap">
            <router-view></router-view>
          </keep-alive>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<script>
import AlinkHeader from "./Header.vue";
import SideMenu from "./SideBar.vue";

export default {
  data() {
    return {
      collapsed: false,
    };
  },
  components: {
    SideMenu,
    // MainHeader,
    AlinkHeader,
  },
  methods: {
    changeSidebar(show) {
      this.collapsed = show;
    },
    sidebarcontrol() {
      this.collapsed = !this.collapsed;
    },
  },
};
</script>

<style lang="less" scoped>
.layout-container {
  min-width: 1366px;
  height: 100%;

  .layout-sub-container {
    overflow-y: hidden;
  }

  .layout-sidebar {
    background: white;
    z-index: 20;
    overflow-y: auto;
    &::-webkit-scrollbar {
      width: 0px !important;
    }
    scrollbar-width: none;
    position: relative;
    .bt-part {
      width: 200px;
      height: 50px;
      line-height: 50px;
      background:#fff;
      position: absolute;
      bottom: 0;
      left: 0;
      border-top: 1px solid rgba(0,0,0,0.15);
      .trigger {
        margin-left: 25px;
        font-size: 16px;
      }
    }
  }

  .layout-content {
    margin: 16px 10px 12px 10px;
    overflow: auto;
    flex: 1;
    background: #fff;
    box-sizing: border-box;
  }
}
</style>
