export default {
  state: {
    navTree: [],  // 导航菜单树
    navMainTree: [],
    activeIndex:0
  },
  getters: {

  },
  mutations: {
    setNavTree(state, navTree){  // 设置导航菜单树
      state.navTree = navTree;
      },
    setMainNavTree(state, navMainTree){  // 设置主导航菜单树
      state.navMainTree = navMainTree;
    },
    setActiveIndex(state, activeIndex){  // 设置主导航菜单树
      state.activeIndex = activeIndex;
    }
  },
  actions: {

  }
}
