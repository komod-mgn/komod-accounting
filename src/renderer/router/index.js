import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export const ROUTE_NAME_CLIENTS = 'clients-page'
export const ROUTE_NAME_TRANSACTIONS = 'transactions-page'

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/transactions',
    },
    {
      path: '/clients',
      name: ROUTE_NAME_CLIENTS,
      component: require('@/views/ClientsPage').default,
    },
    {
      path: '/transactions',
      name: ROUTE_NAME_TRANSACTIONS,
      component: require('@/views/TransactionsPage').default,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
})

// router.afterEach((to, from) => {
//   console.debug('to', to)
//   console.debug('from', from)
// })

export default router
