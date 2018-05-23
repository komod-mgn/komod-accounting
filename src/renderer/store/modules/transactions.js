import nanoid from 'nanoid'

import { updateVuexState } from '@/utils'
import { dbUpdate } from '@/db'

export default {

  namespaced: true,

  state: {
    /** @type {Array<KomodTransaction>} */
    items: [],
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
    async updateTransaction ({ state, commit }, item) {
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

    async deleteTransaction ({ state, commit }, item) {
      commit('DELETE', item)

      // sync db
      await dbUpdate('transactions', state)
    },
  },

}
