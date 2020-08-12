import 'babel-polyfill';
import 'es6-promise/auto'
import Vue from 'vue'
import App from './App'
import router from './router'
import api from './http'
import i18n from './i18n'
import store from './store'
import _ from 'lodash'
import global from '@/utils/global'
// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'
import 'font-awesome/css/font-awesome.min.css'
import '@/assets/iconfont/iconfont.css'
import '@/assets/css/commen.css'
import {errorHandler} from "./utils/error";
import Tip from "./components/Tip";

// Import Froala Editor css files.
require('froala-editor/js/froala_editor.pkgd.min')
require('froala-editor/css/froala_editor.pkgd.min.css')
require('font-awesome/css/font-awesome.css')
require('froala-editor/css/froala_style.min.css')
//引入中文语言包
require('froala-editor/js/languages/zh_cn')
// Vue.use(ElementUI)
Vue.use(api)

// //打印组件
import Print from './assets/print.js'
Vue.use(Print);  //注册

import echarts from "echarts";
Vue.prototype.$echarts = echarts;

import jquery from 'jquery'
window.$ = jquery;
window.jquery = jquery;

// Import and use Vue Froala lib.
import VueFroala from 'vue-froala-wysiwyg'
Vue.use(VueFroala)

Vue.prototype.global = global;
Vue.prototype._ = _;

// 注册全局组件
Vue.component("tip", Tip);
let vue = new Vue({
  el: '#app',
  i18n,
  router,
  store,
  render: h => h(App)
});

Vue.config.errorHandler = errorHandler;
Vue.prototype.$throw = (error)=> errorHandler(error,this); //异步时 手动抛出异常调用，否则无法处理
export default vue
