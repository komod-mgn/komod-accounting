<template>
  <div>
    <the-table-page-view
      :item-base-properties="itemBaseProperties"
      :get-item-creation-template-model="getItemCreationTemplateModel"
      store-module-name="transactions"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  QUERY_PARAM_ID,
} from '@/router/table-view-constants'
import { KomodTransaction } from '@/types/KomodTransaction'
import { stringifyKomodClient } from '@/types/KomodClient'
import TheTablePageView from '@/components/TheTablePageView'

export default {
  name: 'TransactionsPage',

  components: {
    TheTablePageView,
  },

  data () {
    const self = this

    return {
      /** @type {Array<IPropertyBaseView>} */
      itemBaseProperties: [
        {
          name: 'date',
          label: 'Дата',
          type: 'datetime',
        },
        {
          name: 'clientId',
          label: 'Клиент',
          type: 'ref',
          get optionsMap () {
            return self.clientsMap
          },
          controlFormatter: (obj) => {
            return stringifyKomodClient(obj)
          },
          tableFormatter: (row, col, id) => {
            return stringifyKomodClient(this.clientsMap[id])
          },
          hrefModuleName: 'clients',
          hrefQueryIdParam: QUERY_PARAM_ID,
        },
        {
          name: 'itemsAmount',
          label: 'Кол-во вещей',
          type: 'number',
        },
      ],
    }
  },

  computed: {
    ...mapGetters({
      clientsMap: 'clients/itemsMap',
    }),
  },

  methods: {
    getItemCreationTemplateModel () {
      return new KomodTransaction()
    },
  },
}
</script>

<style scoped>

</style>
