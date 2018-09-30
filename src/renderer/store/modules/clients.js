import nanoid from 'nanoid'
import _ from 'lodash'

import { updateVuexState } from '@/utils'
import { dbUpdate } from '@/db'

export default {

  namespaced: true,

  state: {
    /** @type {Array<KomodClient>} */
    items: [],
  },

  getters: {
    /**
     * @param {Object} state
     * @return {Object<string, KomodClient>}
     */
    itemsMap (state) {
      return _.keyBy(state.items, 'id')
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
        throw new Error('Editing non-existent client')
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

    async deleteItem ({ state, commit }, item) {
      commit('DELETE', item)

      // sync db
      await dbUpdate('clients', state)
    },
  },

}
