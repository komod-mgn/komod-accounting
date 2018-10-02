import nanoid from 'nanoid'
import _ from 'lodash'
import Vue from 'vue'

import { updateVuexState } from '@/utils'
import { isDateInCurrentSeason } from '@/utils/date'
import { dbUpdate } from '@/db'

/**
 * @typedef {Object} TransactionsModuleState
 *
 * @property {Object<string, KomodTransaction>} transactions - Объект с идентификаторами в качестве ключей
 * @property {Array<string>} transactionIdsSortedDateDesc - Список идентификаторов,
 *    ОТСОРТИРОВАННЫЙ ПО УБЫВАНИЮ (УСТАРЕВАНИЮ) ДАТ.
 *
 *    Решено использовать состояние, поддерживаемое
 *    самостоятельно, чем иметь геттер, который выполняет
 *    пересчет каждый раз, когда меняются его зависимости,
 *    что с увеличением количества объектов со временем
 *    будет только ещё больше деградировать.
 */

/**
 * @param {TransactionsModuleState} state
 * @param {KomodTransaction} item
 */
function putTransactionIdInSortedArray (state, item) {
  const targetIdx = state.transactionIdsSortedDateDesc.findIndex(
    id => state.transactions[id].date < item.date
  )

  state.transactionIdsSortedDateDesc.splice(targetIdx, 0, item.id)
}

/**
 * @param {TransactionsModuleState} state
 * @param {KomodTransaction} item
 */
function removeTransactionIdFromSortedArray (state, item) {
  state.transactionIdsSortedDateDesc.splice(
    state.transactionIdsSortedDateDesc.findIndex(id => id === item.id),
    1,
  )
}

export default {

  namespaced: true,

  /**
   * @type {TransactionsModuleState}
   */
  state: {
    transactions: {},
    transactionIdsSortedDateDesc: [],
  },

  getters: {
    /**
     * @param {TransactionsModuleState} state
     * @return {Array<KomodTransaction>}
     */
    transactionsSortedDateDesc (state) {
      return state.transactionIdsSortedDateDesc.map(id => state.transactions[id])
    },

    /**
     * @param {TransactionsModuleState} state
     * @param getters
     * @return {Dictionary<Array<KomodTransaction>>}
     */
    transactionsByClientSortedDateDesc (state, getters) {
      const transactionsByClient = _.groupBy(
        getters.transactionsSortedDateDesc,
        'clientId',
      )

      return transactionsByClient
    },

    /**
     * @param {TransactionsModuleState} state
     * @param getters
     * @return {Dictionary<number>}
     */
    currentSeasonItemsAmountByClient (state, getters) {
      return _.mapValues(
        getters.transactionsByClientSortedDateDesc,
        transactions => {
          let sum = 0

          for (const transaction of transactions) {
            // Transactions are sorted from recent to old,
            // and once a transaction is older than season start,
            // it is and all the next are irrelevant
            // TODO currently future transactions are considered current season
            if (!isDateInCurrentSeason(transaction.date)) {
              break
            }

            sum += transaction.itemsAmount
          }

          return sum
        }
      )
    },
  },

  mutations: {
    UPDATE_STATE (state, newState) {
      updateVuexState(state, newState)
    },

    /**
     * @param {TransactionsModuleState} state
     * @param {KomodTransaction} item
     */
    ADD (state, item) {
      const existingItem = state.transactions[item.id]

      if (existingItem) {
        throw new Error('Adding existing transaction')
      }

      Vue.set(state.transactions, item.id, item)

      putTransactionIdInSortedArray(state, item)
    },

    /**
     * @param {TransactionsModuleState} state
     * @param {KomodTransaction} item
     */
    EDIT (state, item) {
      const existingItem = state.transactions[item.id]

      if (!existingItem) {
        throw new Error('Editing non-existent transaction')
      }

      Vue.set(state.transactions, item.id, item)

      // При изменении даты нужно переместить `id` в отсортированном массиве
      if (item.date !== existingItem.date) {
        removeTransactionIdFromSortedArray(state, existingItem)

        putTransactionIdInSortedArray(state, item)
      }
    },

    /**
     * @param {TransactionsModuleState} state
     * @param {KomodTransaction} item
     */
    DELETE (state, item) {
      const existingItem = state.transactions[item.id]

      if (!existingItem) {
        throw new Error('Deleting non-existent transaction')
      }

      removeTransactionIdFromSortedArray(state, existingItem)

      Vue.delete(state.transactions, item.id)
    },
  },

  actions: {
    /**
     * @param {TransactionsModuleState} state
     * @param {Function} commit
     * @param {KomodTransaction} item
     * @return {Promise<KomodTransaction>}
     */
    async updateItem ({ state, commit }, item) {
      let updatedItem

      if (item.id == null) {
        updatedItem = {
          ...item,
          id: nanoid(10), // https://alex7kom.github.io/nano-nanoid-cc/
        }

        commit('ADD', updatedItem)
      } else {
        updatedItem = item

        commit('EDIT', updatedItem)
      }

      // sync db
      await dbUpdate('transactions', state)

      return updatedItem
    },

    /**
     * @param {TransactionsModuleState} state
     * @param {Function} commit
     * @param {KomodTransaction} item
     * @return {Promise<void>}
     */
    async deleteItem ({ state, commit }, item) {
      commit('DELETE', item)

      // sync db
      await dbUpdate('transactions', state)
    },
  },

}
