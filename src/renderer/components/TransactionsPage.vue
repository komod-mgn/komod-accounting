<template>
  <the-table-page-view
    :item-base-properties="itemBaseProperties"
    :get-item-creation-template-model="getItemCreationTemplateModel"
    :store-module-name="storeModuleName"
    :route-name="routeName"
    :default-sort="defaultSort"
  >
    <template
      slot="creation-form-addon"
      slot-scope="{ model }"
    >
      <div
        class="formAddon__message"
        v-text="creationFormAddonMessage"
      />
    </template>

    <template
      slot="editing-form-addon"
      slot-scope="{ model }"
    >
      <div
        class="formAddon__message"
        v-text="editingFormAddonMessage"
      />
    </template>
  </the-table-page-view>
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'

import {
  QUERY_PARAM_ID,
} from '@/router/table-view-constants'
import { KomodTransaction } from '@/types/KomodTransaction'
import { stringifyKomodClient } from '@/types/KomodClient'
import TheTablePageView from '@/components/TheTablePageView'
import EventBus from '@/EventBus'
import { isDateInCurrentSeason } from '@/utils/date'
import { requiredFieldMessage, takenItemsExcessMessage } from '@/utils/validation'
import { ROUTE_NAME_TRANSACTIONS } from '@/router'

export default {
  name: 'TransactionsPage',

  components: {
    TheTablePageView,
  },

  /**
   * @return {ITablePageView}
   */
  data () {
    const self = this

    return {
      storeModuleName: 'transactions',
      routeName: ROUTE_NAME_TRANSACTIONS,

      defaultSort: {
        prop: 'date',
        order: 'descending',
      },

      itemBaseProperties: [
        {
          name: 'date',
          label: 'Дата',
          type: 'datetime',
          validationRules: [
            {
              required: true,
              trigger: ['blur', 'change'],
              message: requiredFieldMessage,
            },
          ],
          sortable: true,
          filterable: true,
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
          filterable: true,
          validationRules: [
            {
              required: true,
              trigger: ['blur', 'change'],
              message: requiredFieldMessage,
            },
          ],
          // При изменении клиента нужно перевалидировать поле "Кол-во вещей",
          // т.к. остаток от лимита у этого клиента может быть другой
          triggerRevalidation: true,
        },
        {
          name: 'itemsAmount',
          label: 'Кол-во вещей',
          type: 'number',
          min: 1,
          validationRules: [
            {
              validator (rule, fieldValue, callback, formModel) {
                const seasonInfo = self.getClientSeasonItemsInfo(
                  formModel.clientId,
                  // При редактировании транзакции имеющееся "Взятое кол-во"
                  // не должно учитываться во взятом за сезон
                  formModel.id,
                )

                if (fieldValue > seasonInfo.remaining) {
                  callback(new Error(takenItemsExcessMessage))
                } else {
                  callback()
                }
              },
              trigger: ['blur', 'change'],
            },
          ],
          sortable: true,
        },
        {
          name: 'comment',
          label: 'Комментарий',
          type: 'string',
          minWidth: 100,
          filterable: true,
        },
      ],

      globalEventHandlers: {
        'form-change': this.handleItemFormChange.bind(this),
      },

      creationFormAddonMessage: '',
      editingFormAddonMessage: '',
    }
  },

  computed: {
    ...mapGetters({
      clientsMap: 'clients/itemsMap',
      transactionsMap: 'transactions/itemsMap',
      currentSeasonItemsAmountByClient: 'transactions/currentSeasonItemsAmountByClient',
    }),
  },

  created () {
    _.forEach(this.globalEventHandlers, (handler, event) => {
      EventBus.$on(event, handler)
    })
  },

  beforeDestroy () {
    _.forEach(this.globalEventHandlers, (handler, event) => {
      EventBus.$off(event, handler)
    })
  },

  methods: {
    getItemCreationTemplateModel () {
      return new KomodTransaction()
    },

    handleItemFormChange ({ formName, model }) {
      // Add message to the form about how many items
      // current transaction can have based on client's limit and history
      if (formName === `${this.storeModuleName}/creation`) {
        // Client is unset or not yet set
        if (!model.clientId) {
          this.creationFormAddonMessage = ''

          return
        }

        const seasonInfo = this.getClientSeasonItemsInfo(model.clientId, model.id)

        this.creationFormAddonMessage =
          `У выбранного клиента осталось ${seasonInfo.remaining} вещей из ${seasonInfo.limit}`
      } else if (formName === `${this.storeModuleName}/editing`) {
        // Client is unset or not yet set
        if (!model.clientId) {
          this.editingFormAddonMessage = ''

          return
        }

        if (model.clientId && !this.clientsMap[model.clientId]) {
          this.editingFormAddonMessage = 'Выбранный клиент был удален из базы данных'

          return
        }

        const seasonInfo = this.getClientSeasonItemsInfo(model.clientId, model.id)

        this.editingFormAddonMessage =
          `У выбранного клиента осталось ${seasonInfo.remaining} вещей из ${seasonInfo.limit}`
      }
    },

    /**
     * @param {string} clientId
     * @param {string =} editedTransactionId
     * @return {{limit: number, remaining: number}}
     */
    getClientSeasonItemsInfo (clientId, editedTransactionId) {
      const limit = this.clientsMap[clientId]
        ? this.clientsMap[clientId].seasonItemsLimit
        : 0

      let taken = this.currentSeasonItemsAmountByClient[clientId] || 0

      // При редактировании существующей транзакции текущго сезона,
      // её `itemsAmount` включается во "взятое кол-во".
      // Для UI и валидации, схожими с созданием транзакции,
      // сделаем "Осталось" без учета текущего значения
      if (editedTransactionId) {
        const editedTransaction = this.transactionsMap[editedTransactionId]

        if (editedTransaction && isDateInCurrentSeason(editedTransaction.date)) {
          taken -= editedTransaction.itemsAmount
        }
      }

      return {
        limit,
        remaining: limit - taken,
      }
    },
  },
}
</script>

<style scoped>
  .formAddon__message {
    text-align: center;
    margin-bottom: 20px;
  }
</style>
