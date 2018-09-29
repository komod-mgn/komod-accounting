import lowdb from 'lowdb'
import LowdbFileAsync from 'lowdb/adapters/FileAsync'
import fse from 'fs-extra'

import { createBackup, cleanUpBackupsFor } from './backups'
import migrations from './migrations'

const {
  APP_DIR_PATH,
  APP_DB_PATH,
} = require('../../config')

const APP_DB_LAST_VERSION = (Object.keys(migrations)
  .map(key => Number(key))
  .sort((a, b) => b - a) // desc
)[0]

console.log('Current app DB version:', APP_DB_LAST_VERSION)

let db

/**
 * @type {Promise<void>}
 */
const whenDbReady = (async function prepareDb () {
  await fse.ensureDir(APP_DIR_PATH)

  db = await lowdb(new LowdbFileAsync(APP_DB_PATH))

  await db.defaults({
    version: APP_DB_LAST_VERSION,
  })
    .write()

  const dbVersion = db.get('version').value()

  console.log('Current file DB version:', dbVersion)

  if (dbVersion < APP_DB_LAST_VERSION) {
    console.log('Migrating DB...')

    let dbState = db.getState()

    for (
      let curProcessingVersion = dbVersion + 1;
      curProcessingVersion <= APP_DB_LAST_VERSION;
      ++curProcessingVersion
    ) {
      console.log(`Migrating DB, version ${curProcessingVersion}...`)

      dbState = migrations[curProcessingVersion](dbState)
      dbState.version = curProcessingVersion

      console.log(`Migrating DB, version ${curProcessingVersion} - finished`)
    }

    db.setState(dbState)
    await db.write()

    console.log('Migration finished')
  }

  await createBackup(APP_DB_PATH)

  await cleanUpBackupsFor(APP_DB_PATH)
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
}
