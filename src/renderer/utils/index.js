import Vue from 'vue'

export function updateVuexState (state, newState) {
  if (!newState) return

  // Existing properties can be assigned
  // but new ones must be set to be reactive
  for (const key of Object.keys(newState)) {
    if (key in state) {
      state[key] = newState[key]
    } else {
      Vue.set(state, key, newState[key])
    }
  }
}
