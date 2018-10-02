import _ from 'lodash'

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

  '4' (data) {
    if (data.clients) {
      data.clients = {
        clients: _.keyBy(data.clients.items, 'id'),
        clientIdsSortedLastNameAsc: _.orderBy(
          data.clients.items, 'lastName', 'asc'
        ).map(item => item.id),
      }
    }

    if (data.transactions) {
      data.transactions = {
        transactions: _.keyBy(data.transactions.items, 'id'),
        transactionIdsSortedDateDesc: _.orderBy(
          data.transactions.items, 'date', 'desc'
        ).map(item => item.id),
      }
    }

    return data
  },

  '5' (data) {
    if (data.clients) {
      _.forEach(data.clients.clients, client => {
        client.status = client.status.map(singleStatus => {
          return singleStatus === 'ORPHAN' ? 'ADULT_ORPHAN' : singleStatus
        })
      })
    }

    return data
  },

}
