import Vue from 'vue'
import Router from 'vue-router'
import Cookies from "js-cookie"
import Generator from '@/views/Generator/Generator'
import api from '@/http/api'
import store from '@/store'
import { getIFramePath, getIFrameUrl } from '@/utils/iframe'
import wapRouter from "./wapRouter";
const NotFound = () => import('@/views/Error/404');
const Intro = () => import('@/views/Intro/Intro');
const Home = () => import('@/views/Home');
const Login = () => import('@/views/Login');
const QuestFilter = () => import('@/components/ObjectSelect/QuestFilter');
const Test = () => import('@/views/Test/Index');

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: '首页',
      component: Home,
      children: [
        {
          path: '',
          name: '系统介绍',
          redirect:{name:'教学课程'},
          component: Intro,
          meta: {
            icon: 'fa fa-home fa-lg',
            index: 0
          }
        }
      ]
    },
    {
      path: '/login',
      name: '登录',
      component: Login
    },
    {
      path: '/test',
      name: 'test',
      component: Test
    },
    {
      path: '/404',
      name: 'notFound',
      component: NotFound
    },
    {
      path: '/liveStreaming',
      name: 'liveStreaming',
      component: () => import('@/views/Test/LiveStreaming'),
    },
    {
      path: '/test',
      name: 'test',
      component: QuestFilter
    },
    // 移动端路由
    wapRouter

  ]
})

router.beforeEach((to, from, next) => {
  // 登录界面登录成功之后，会把用户信息保存在会话
  // 存在时间为会话生命周期，页面关闭即失效。
  let token = Cookies.get('token')
  let userName = sessionStorage.getItem('user')
  if (to.path === '/login' || to.path === '/wap/login') {
    // 如果是访问登录界面，如果用户会话信息存在，代表已登录过，跳转到主页
    next()
  }else{
    let wapPath = to.path.split('/')[1];
    if (!userName ) {
      // 如果访问非登录界面，且户会话信息不存在，代表未登录，则跳转到登录界面
      // Vue.prototype.$message({
      //   message:'登录信息失效！',
      //   type:'error'
      // })
      if(wapPath === 'wap'){
        next({ path: '/wap/login' })
      }else{
        next({ path: '/login' })
      }
    } else {
      // 加载动态菜单和路由
      addDynamicMenuAndRoutes(userName, to, from)
      next()
    }
  }
})

/**
* 加载动态菜单和路由
*/
function addDynamicMenuAndRoutes(userName, to, from) {
  // 处理IFrame嵌套页面
  handleIFrameUrl(to.path)
  if(store.state.app.menuRouteLoaded) {
    // console.log('动态菜单和路由已经存在.')
    return
  }
  api.menu.findNavTree({'userName':userName})
  .then(res => {
    // 添加动态路由
    let dynamicRoutes = addDynamicRoutes(res.result.menuTree)
    // 处理静态组件绑定路由
    handleStaticComponent(router, dynamicRoutes)
    router.addRoutes(router.options.routes)
    // 保存加载状态
    store.commit('menuRouteLoaded', true)
    // 保存菜单树
    // 管理员 5d02071a8e3ef23c2518b59a
    // 教师 5d05a46cea0fb73873e6ce34
    // 学生 5d303a6ce7675a1173e84de2
    // api.user.getTodoList().then((result) => {
    //   let navTree=res.result.menuTree.map( item =>{
    //     item.children.map( ite =>{
    //       if (ite.name === '我的课程' && res.bean.roleIdList.includes('5d02071a8e3ef23c2518b59a')) {
    //         ite.value=result.bean.unReviewCourse.total;
    //       }else if(ite.name === '试卷/习题'){
    //         if(res.bean.roleIdList.includes('5d303a6ce7675a1173e84de2')){
    //           ite.value=result.bean.unCommitExamResult;
    //         }else if(res.bean.roleIdList.includes('5d05a46cea0fb73873e6ce34')){
    //           ite.value=result.bean.unPublishExamPaper.total;
    //         }else{
    //           ite.value=0
    //         }
    //       }else if(ite.name === '阅卷中心' && res.bean.roleIdList.includes('5d05a46cea0fb73873e6ce34')){
    //         ite.value=result.bean.unReviewExamResult.total;
    //       }else if(ite.name === '实验记录'){
    //         ite.value=result.bean.doingExpResult.total;
    //       }else{
    //         ite.value=0
    //       }
    //       return ite;
    //     });
    //     return item;
    //   });
    //   // store.commit('setNavTree', navTree[0].children);
    //
    // });

    let path = router.apps[0]._route.fullPath;
    if(res.result.menuTree.length>0 && path.split('/')[1] !== 'wap'){
      const pathIndex = res.result.menuTree.findIndex(v => v.code === path.split('/')[1])
      if (pathIndex > -1) {
        store.commit('setActiveIndex', pathIndex)
        store.commit('setNavTree', res.result.menuTree[pathIndex].children)
      } else {
        store.commit('setActiveIndex', 0)
        store.commit('setNavTree', res.result.menuTree[0].children)
      }
    }
    store.commit('setMainNavTree', res.result.menuTree)
    let perms=[];
    perms=res.result.perms;
    perms.push('');
    store.commit('setPerms', perms);
  })
  .catch(function(err) {
    throw err
  })
}

/**
 * 处理路由到本地直接指定页面组件的情况
 * 比如'代码生成'是要求直接绑定到'Generator'页面组件
 */
function handleStaticComponent(router, dynamicRoutes) {
  for(let j=0;j<dynamicRoutes.length; j++) {
    if(dynamicRoutes[j].name == '代码生成') {
      dynamicRoutes[j].component = Generator
      break
    }
  }
  router.options.routes[0].children = router.options.routes[0].children.concat(dynamicRoutes)
}

/**
 * 处理IFrame嵌套页面
 */
function handleIFrameUrl(path) {
  // 嵌套页面，保存iframeUrl到store，供IFrame组件读取展示
  let url = path
  let length = store.state.iframe.iframeUrls.length
  for(let i=0; i<length; i++) {
    let iframe = store.state.iframe.iframeUrls[i]
    if(path != null && path.endsWith(iframe.path)) {
      url = iframe.url
      store.commit('setIFrameUrl', url)
      break
    }
  }
}

/**
* 添加动态(菜单)路由
* @param {*} menuList 菜单列表
* @param {*} routes 递归创建的动态(菜单)路由
*/
function addDynamicRoutes (menuList = [], routes = []) {
 var temp = []
 for (var i = 0; i < menuList.length; i++) {
   if (menuList[i].children && menuList[i].children.length >= 1) {
     temp = temp.concat(menuList[i].children)
   } else if (menuList[i].url && /\S/.test(menuList[i].url)) {
      menuList[i].url = menuList[i].url.replace(/^\//, '')
      // 创建路由配置
      var route = {
        path: menuList[i].url,
        component: null,
        name: menuList[i].name,
        meta: {
          icon: menuList[i].icon,
          index: menuList[i].id
        }
      }
      let path = getIFramePath(menuList[i].url)
      if (path) {
        // 如果是嵌套页面, 通过iframe展示
        route['path'] = path
        route['component'] = resolve => require([`@/views/IFrame/IFrame`], resolve)
        // 存储嵌套页面路由路径和访问URL
        let url = getIFrameUrl(menuList[i].url)
        let iFrameUrl = {'path':path, 'url':url}

        store.commit('addIFrameUrl', iFrameUrl)
      } else {
       try {

         // 根据菜单URL动态加载vue组件，这里要求vue组件须按照url路径存储
         // 如url="sys/user"，则组件路径应是"@/views/sys/user.vue",否则组件加载不到
         let array = menuList[i].url.split('/')
         let url = ''
         for(let i=0; i<array.length; i++) {
            url += array[i].substring(0,1).toUpperCase() + array[i].substring(1) + '/'
         }
         url = url.substring(0, url.length - 1);
         route['component'] = () => import(`@/views/${url}`);
         // route['component'] = resolve => require([`@/views/${url}`], resolve)

       } catch (e) {}
     }
     routes.push(route)
   }
 }

 if (temp.length >= 1) {
   routes.push({
     path:'paper/examDetail',
     component: () => import('@/views/Paper/ExamDetail'),
     name: '考试试卷',
     meta: {
       icon: 'el-icon-tableware',
       index: 100
     }
   },{
     path:'sys/userdetail/:id',
     component: () => import('@/views/Sys/UserDetail'),
     name: '用户中心',
     meta: {
       icon: 'el-icon-user-solid',
       index: 100
     }
   });
   addDynamicRoutes(temp, routes)
 } else {
   // console.log('动态路由加载...')
   // console.log(routes)
   console.log('动态路由加载完成.')
 }
 return routes
}

export default router
