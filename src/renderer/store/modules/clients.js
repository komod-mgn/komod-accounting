import nanoid from 'nanoid'
import Vue from 'vue'

import { updateVuexState } from '@/utils'
import { dbUpdate } from '@/db'

/**
 * @typedef {Object} ClientsModuleState
 *
 * @property {Dictionary<KomodClient>} clients - Объект с идентификаторами в качестве ключей
 * @property {Array<string>} clientIdsSortedLastNameAsc - Список идентификаторов,
 *    ОТСОРТИРОВАННЫЙ ПО ВОЗРАСТАНИЮ ФАМИЛИЙ.
 *
 *    Решено использовать состояние, поддерживаемое
 *    самостоятельно, чем иметь геттер, который выполняет
 *    пересчет каждый раз, когда меняются его зависимости,
 *    что с увеличением количества объектов со временем
 *    будет только ещё больше деградировать.
 */

/**
 * @param {ClientsModuleState} state
 * @param {KomodClient} item
 */
function putClientIdInSortedArray (state, item) {
  let targetIdx = state.clientIdsSortedLastNameAsc.findIndex(
    id => state.clients[id].lastName > item.lastName
  )

  if (targetIdx === -1) {
    targetIdx = state.clientIdsSortedLastNameAsc.length
  }

  state.clientIdsSortedLastNameAsc.splice(targetIdx, 0, item.id)
}

/**
 * @param {ClientsModuleState} state
 * @param {KomodClient} item
 */
function removeClientIdFromSortedArray (state, item) {
  const targetIdx = state.clientIdsSortedLastNameAsc.findIndex(id => id === item.id)

  if (targetIdx === -1) {
    throw new Error('Client id is not found in the sorted array and cannot be removed')
  }

  state.clientIdsSortedLastNameAsc.splice(targetIdx, 1)
}

export default {

  namespaced: true,

  /**
   * @type {ClientsModuleState}
   */
  state: {
    clients: {},
    clientIdsSortedLastNameAsc: [],
  },

  getters: {
    /**
     * @param {ClientsModuleState} state
     * @return {Array<KomodClient>}
     */
    clientsSortedLastNameAsc (state) {
      return state.clientIdsSortedLastNameAsc.map(id => state.clients[id])
    },
  },

  mutations: {
    UPDATE_STATE (state, newState) {
      updateVuexState(state, newState)
    },

    /**
     * @param {ClientsModuleState} state
     * @param {KomodClient} item
     */
    ADD (state, item) {
      const existingItem = state.clients[item.id]

      if (existingItem) {
        throw new Error('Adding existing client')
      }

      Vue.set(state.clients, item.id, item)

      putClientIdInSortedArray(state, item)
    },

    /**
     * @param {ClientsModuleState} state
     * @param {KomodClient} item
     */
    EDIT (state, item) {
      const existingItem = state.clients[item.id]

      if (!existingItem) {
        throw new Error('Editing non-existent client')
      }

      Vue.set(state.clients, item.id, item)

      // При изменении фамилии нужно переместить `id` в отсортированном массиве
      if (item.lastName !== existingItem.lastName) {
        removeClientIdFromSortedArray(state, existingItem)

        putClientIdInSortedArray(state, item)
      }
    },

    /**
     * @param {ClientsModuleState} state
     * @param {KomodClient} item
     */
    DELETE (state, item) {
      const existingItem = state.clients[item.id]

      if (!existingItem) {
        throw new Error('Deleting non-existent client')
      }

      removeClientIdFromSortedArray(state, existingItem)

      Vue.delete(state.clients, item.id)
    },
  },

  actions: {
    /**
     * @param {ClientsModuleState} state
     * @param {Function} commit
     * @param {KomodClient} item
     * @return {Promise<KomodClient>}
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
      await dbUpdate('clients', state)

      return updatedItem
    },

    /**
     * @param {ClientsModuleState} state
     * @param {Function} commit
     * @param {KomodClient} item
     * @return {Promise<void>}
     */
    async deleteItem ({ state, commit }, item) {
      commit('DELETE', item)

      // sync db
      await dbUpdate('clients', state)
    },
  },

}
