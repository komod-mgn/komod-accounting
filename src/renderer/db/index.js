import lowdb from 'lowdb'
import LowdbFileAsync from 'lowdb/adapters/FileAsync'
import fse from 'fs-extra'

// import {
//   prepare as gitPrepare,
//   commit as gitCommit,
// } from './git'

const { APP_DIR_PATH, APP_DB_PATH } = require('../../config')

let db

/**
 * @type {Promise<void>}
 */
const whenDbReady = (async function prepareDb () {
  await fse.ensureDir(APP_DIR_PATH)

  db = await lowdb(new LowdbFileAsync(APP_DB_PATH))

  await db.defaults({})
    .write()

  // await gitPrepare(APP_DIR_PATH)
})()

/**
 * @param {string} field
 * @return {Promise<*>}
 */
export async function dbGet (field) {
  await whenDbReady

  return db.get(field)
    .value()
}

/**
 * @param {string} field
 * @param {*} value
 * @return {Promise<void>}
 */
export async function dbUpdate (field, value) {
  await whenDbReady

  await db.set(field, value)
    .write()

  // await gitCommit()
}
