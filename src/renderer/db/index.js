import lowdb from 'lowdb'
import LowdbFileAsync from 'lowdb/adapters/FileAsync'
import fse from 'fs-extra'

// import {
//   prepare as gitPrepare,
//   commit as gitCommit,
// } from './git'

const path = require('path')
const os = require('os')

const APP_DIR_NAME = 'Комод - Учет'
const APP_DIR_PATH = path.join(os.homedir(), APP_DIR_NAME)
const APP_DB_NAME = 'db.json'
const APP_DB_PATH = path.join(APP_DIR_PATH, APP_DB_NAME)

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
