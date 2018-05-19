import nanoid from 'nanoid'

import { dbGetClientsSync, dbUpdateClientsSync } from '@/db'

const dbState = dbGetClientsSync()

export default {

  /**
   * @type {{items: Array<KomodClient>}}
   */
  state: !dbState || Object.keys(dbState).length === 0
    ? {
      /** @type {Array<KomodClient>} */
      items: [],
    }
    : dbState,

  mutations: {
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
    updateClient ({ state, commit }, client) {
      if (client.id == null) {
        commit('ADD_CLIENT', {
          ...client,
          id: nanoid(10), // https://alex7kom.github.io/nano-nanoid-cc/
        })
      } else {
        commit('EDIT_CLIENT', client)
      }

      // sync db
      dbUpdateClientsSync(state)
    },

    deleteClient ({ state, commit }, client) {
      commit('DELETE_CLIENT', client)

      // sync db
      dbUpdateClientsSync(state)
    },
  },

}
