export default {

  '2' (data) {
    return data
  },

  '3' (data) {
    if (data.clients) {
      data.clients.items.forEach(item => {
        item.comment = ''
      })
    }

    if (data.transactions) {
      data.transactions.items.forEach(item => {
        item.comment = ''
      })
    }

    return data
  },

}
