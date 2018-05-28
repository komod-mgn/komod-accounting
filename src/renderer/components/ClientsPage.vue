<template>
  <div>
    <the-table-page-view
      :item-base-properties="itemBaseProperties"
      :item-computed-properties="itemComputedProperties"
      :get-item-creation-template-model="getItemCreationTemplateModel"
      :get-computed-property-value="getComputedPropertyValue"
      store-module-name="clients"
    />
  </div>
</template>

<script>
import {
  groupBy,
  mapValues,
  sortBy,
  last,
} from 'lodash-es'
import { KomodClient, KomodClientStatusEnum } from '@/types/KomodClient'
import TheTablePageView from '@/components/TheTablePageView'

export default {
  name: 'ClientsPage',

  components: {
    TheTablePageView,
  },

  data: () => ({
    /** @type {Array<IPropertyBaseView>} */
    itemBaseProperties: [
      {
        name: 'lastName',
        label: 'Фамилия',
        type: 'string',
        minWidth: 100,
        fixedToSide: 'left',
      },
      {
        name: 'firstName',
        label: 'Имя',
        type: 'string',
        minWidth: 100,
        fixedToSide: 'left',
      },
      {
        name: 'middleName',
        label: 'Отчество',
        type: 'string',
        minWidth: 100,
      },
      {
        name: 'status',
        label: 'Статус',
        type: 'enum',
        minWidth: 150,
        multiple: true,
        optionsMap: KomodClientStatusEnum,
        tableFormatter: (row, col, vals) => vals
          .map(val => KomodClientStatusEnum[val])
          .join(', '),
      },
      {
        name: 'idDocument',
        label: 'Удостоверение №',
        type: 'string',
        minWidth: 150,
      },
      {
        name: 'phoneNumber',
        label: 'Телефон',
        type: 'string',
        minWidth: 100,
      },
      {
        name: 'seasonItemsLimit',
        label: 'Норма на сезон',
        type: 'number',
        minWidth: 90,
        min: 0,
      },
    ],

    /** @type {Array<IPropertyBaseView>} */
    itemComputedProperties: [
      {
        name: 'itemsAmountCurrentSeason',
        label: 'Кол-во взятых вещей (сезон)',
        type: 'number',
        minWidth: 100,
      },
      {
        name: 'itemsAmountTotal',
        label: 'Кол-во взятых вещей (всего)',
        type: 'number',
        minWidth: 100,
      },
      {
        name: 'lastTransactionDate',
        label: 'Последнее посещение',
        type: 'datetime',
        minWidth: 200,
      },
    ],
  }),

  computed: {
    transactionsMapByClient () {
      return groupBy(this.$store.state.transactions.items, 'clientId')
    },
    transactionsMapByClientSortedByDate () {
      return mapValues(
        this.transactionsMapByClient,
        transactions => sortBy(transactions, 'date')
      )
    },
  },

  methods: {
    getItemCreationTemplateModel () {
      return new KomodClient()
    },

    getComputedPropertyValue (item, property) {
      switch (property) {
        case 'lastTransactionDate':
          const lastTransaction = last(this.transactionsMapByClientSortedByDate[item.id])
          return lastTransaction
            ? lastTransaction.date
            : undefined
      }
    },
  },
}
</script>

<style scoped>

</style>
