<template>
  <div>
    <the-table-page-view
      :item-base-properties="itemBaseProperties"
      :get-item-creation-template-model="getItemCreationTemplateModel"
      :store-module-name="storeModuleName"
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
  </div>
</template>

<script>
import {
  forEach,
} from 'lodash-es'
import { mapGetters } from 'vuex'
import {
  QUERY_PARAM_ID,
} from '@/router/table-view-constants'
import { KomodTransaction } from '@/types/KomodTransaction'
import { stringifyKomodClient } from '@/types/KomodClient'
import TheTablePageView from '@/components/TheTablePageView'
import EventBus from '@/EventBus'
import { isDateInCurrentSeason } from '@/utils/date'

export default {
  name: 'TransactionsPage',

  components: {
    TheTablePageView,
  },

  data () {
    const self = this

    return {
      storeModuleName: 'transactions',

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
      currentSeasonItemsAmountByClient: 'transactions/currentSeasonItemsAmountByClient',
    }),
  },

  created () {
    forEach(this.globalEventHandlers, (handler, event) => {
      EventBus.$on(event, handler)
    })
  },

  beforeDestroy () {
    forEach(this.globalEventHandlers, (handler, event) => {
      EventBus.$off(event, handler)
    })
  },

  methods: {
    getItemCreationTemplateModel () {
      return new KomodTransaction()
    },

    handleItemFormChange ({ formName, model, initialModel }) {
      // Add message to the form about how many items
      // current transaction can have based on client's limit and history
      if (formName === `${this.storeModuleName}/creation`) {
        // Client is unset or not yet set
        if (!model.clientId) {
          this.creationFormAddonMessage = ''

          return
        }

        const clientSeasonLimit = this.clientsMap[model.clientId].seasonItemsLimit

        const clientSeasonTakenItemsAmount =
          this.currentSeasonItemsAmountByClient[model.clientId] || 0

        const clientSeasonRemaining = clientSeasonLimit - clientSeasonTakenItemsAmount

        this.creationFormAddonMessage = `У выбранного клиента осталось ${clientSeasonRemaining} вещей из ${clientSeasonLimit}`
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

        const clientSeasonLimit = this.clientsMap[model.clientId].seasonItemsLimit

        let clientSeasonTakenItemsAmount =
          this.currentSeasonItemsAmountByClient[model.clientId] || 0

        // Т.к. редактируем существующую транзакцию, `itemsAmount` в ней на момент
        // начала редактирования может быть включено в `clientSeasonTakenItemsAmount`.
        // Вычтем, чтобы показывать "Осталось" без учета текущего значения
        if (isDateInCurrentSeason(initialModel.date)) {
          clientSeasonTakenItemsAmount -= initialModel.itemsAmount
        }

        const clientSeasonRemaining = clientSeasonLimit - clientSeasonTakenItemsAmount

        this.editingFormAddonMessage = `У выбранного клиента осталось ${clientSeasonRemaining} вещей из ${clientSeasonLimit}`
      }
    },
  },
}
</script>

<style scoped>
  .formAddon__message {
    text-align: center;
  }
</style>
