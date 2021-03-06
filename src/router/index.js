import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Category from '../components/goods/Cate.vue'

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
    component: Home,
    redirect: '/welcome',
    children: [{
        component: Welcome,
        path: '/welcome'
      },
      {
        component: Users,
        path: '/users'
      },
      {
        component: Rights,
        path: '/rights'
      },
      {
        component: Roles,
        path: '/roles'
      },
      {
        component: Category,
        path: '/categories'
      }
    ]
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
