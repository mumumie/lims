<template>
  <div class="headbar" :style="{'background':themeColor}"
    :class="$store.state.app.collapse?'position-collapse-left':'position-left'">
    <!-- 导航收缩 -->
<!--    <span class="hamburg">-->
<!--      <el-menu class="el-menu-demo" :background-color="themeColor" text-color="#fff" :active-text-color="themeColor" mode="horizontal">-->
<!--        <el-menu-item index="1" @click="onCollapse"><hamburger :isActive="collapse"></hamburger></el-menu-item>-->
<!--      </el-menu>-->
<!--    </span>-->
    <!-- 导航菜单 -->
    <span class="navbar">
      <el-menu :default-active="activeIndex" class="el-menu-demo"
          :background-color="themeColor" text-color="#fff" active-text-color="#ffd04b" mode="horizontal" @select="selectNavBar">
<!--        <el-menu-item index="-1" @click="$router.push('/')"><i class="fa fa-home fa-lg"></i>  </el-menu-item>-->
        <el-menu-item :index="index" @click="handleRoute(item.children[0])" v-for="(item,index) in navMainTree" :key="item.id"><i :class="item.icon"></i>{{item.name}}</el-menu-item>
<!--        <el-menu-item index="3" @click="openWindow('https://gitee.com/liuge1988/kitty/wikis/Home')">{{$t("common.doc")}}</el-menu-item>-->
<!--        <el-menu-item index="4" @click="openWindow('https://www.cnblogs.com/xifengxiaoma/')">{{$t("common.blog")}}</el-menu-item>-->
      </el-menu>
    </span>
    <!-- 工具栏 -->
    <span class="toolbar">
      <el-menu class="el-menu-demo" :background-color="themeColor" :text-color="themeColor" :active-text-color="themeColor" mode="horizontal">
        <el-menu-item index="1">
          <!-- 主题切换 -->
          <theme-picker class="theme-picker" :default="themeColor" @onThemeChange="onThemeChange"></theme-picker>
        </el-menu-item>
        <el-menu-item index="5" v-popover:popover-personal>
          <!-- 用户信息 -->
          <span class="user-info"><img :src="user.avatar" />{{user.name}}</span>
          <el-popover ref="popover-personal" placement="bottom-end" trigger="click" :visible-arrow="false">
            <personal-panel :user="user"></personal-panel>
          </el-popover>
        </el-menu-item>
      </el-menu>
    </span>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Hamburger from "@/components/Hamburger"
import ThemePicker from "@/components/ThemePicker"
import LangSelector from "@/components/LangSelector"
import Action from "@/components/Toolbar/Action"
import NoticePanel from "@/views/Core/NoticePanel"
import MessagePanel from "@/views/Core/MessagePanel"
import PersonalPanel from "@/views/Core/PersonalPanel"
import { formatData }  from "@/utils/datetime"
import { getIFrameUrl, getIFramePath } from '@/utils/iframe'
export default {
  components:{
        Hamburger,
        ThemePicker,
        LangSelector,
        Action,
        NoticePanel,
        MessagePanel,
        PersonalPanel
  },
  data() {
    return {
      user: {
        name: "Louis",
        avatar: "",
        role: "超级管理员",
        registeInfo: "注册时间：2018-12-20 ",
        phone: ''
      },
      langVisible: false
    }
  },
  computed:{
    ...mapState({
      themeColor: state => state.app.themeColor,
      collapse: state => state.app.collapse,
      User: state => state.user.user,
    }),
    navMainTree: {
      get () { return this.$store.state.menu.navMainTree },
      set (val) { this.$store.commit('setMainNavTree', val) }
    },
    navTree: {
      get () { return this.$store.state.menu.navTree },
      set (val) { this.$store.commit('setNavTree', val) }
    },
    activeIndex: {
      get () { return this.$store.state.menu.activeIndex },
      set (val) { this.$store.commit('setActiveIndex', val) }
    },
  },
  methods: {
    openWindow(url) {
      window.open(url)
    },
    selectNavBar(key, keyPath){
      // console.log(key, keyPath);
      if(key !== '-1'){
        this.navTree = this.navMainTree[key].children;
      }else{
        this.navTree = this.navMainTree[0].children;
      }
    },
    // 折叠导航栏
    onCollapse: function() {
      this.$store.commit('onCollapse')
    },
    // 切换主题
    onThemeChange: function(themeColor) {
      this.$store.commit('setThemeColor', themeColor)
    },
    // 语言切换
    changeLanguage(lang) {
      lang === '' ? 'zh_cn' : lang
      this.$i18n.locale = lang
      this.langVisible = false
    },
    handleRoute (menu) {
      // 如果是嵌套页面，转换成iframe的path
      let path = getIFramePath(menu.url)
      if(!path) {
        path = menu.url
      }
      // 通过菜单URL跳转至指定路由
      this.$router.push("/" + path)
    },
  },
  created() {
    let user = sessionStorage.getItem("user");
    if (user) {
      this.$api.user.findAccount({'name':user}).then(res => {
        sessionStorage.setItem("role",res.bean.roleNames);
        sessionStorage.setItem("registeInfo",res.bean.insertDt);
        this.user.name = res.bean.nickname;
        this.user.avatar = require("@/assets/user.png");
        this.user.role = res.bean.roleNames;
        this.user.phone = res.bean.phone;
        this.user.registeInfo ='注册时间：' +formatData(Number(res.bean.insertDt));
      })
    }
  },
}
</script>

<style scoped lang="scss">
.headbar {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 999;
  height: 60px;
  line-height: 60px;
  min-width:1000px;
  border-color: rgba(180, 190, 190, 0.8);
  border-left-width: 1px;
  border-left-style: solid;
}
.hamburg, .navbar {
  float: left;
}
.toolbar {
  float: right;
}
.lang-item {
  font-size: 16px;
  padding-left: 8px;
  padding-top: 8px;
  padding-bottom: 8px;
  cursor: pointer;
}
.lang-item:hover {
  font-size: 18px;
  background: #b0d6ce4d;
}
.user-info {
  font-size: 20px;
  color: #fff;
  cursor: pointer;
  img {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    margin: 10px 0px 10px 10px;
    float: right;
  }
}
.badge {
  line-height: 18px;
}
.position-left {
  left: 200px;
}
.position-collapse-left {
  left: 65px;
}
</style>
