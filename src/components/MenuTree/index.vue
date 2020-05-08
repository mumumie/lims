<template>
  <el-submenu v-if="menu.children && menu.children.length >= 1" :index="'' + menu.id">
    <template slot="title">
      <i :class="menu.icon" ></i>
      <span slot="title">{{menu.name}}</span>
    </template>
    <MenuTree v-for="item in menu.children" :key="item.id" :menu="item"></MenuTree>
  </el-submenu>
  <el-menu-item v-else :index="'' + menu.id" @click="handleRoute(menu)" @contextmenu.prevent.native="newWindow(menu)">
    <i :class="menu.icon"></i>
    <span slot="title">
      {{menu.name}}
      <el-badge v-if="menu.value" class="mark" :value="menu.value" />
    </span>
  </el-menu-item>
</template>

<script>
import { getIFrameUrl, getIFramePath } from '@/utils/iframe'
export default {
  name: 'MenuTree',
  props: {
    menu: {
      type: Object,
      required: true
    }
  },
  methods: {
    handleRoute (menu) {
      // 如果是嵌套页面，转换成iframe的path
      let path = getIFramePath(menu.url)
      if(!path) {
        path = menu.url
      }
      // 通过菜单URL跳转至指定路由
      this.$router.push("/" + path)
    },
    newWindow(menu){
      let routeUrl = '';
      let path = getIFramePath(menu.url)
      if(!path) {
        path = menu.url
      }
      routeUrl = this.$router.resolve({ path: "/" + path});
      window.open(routeUrl.href, '_blank');
    }
  }
}
</script>
<style>
  .mark.el-badge{
    top:-3px;
  }
</style>
<style scoped lang="scss">
// .el-submenu, .el-menu-item {
//   background-color: #3c4b5a44;
// }
</style>
