<template>
  <div id="main-container" class="main-container" :class="$store.state.app.collapse?'position-collapse-left':'position-left'">
    <!-- 标签页 -->
    <div class="tab-container">
      <el-tabs class="tabs" :class="$store.state.app.collapse?'position-collapse-left':'position-left'"
        v-model="mainTabsActiveName" :closable="mainTabs.length >= 2" type="card"
        @tab-click="selectedTabHandle" @tab-remove="removeTabHandle">
        <el-dropdown class="tabs-tools" :show-timeout="0" trigger="hover">
          <div style="font-size:20px;width:50px;text-align: center;"><i class="el-icon-arrow-down"></i></div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="tabsCloseCurrentHandle">关闭当前标签</el-dropdown-item>
            <el-dropdown-item @click.native="tabsCloseOtherHandle">关闭其它标签</el-dropdown-item>
<!--            <el-dropdown-item @click.native="tabsCloseAllHandle">关闭全部标签</el-dropdown-item>-->
            <el-dropdown-item @click.native="tabsRefreshCurrentHandle">刷新当前标签</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-tab-pane
          v-for="item in mainTabs"
          class="tabs_navs"
          :key="item.name"
          :label="item.title"
          :name="item.name">
          <span slot="label"  @contextmenu.prevent="newWindow(item)"><i :class="item.icon"></i> {{item.title}} </span>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 主内容区域 -->
    <div class="main-content">
      <keep-alive>
        <transition name="fade" mode="out-in">
          <keep-alive include="Manual,Quest">
            <router-view></router-view>
          </keep-alive>
        </transition>
      </keep-alive>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  computed: {
    mainTabs: {
      get () { return this.$store.state.tab.mainTabs },
      set (val) { this.$store.commit('updateMainTabs', val) }
    },
    mainTabsActiveName: {
      get () { return this.$store.state.tab.mainTabsActiveName },
      set (val) { this.$store.commit('updateMainTabsActiveName', val) }
    },
    navMainTree: {
      get () { return this.$store.state.menu.navMainTree },
      set (val) { this.$store.commit('setMainNavTree', val) }
    }
  },
  methods: {
    // tabs, 选中tab
    selectedTabHandle (tab) {
      tab = this.mainTabs.filter(item => item.name === tab.name);
      if (tab.length >= 1) {
        if (Object.keys(tab[0].params).length > 0 && tab[0].params.constructor === Object) {
          this.$router.push({ name: tab[0].name,params:{id : tab[0].params.id}})
        }else if(Object.keys(tab[0].query).length > 0 && tab[0].query.constructor === Object){
          this.$router.push({ name: tab[0].name,query:{id : tab[0].query.id}})
        }else{
          this.$router.push({ name: tab[0].name })
        }
      }
    },
    // tabs, 删除tab
    removeTabHandle (tabName) {
      this.mainTabs = this.mainTabs.filter(item => item.name !== tabName)
      if (this.mainTabs.length >= 1) {
        // 当前选中tab被删除
        if (tabName === this.mainTabsActiveName) {
          this.$router.push({ name: this.mainTabs[this.mainTabs.length - 1].name }, () => {
            this.mainTabsActiveName = this.$route.name
          })
        }
      } else {
        this.$router.push({name: this.navMainTree[0].children[0].name})
      }
    },
    // tabs, 关闭当前
    tabsCloseCurrentHandle () {
      if (this.mainTabs.length > 1) {
        this.removeTabHandle(this.mainTabsActiveName)
      } else {
        this.$message({
          type: 'warning',
          message: '仅剩当前页，无法删除！'
        })
      }
    },
    // tabs, 关闭其它
    tabsCloseOtherHandle () {
      this.mainTabs = this.mainTabs.filter(item => item.name === this.mainTabsActiveName)
    },
    // tabs, 关闭全部
    tabsCloseAllHandle () {
      this.mainTabs = []
      this.$router.push({name: this.navMainTree[0].children[0].name})
    },
    // tabs, 刷新当前
    tabsRefreshCurrentHandle () {
      // var tempTabName = this.mainTabsActiveName
      // this.removeTabHandle(tempTabName)
      // this.$nextTick(() => {
      //   this.$router.push({ name: tempTabName })
      // })
      this.$router.go(0)
    },
    newWindow(tab){
      let routeUrl = '';
      tab = this.mainTabs.filter(item => item.name === tab.name);
      if (Object.keys(tab[0].params).length > 0 && tab[0].params.constructor === Object) {
        routeUrl = this.$router.resolve({ name: tab[0].name,params:{id : tab[0].params.id}})
      }else if(Object.keys(tab[0].query).length > 0 && tab[0].query.constructor === Object){
        routeUrl = this.$router.resolve({ name: tab[0].name,query:{id : tab[0].query.id}})
      }else{
        routeUrl = this.$router.resolve({ name: tab[0].name })
      }
      window.open(routeUrl.href, '_blank');
    }
  }
}
</script>
<style>
  .main-container .tab-container .tabs .el-tabs__content{
    overflow: inherit;
    z-index: -100;
  }
  .main-container .el-tabs__header{
    height:40px;
  }
</style>
<style scoped lang="scss">
  .main-container {
    background: #fff;
    padding: 0 0 5px;
    position: absolute;
    top: 60px;
    left: 201px;
    right: -1px;
    bottom: 0px;
    z-index:50;
    // background: rgba(56, 5, 114, 0.5);
    .tab-container{
      .tabs {
        position: fixed;
        top: 60px;
        left:200px;
        right: 50px;
        padding-left: 0px;
        padding-right: 2px;
        z-index: 1020;
        height: 40px;
        line-height: 40px;
        font-size: 14px;
        background: rgb(255, 253, 255);
        border-color: rgba(200, 206, 206, 0.5);
        // border-left-width: 1px;
        // border-left-style: solid;
        border-bottom-width: 1px;
        border-bottom-style: solid;
        .tabs_navs{
          height:0;
        }

      }

      .tabs-tools {
        position: absolute;
        top: -56px;
        right: -50px;
        z-index: 1020;
        height: 40px;
        // padding: 0 10px;
        font-size: 14px;
        line-height: 40px;
        cursor: pointer;
        border-color: rgba(200, 206, 206, 0.5);
        border-left-width: 1px;
        border-left-style: solid;
        border-bottom-width: 1px;
        border-bottom-style: solid;
        background: rgba(255, 255, 255, 1);
      }
      .tabs-tools:hover {
        background: rgba(200, 206, 206, 1);
      }
    }
    .main-content {
      position: absolute;
      top: 45px;
      left: 5px;
      right: 5px;
      bottom: 5px;
      padding: 5px;
      // background: rgba(209, 212, 212, 0.5);
    }
  }
.position-collapse-left {
  left: 65px;
}
</style>
