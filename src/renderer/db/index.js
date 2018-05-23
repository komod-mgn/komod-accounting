import lowdb from 'lowdb'
import LowdbFileSync from 'lowdb/adapters/FileSync'
import fse from 'fs-extra'

import {
  prepare as gitPrepare,
  commit as gitCommit,
} from './git'

const path = require('path')
const os = require('os')

const APP_DIR_NAME = 'Комод - Учет'
const APP_DIR_PATH = path.join(os.homedir(), APP_DIR_NAME)
const APP_DB_NAME = 'db.json'
const APP_DB_PATH = path.join(APP_DIR_PATH, APP_DB_NAME)

let db

const whenDbReady = (async function prepareDb () {
  await fse.ensureDir(APP_DIR_PATH)

  // TODO make file ops async?
  db = lowdb(new LowdbFileSync(APP_DB_PATH))

  db.defaults({})
    .write()

  await gitPrepare(APP_DIR_PATH)
})()

export async function dbGet (field) {
  await whenDbReady

  return db.get(field)
    .value()
}

export async function dbUpdate (field, value) {
  await whenDbReady

  db.set(field, value)
    .write()

  await gitCommit()
}
