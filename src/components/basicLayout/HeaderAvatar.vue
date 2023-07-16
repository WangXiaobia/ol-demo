<template>
  <a-dropdown>
    <div class="header-avatar" style="cursor: pointer">
      <!--<a-avatar class="avatar" size="small" shape="circle" :src="user.avatar"/>-->
      <a-avatar class="avatar " size="small" shape="circle" :src="userInfo.pic"/>
      <!--<a-avatar icon="user" />-->
      <span class="name" style="color: #fff;">{{ userInfo.userName }}</span>
      <!--<span class="name" style="color: #fff;">{{// user.name}}</span>-->
    </div>
    <a-menu :class="['avatar-menu']" slot="overlay">
      <a-menu-item>
        <a-icon type="setting" />
        <span>设置</span>
      </a-menu-item>
      <a-menu-divider />
      <a-menu-item @click="logout">
        <a-icon style="margin-right: 8px;" type="poweroff" />
        <span>退出登录</span>
      </a-menu-item>
    </a-menu>
  </a-dropdown>
</template>

<script>

export default {
  name: 'HeaderAvatar',
  computed: {
      userInfo() {
          return this.$store.state.userInfo;
      },
  },
  methods: {
    logout() {
        setTimeout(() => {
            this.$store.dispatch("clearUserInfo");
            this.$router.replace("/login");
        });
    }
  }
}
</script>

<style lang="less">
  .header-avatar{
    display: inline-flex;
    .avatar, .name{
      align-self: center;
    }
    .avatar{
      width: 30px;
      height: 30px;
      border-radius: 100%;
      margin-right: 10px;
      /*margin-right: 8px;*/
    }
    .name{
      font-weight: 500;
    }
  }
  .avatar-menu{
    width: 150px;
  }

</style>
