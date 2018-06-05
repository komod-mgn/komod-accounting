import nanoid from 'nanoid'
import {
  groupBy,
  keyBy,
  mapValues,
  orderBy,
} from 'lodash-es'

import { updateVuexState } from '@/utils'
import { isDateInCurrentSeason } from '@/utils/date'
import { dbUpdate } from '@/db'

export default {

  namespaced: true,

  state: {
    /** @type {Array<KomodTransaction>} */
    items: [],
  },

  getters: {
    /**
     * @param {Object} state
     * @return {Object<string, KomodTransaction>}
     */
    itemsMap (state) {
      return keyBy(state.items, 'id')
    },

    // todo optimize !!! heavy calculations on any transaction change
    itemsMapByClientSortedByDateDesc (state) {
      const itemsMapByClient = groupBy(
        state.items,
        'clientId',
      )

      return mapValues(
        itemsMapByClient,
        items => orderBy(items, ['date'], ['desc'])
      )
    },

    // todo optimize !!! heavy calculations on any transaction change
    currentSeasonItemsAmountByClient (state, getters) {
      return mapValues(
        getters.itemsMapByClientSortedByDateDesc,
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

    ADD (state, item) {
      state.items.push(item)
    },

    EDIT (state, item) {
      const existingItem = state.items.find(i => i.id === item.id)

      if (!existingItem) {
        throw new Error('Editing non-existent transaction')
      }

      // TODO state.items.splice ?
      Object.assign(existingItem, item)
    },

    DELETE (state, item) {
      const itemIdx = state.items.findIndex(i => i.id === item.id)

      if (itemIdx === -1) {
        throw new Error('Deleting non-existent client')
      }

      state.items.splice(itemIdx, 1)
    },
  },

  actions: {
    async updateItem ({ state, commit }, item) {
      if (item.id == null) {
        commit('ADD', {
          ...item,
          id: nanoid(10), // https://alex7kom.github.io/nano-nanoid-cc/
        })
      } else {
        commit('EDIT', item)
      }

      // sync db
      await dbUpdate('transactions', state)
    },

    async deleteItem ({ state, commit }, item) {
      commit('DELETE', item)

      // sync db
      await dbUpdate('transactions', state)
    },
  },

}
