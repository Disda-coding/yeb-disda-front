import Vue from 'vue'
import App from './App.vue'
import store from "@/store";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import 'font-awesome/css/font-awesome.min.css'


import {postRequest} from "@/utils/api";
import {putRequest} from "@/utils/api";
import {getRequest} from "@/utils/api";
import {deleteRequest} from "@/utils/api";
import {initMenu} from "@/utils/menus";
import {downloadRequest} from "@/utils/download";
import router from "@/router";

Vue.config.productionTip = true
// 默认使用small size
Vue.use(ElementUI,{size:'small'});
// 插件形式使用请求
Vue.prototype.postRequest = postRequest
Vue.prototype.putRequest = putRequest
Vue.prototype.getRequest = getRequest
Vue.prototype.deleteRequest = deleteRequest
Vue.prototype.downloadRequest = downloadRequest // 以插件的形式使用下载相关请求


// 使用 router.beforeEach 注册一个全局前置守卫
// 个人理解有点像是拦截器
router.beforeEach((to, from, next) => {
  // to 要去的路由; from 来自哪里的路由 ; next() 放行
  // 用户登录成功时，把 token 存入 sessionStorage，如果携带 token，初始化菜单，放行
  if (window.sessionStorage.getItem('tokenStr')) {
    initMenu(router, store)
    // 如果用户不存在
    if (!window.sessionStorage.getItem('user')) {
      // 判断用户信息是否存在
      return getRequest('/admin/info').then(resp => {
        if (resp.data) {
          // 存入用户信息，转字符串，存入 sessionStorage
          window.sessionStorage.setItem('user', JSON.stringify(resp.data))
          // 同步用户信息 编辑用户
          store.commit('INIT_ADMIN',resp.data)
          next();
        }
      })
    }
    next();
  } else {
    if (to.path === '/' || to.path === '/login'|| to.path === '/register' || to.path === '/forgot') {
      next();
    } else {
      next('/?redirect=' + to.path);
    }
  }
})

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
