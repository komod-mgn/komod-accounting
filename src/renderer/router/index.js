import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/clients',
    },
    {
      path: '/clients',
      name: 'clients-page',
      component: require('@/components/ClientsPage').default,
    },
    {
      path: '/transactions',
      name: 'transactions-page',
      component: require('@/components/TransactionsPage').default,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
})
