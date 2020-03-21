import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const routes = [{
  path: '/',
  component: Login
},
{
  path: '/login',
  component: Login
}, {
  path: '/home',
  component: Home
}

]

const router = new VueRouter({
  routes
})
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    next()
    return
  }
  if (!window.sessionStorage.getItem('token')) {
    next('/login')
    return
  }
  next()
})
export default router
