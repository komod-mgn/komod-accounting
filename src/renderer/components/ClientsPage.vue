<template>
  <the-table-page-view
    :item-base-properties="itemBaseProperties"
    :item-computed-table-properties="itemComputedTableProperties"
    :get-item-creation-template-model="getItemCreationTemplateModel"
    :get-computed-property-value="getComputedPropertyValue"
    store-module-name="clients"
  />
</template>

<script>
import {
  sumBy,
} from 'lodash-es'
import { mapGetters } from 'vuex'
import { KomodClient, KomodClientStatusEnum } from '@/types/KomodClient'
import TheTablePageView from '@/components/TheTablePageView'
import { requiredFieldMessage } from '@/utils/validation'

export default {
  name: 'ClientsPage',

  components: {
    TheTablePageView,
  },

  data () {
    return {
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
          validationRules: [
            {
              required: true,
              trigger: ['blur', 'change'],
              message: requiredFieldMessage,
            },
          ],
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
          min: 1,
        },
      ],

      /** @type {Array<IPropertyBaseView>} */
      itemComputedTableProperties: [
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
    }
  },

  computed: {
    ...mapGetters({
      currentSeasonItemsAmountByClient: 'transactions/currentSeasonItemsAmountByClient',
      transactionsMapByClientSortedByDateDesc: 'transactions/itemsMapByClientSortedByDateDesc',
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
          return sumBy(
            this.transactionsMapByClientSortedByDateDesc[item.id],
            'itemsAmount',
          )

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
