<template>
  <the-table-page-view
    :view="tablePageView"
    :get-item-creation-template-model="getItemCreationTemplateModel"
    :get-computed-property-value="getComputedPropertyValue"
  />
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'

import { KomodClient } from '@/types/KomodClient'
import TheTablePageView from '@/components/TheTablePageView'
import ClientsPageView from './ClientsPageView'

export default {
  name: 'ClientsPage',

  components: {
    TheTablePageView,
  },

  /**
   * @return {{tablePageView: ITablePageView}}
   */
  data () {
    return {
      tablePageView: ClientsPageView,
    }
  },

  computed: {
    ...mapGetters({
      currentSeasonItemsAmountByClient: 'transactions/currentSeasonItemsAmountByClient',
      transactionsByClientSortedDateDesc: 'transactions/transactionsByClientSortedDateDesc',
    }),
  },

  methods: {
    getItemCreationTemplateModel () {
      return new KomodClient()
    },

    getComputedPropertyValue (item, property) {
      switch (property) {
        case 'itemsAmountCurrentSeason':
          return this.currentSeasonItemsAmountByClient[item.id] || 0

        case 'itemsAmountTotal':
          return _.sumBy(
            this.transactionsByClientSortedDateDesc[item.id],
            'itemsAmount',
          )

        case 'lastTransactionDate':
          const clientTransactions = this.transactionsByClientSortedDateDesc[item.id]
          const lastTransaction = clientTransactions ? clientTransactions[0] : null
          return lastTransaction
            ? lastTransaction.date
            : '' // same data type for sorting
      }
    },
  },
}
</script>

<style scoped>

</style>
