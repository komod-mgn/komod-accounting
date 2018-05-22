import nanoid from 'nanoid'

import { updateVuexState } from '@/utils'
import { dbUpdateClients } from '@/db'

export default {

  state: {
    /** @type {Array<KomodClient>} */
    items: [],
  },

  mutations: {
    UPDATE_CLIENTS_STATE (state, newState) {
      updateVuexState(state, newState)
    },

    ADD_CLIENT (state, client) {
      state.items.push(client)
    },

    EDIT_CLIENT (state, client) {
      const existingClient = state.items.find(ec => ec.id === client.id)

      if (!existingClient) {
        throw new Error('Editing non-existent client')
      }

      // TODO state.items.splice ?
      Object.assign(existingClient, client)
    },

    DELETE_CLIENT (state, client) {
      const clientIdx = state.items.findIndex(ec => ec.id === client.id)

      if (clientIdx === -1) {
        throw new Error('Deleting non-existent client')
      }

      state.items.splice(clientIdx, 1)
    },
  },

  actions: {
    async updateClient ({ state, commit }, client) {
      if (client.id == null) {
        commit('ADD_CLIENT', {
          ...client,
          id: nanoid(10), // https://alex7kom.github.io/nano-nanoid-cc/
        })
      } else {
        commit('EDIT_CLIENT', client)
      }

      // sync db
      await dbUpdateClients(state)
    },

    async deleteClient ({ state, commit }, client) {
      commit('DELETE_CLIENT', client)

      // sync db
      await dbUpdateClients(state)
    },
  },

}
