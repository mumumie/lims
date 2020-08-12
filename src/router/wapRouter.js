const wapRouter = {
  path: '/wap',
  name: 'wap',
  component: () => import('@/views/Wap/Home'),
  redirect: '/wap/home',
  children:[
    {
      path:'practice',
      name:'practice',
      component:() => import('@/views/Wap/testing/Practice')
    },
    {
      path: 'home',
      name: 'home',
      component: () => import('@/views/Wap/Index')
    },
    {
      path: 'doPractice',
      name: 'doPractice',
      component: () => import('@/views/Wap/testing/DoPractice')
    },
    {
      path: 'login',
      name: 'wapLogin',
      component: () => import('@/views/Wap/Login')
    },
    {
      path:'my',
      name:'my',
      component:() => import('@/views/Wap/my/My')
    },
    {
      path:'selfPractice',
      name:'selfPractice',
      component:() => import('@/views/Wap/my/SelfPractice')
    },
    {
      path:'selfHistory',
      name:'selfHistory',
      component:() => import('@/views/Wap/my/SelfHistory')
    },
    {
      path:'selfPracticeDetail',
      name:'selfPracticeDetail',
      component:() => import('@/views/Wap/my/SelfPracticeDetail')
    },
    {
      path:'exam',
      name:'exam',
      component:() => import('@/views/Wap/exam')
    },
    {
      path:'exam-detail/:id',
      name:'exam-detail',
      component:() => import('@/views/Wap/exam/examDetail')
    },
  ]
}
export default wapRouter
