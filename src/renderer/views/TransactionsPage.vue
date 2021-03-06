<template>
  <the-table-page-view
    :view="tablePageView"
    :get-item-creation-template-model="getItemCreationTemplateModel"
    :get-computed-property-value="getComputedPropertyValue"
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
import {
  mapState,
  mapGetters,
} from 'vuex'

import {
  QUERY_PARAM_ID,
} from '@/router/table-view-constants'
import { KomodTransaction } from '@/types/KomodTransaction'
import { stringifyKomodClient } from '@/types/KomodClient'
import TheTablePageView from '@/components/TheTablePageView'
import EventBus from '@/EventBus'
import {
  isDateInCurrentSeason,
  defaultDatetimeTableFormatter,
  repeatedDayDatetimeTableFormatter,
} from '@/utils/date'
import {
  requiredFieldMessage,
  takenItemsExcessMessage,
} from '@/utils/validation'
import { ROUTE_NAME_TRANSACTIONS } from '@/router'

export default {
  name: 'TransactionsPage',

  components: {
    TheTablePageView,
  },

  /**
   * @return {{tablePageView: ITablePageView}}
   */
  data () {
    const self = this

    const clientIdRefFormatter = (client) => {
      // Добавить в лейбл в контроле номер удостоверения,
      // в том числе для возможности поиска в выпадающем списке по нему
      const idDocPostfix = client && client.idDocument
        ? ` (уд. ${client.idDocument})`
        : ''

      return stringifyKomodClient(client) + idDocPostfix
    }

    return {
      tablePageView: {
        storeModuleName: 'transactions',
        routeName: ROUTE_NAME_TRANSACTIONS,

        hideIndex: true,

        defaultSort: {
          prop: 'date',
          order: 'descending',
        },

        itemBaseProperties: [
          {
            name: 'date',
            label: 'Дата',
            type: 'datetime',
            tableFormatter: ({ value, elUiCellScope, fieldView }) => {
              // Для визуальной "группировки" строк одного и того же дня
              // выводим полную дату только для строки, в которой день
              // встречается первый раз на странице.
              // Т.е. для первой строки, и для строк, день даты которых
              // отличается от дня даты предыдущей строки.
              // Для остальных выводим только время, отступая пробелами
              // на ширину дневной части даты.

              if (elUiCellScope.$index === 0) {
                return defaultDatetimeTableFormatter(value)
              }

              if (elUiCellScope.$index > 0) {
                const prevRowDate = new Date(
                  elUiCellScope.store.states.data[elUiCellScope.$index - 1][fieldView.name]
                )
                const curRowDate = new Date(value)

                if (curRowDate.toDateString() !== prevRowDate.toDateString()) {
                  return defaultDatetimeTableFormatter(value)
                }
              }

              return repeatedDayDatetimeTableFormatter(value)
            },
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
            get optionsArr () {
              const clients = Object.values(self.clientsSortedLastNameAsc)
                .map(client => ({
                  key: client.id,
                  value: client.id,
                  label: clientIdRefFormatter(client),
                }))

              return clients
            },
            // Для `optionsArr` не используется
            controlFormatter: clientIdRefFormatter,
            tableFormatter: ({ value }) => {
              return stringifyKomodClient(this.clients[value])
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

            // TODO раскостылить
            addCreateClientHackButton: true,
          },
          {
            name: 'itemsAmount',
            label: 'Кол-во вещей',
            type: 'number',
            min: 0,
            validationRules: [
              {
                required: true,
                trigger: ['blur', 'change'],
                message: requiredFieldMessage,
              },
              {
                validator (rule, fieldValue, callback, formModel) {
                  const seasonInfo = self.getClientSeasonItemsInfo(
                    formModel.clientId,
                    // При редактировании транзакции имеющееся "Взятое кол-во"
                    // не должно учитываться во взятом за сезон
                    formModel.id,
                  )

                  if (
                    isDateInCurrentSeason(formModel.date) &&
                    fieldValue > seasonInfo.remaining
                  ) {
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

        itemComputedTableProperties: [
          {
            name: 'dayOrderNumber',
            label: '#',
            type: 'number',
            width: 60,
            align: 'center',
            sortable: false,
            filterable: false,
          },
        ],

        customTablePropertiesOrder: [
          'dayOrderNumber',
          'date',
          'clientId',
          'itemsAmount',
          'comment',
        ],

        customFilterPropertiesOrder: [
          'clientId',
          'date',
          'comment',
        ],
      },

      globalEventHandlers: {
        'form-change': this.handleItemFormChange.bind(this),
      },

      creationFormAddonMessage: '',
      editingFormAddonMessage: '',
    }
  },

  computed: {
    ...mapState({
      // Модули с одноименными словарями внутри
      transactions: state => state.transactions.transactions,
      clients: state => state.clients.clients,
    }),
    ...mapGetters({
      clientsSortedLastNameAsc: 'clients/clientsSortedLastNameAsc',
      currentSeasonItemsAmountByClient: 'transactions/currentSeasonItemsAmountByClient',
      dayOrderNumbersByTransaction: 'transactions/dayOrderNumbersByTransaction',
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

    getComputedPropertyValue (item, property) {
      switch (property) {
        case 'dayOrderNumber':
          return this.dayOrderNumbersByTransaction[item.id]
      }
    },

    handleItemFormChange ({ formName, model }) {
      // Add message to the form about how many items
      // current transaction can have based on client's limit and history
      if (formName === `${this.tablePageView.storeModuleName}/creation`) {
        // Client is unset or not yet set
        if (!model.clientId) {
          this.creationFormAddonMessage = ''

          return
        }

        if (isDateInCurrentSeason(model.date)) {
          const seasonInfo = this.getClientSeasonItemsInfo(model.clientId, model.id)

          this.creationFormAddonMessage =
            `У выбранного клиента осталось ${seasonInfo.remaining} вещей из ${seasonInfo.limit}`
        } else {
          this.creationFormAddonMessage =
            'Расчет и проверка доступного количества вещей на сезон доступны только для текущего сезона'
        }
      } else if (formName === `${this.tablePageView.storeModuleName}/editing`) {
        // Client is unset or not yet set
        if (!model.clientId) {
          this.editingFormAddonMessage = ''

          return
        }

        if (model.clientId && !this.clients[model.clientId]) {
          this.editingFormAddonMessage = 'Выбранный клиент был удален из базы данных'

          return
        }

        if (isDateInCurrentSeason(model.date)) {
          const seasonInfo = this.getClientSeasonItemsInfo(model.clientId, model.id)

          this.editingFormAddonMessage =
            `У выбранного клиента осталось ${seasonInfo.remaining} вещей из ${seasonInfo.limit}`
        } else {
          this.editingFormAddonMessage =
            'Расчет и проверка доступного количества вещей на сезон доступны только для текущего сезона'
        }
      }
    },

    /**
     * @param {string} clientId
     * @param {string =} editedTransactionId
     * @return {{limit: number, remaining: number}}
     */
    getClientSeasonItemsInfo (clientId, editedTransactionId) {
      const limit = this.clients[clientId]
        ? this.clients[clientId].seasonItemsLimit
        : 0

      let taken = this.currentSeasonItemsAmountByClient[clientId] || 0

      // При редактировании существующей транзакции текущго сезона,
      // её `itemsAmount` включается во "взятое кол-во".
      // Для UI и валидации, схожими с созданием транзакции,
      // сделаем "Осталось" без учета текущего значения
      if (editedTransactionId) {
        const editedTransaction = this.transactions[editedTransactionId]

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
