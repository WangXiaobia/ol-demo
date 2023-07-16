import Vue from 'vue';
import Vuex from 'vuex';
import fence from "./modules/fence";
import getters from "./getters";
import VuexPersistence from 'vuex-persist';
Vue.use(Vuex);
const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  key: 'user-system',
  reducer: (state) => {
    const { menu, userInfo } = state;
    return { menu, userInfo };
  },
});
export default new Vuex.Store({
  state: {
    menu: [], // 导航
    userInfo: {}
  },
  modules: {
    fence,
  },
  getters,
  mutations: {
    setMenuList(state, payload) {
      state.menu = payload.menuList;
    },
    setUserInfo(state, payload) {
      state.userInfo = payload.userInfo;
    }
  },
  actions: {
    /**
     * @description: 获取导航
     */
    getMenuList({ commit }, menuList) {
      commit('setMenuList', {
        menuList,
      });

    },
    /**
  * @description: 保存用户信息
  */
    setUserInfo({ commit }, userInfo) {
      commit('setUserInfo', { userInfo });
    },


    /**
    * @description: 清除用户信息
    */
    clearUserInfo({ commit }) {
      commit('setUserInfo', { userInfo: {} });
      commit('setMenuList', { menuList: [] });
      localStorage.removeItem('user-system');
    },
  },
  plugins: [vuexLocal.plugin],
});
