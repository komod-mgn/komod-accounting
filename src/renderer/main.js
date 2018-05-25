import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import axios from 'axios'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import ElementLocaleRu from 'element-ui/lib/locale/lang/ru-RU'

import App from './App'
import router from './router'
import store from './store'
import { dbGet } from './db'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

sync(store, router)

Vue.use(ElementUI, {
  locale: ElementLocaleRu,
})

;(async function () {
  // init vuex state from db
  store.commit('clients/UPDATE_STATE', await dbGet('clients'))
  store.commit('transactions/UPDATE_STATE', await dbGet('transactions'))

  /* eslint-disable no-new */
  new Vue({
    components: { App },
    router,
    store,
    template: '<App/>',
  }).$mount('#app')
})()
