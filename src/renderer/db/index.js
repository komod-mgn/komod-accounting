import lowdb from 'lowdb'
import LowdbFileSync from 'lowdb/adapters/FileSync'
import mkdirp from 'mkdirp'

const path = require('path')
const os = require('os')

const APP_DIR_NAME = 'Комод - Учет'
const APP_DIR_PATH = path.join(os.homedir(), APP_DIR_NAME)
const APP_DB_NAME = 'db.json'
const APP_DB_PATH = path.join(APP_DIR_PATH, APP_DB_NAME)

// Make sure directory exists
mkdirp.sync(APP_DIR_PATH)

const adapter = new LowdbFileSync(APP_DB_PATH)

const db = lowdb(adapter)

db.defaults({})
  .write()

/** --- Clients --- */

export function dbGetClientsSync () {
  return db.get('clients')
    .value()
}

export function dbUpdateClientsSync (clients) {
  db.set('clients', clients)
    .write()
}
