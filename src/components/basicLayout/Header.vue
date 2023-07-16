<template>
  <a-layout-header class="header">
    <div class="lpart">
      <div class="logo" />
      <div class="system">智慧排水监管系统</div>
    </div>
    <div class="opt">
      <header-avatar class="header-item" />
    </div>
  </a-layout-header>
</template>
<script>
import HeaderAvatar from "./HeaderAvatar";
export default {
  props: {
    collapsed: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {};
  },
  components: { HeaderAvatar },
  computed: {},
  created() {},
  methods: {
    logout() {
      setTimeout(() => {
        this.$store.dispatch("clearUserInfo");
        this.$router.replace("/home");
      });
    },
  },
};
</script>
<style lang="less" scoped>
.header {
  width: 100%;
  height: 60px;
  background: #0169e1;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .lpart {
    display: flex;
    align-items: center;
    .logo {
      width: 50px;
      height: 50px;
      background: url(../../assets/img/HeaderLogo.png);
      background-size: 100% 100%;
    }
    .trigger {
      color: white;
      margin-right: 20px;
      font-size: 18px;
    }
    .system {
      margin: 0 30px;
      color: white;
      font-size: 20px;
    }
  }

  .opt {
    display: flex;
    align-items: center;
    color: white;
    .ring {
      font-size: 22px;
      margin-right: 20px;
    }
    .userpic {
      width: 30px;
      height: 30px;
      border-radius: 100%;
      margin-right: 10px;
    }
    .logout {
      margin-left: 30px;
    }
    .logout:hover {
      cursor: pointer;
    }
  }
}
</style>
