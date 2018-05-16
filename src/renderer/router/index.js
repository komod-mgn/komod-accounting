import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default,
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
