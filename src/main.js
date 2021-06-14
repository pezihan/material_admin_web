import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import router from './router'

// element-ui样式
import 'element-ui/lib/theme-chalk/index.css'
import '@/plugins/element'

// 公共css样式
import '@/assets/css/global.css'

// 导入阿里图标
import '@/assets/fonts/iconfont.css'

// 导入 nprogress 顶部进度条条 包对应的js和css
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置管理系统请求的后端根路径
axios.defaults.baseURL = '/admin'
// 配置axios的request拦截器添加token验证,保证拥有获取数据的权限(在请求头中添加token属性)和添加 Nprogress 进度条 Nprogress.start()
axios.interceptors.request.use(config => {
  Nprogress.start() // 展示进度条
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 在 response Nprogress.done()
axios.interceptors.response.use(config => {
  Nprogress.done() // 隐藏进度条
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

// 时间转换（将毫秒转换成时间格式）
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear() // 年
  const m = (dt.getMonth() + 1 + '').padStart(2, '0') // 月
  const d = (dt.getDate() + '').padStart(2, '0') // 日

  const hh = (dt.getHours() + '').padStart(2, '0') // 小时
  const mm = (dt.getMinutes() + '').padStart(2, '0') // 分
  const ss = (dt.getSeconds() + '').padStart(2, '0') // 秒
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.filter('sexConvert', function (data) { // 过滤性别
  if (data === 0) {
    return '男'
  } else if (data === 1) {
    return '女'
  } else {
    return '未设置'
  }
})

Vue.filter('textFilter', function (data) {
  if (data === null || data === '') {
    return '未设置'
  }
  return data
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
