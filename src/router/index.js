import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login.vue'
import Home from '@/components/Home.vue'
import Welcome from '@/components/Welcome.vue'
import AllAccount from '@/views/admin/AllAccount.vue'
import AllScene from '@/views/scene/AllScene.vue'
import Keyword from '@/views/scene/Keyword.vue'
import SceneCrawling from '@/views/scene/SceneCrawling.vue'
import AllTag from '@/views/tag/AllTag.vue'
import AllUser from '@/views/user/AllUser.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/allAccount', component: AllAccount },
      { path: '/allScene', component: AllScene },
      { path: '/keyword', component: Keyword },
      { path: '/sceneCrawling', component: SceneCrawling },
      { path: '/allTag', component: AllTag },
      { path: '/AllUser', component: AllUser }
    ]
  }
]

const router = new VueRouter({
  // mode: 'history',
  // base: process.env.BASE_URL,
  routes
})

// 挂载路由守卫 控制没有登录状态直接跳转到登录页
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从那个路径跳转过来
  // next 是一个函数，next()表示放行  next('xxx') 表示强制跳转
  if (to.path === '/') return next()
  // 获取浏览器中的token进行认证
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/')
  next()
})

export default router
