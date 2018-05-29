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
  orderBy,
  sumBy,
} from 'lodash-es'
import { KomodClient, KomodClientStatusEnum } from '@/types/KomodClient'
import TheTablePageView from '@/components/TheTablePageView'

/**
 * @param {Date} date
 * @return {Date}
 */
function getSeasonStartDateByDate (date) {
  const year = date.getFullYear()
  const month = date.getMonth()

  const SEASON_LENGTH = 3
  const SPRING_START = 2 // March in zero-based
  const SUMMER_START = SPRING_START + SEASON_LENGTH
  const AUTUMN_START = SUMMER_START + SEASON_LENGTH
  const WINTER_START = AUTUMN_START + SEASON_LENGTH

  if (month < SPRING_START) {
    return new Date(year - 1, WINTER_START)
  } else if (month < SUMMER_START) {
    return new Date(year, SPRING_START)
  } else if (month < AUTUMN_START) {
    return new Date(year, SUMMER_START)
  } else if (month < WINTER_START) {
    return new Date(year, AUTUMN_START)
  } else {
    return new Date(year, WINTER_START)
  }
}

const currentSeasonStartDateISO = getSeasonStartDateByDate(new Date()).toISOString()

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
    transactionsMapByClientSortedByDateDesc () {
      const transactionsMapByClient = groupBy(
        this.$store.state.transactions.items,
        'clientId',
      )

      return mapValues(
        transactionsMapByClient,
        transactions => orderBy(transactions, ['date'], ['desc'])
      )
    },

    currentSeasonItemsAmountByClient () {
      return mapValues(
        this.transactionsMapByClientSortedByDateDesc,
        transactions => {
          let sum = 0

          for (const transaction of transactions) {
            // Transactions are sorted from recent to old,
            // and once a transaction is older than season start,
            // it is and all the next are irrelevant
            if (transaction.date < currentSeasonStartDateISO) {
              break
            }

            sum += transaction.itemsAmount
          }

          return sum
        }
      )
    },
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
          return sumBy(this.transactionsMapByClientSortedByDateDesc[item.id], 'itemsAmount')

        case 'lastTransactionDate':
          const clientTransactions = this.transactionsMapByClientSortedByDateDesc[item.id]
          const lastTransaction = clientTransactions ? clientTransactions[0] : null
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
