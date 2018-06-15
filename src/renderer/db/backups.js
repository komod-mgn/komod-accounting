import fse from 'fs-extra'
import { APP_BACKUP_PATH, APP_BACKUP_AMOUNT } from '../../config'

const path = require('path')

/**
 * @param {string} filePath
 * @return {Promise}
 */
export async function createBackup (filePath) {
  await fse.ensureDir(APP_BACKUP_PATH)

  const { base, ext } = path.parse(filePath)

  const newFileName = (base + '-' + (new Date()).toISOString() + ext)
    // Replace invalid Windows filename characters
    .replace(/[\\/:*?"<>|]/g, '_')

  await fse.copy(filePath, path.join(APP_BACKUP_PATH, newFileName))
}

/**
 * @param {string} filePath
 * @return {Promise}
 */
export async function cleanUpBackupsFor (filePath) {
  await fse.ensureDir(APP_BACKUP_PATH)

  const { base } = path.parse(filePath)

  /** @type {Array<string>} */
  const allBackups = await fse.readdir(APP_BACKUP_PATH)

  const currentFileBackups = allBackups
    // Starting with backed up filename
    .filter(fileName => fileName.indexOf(base) === 0)

  const outdatedBackupsAmount = currentFileBackups.length - APP_BACKUP_AMOUNT

  if (outdatedBackupsAmount > 0) {
    // Filenames are alpha sorted by timestamp, so oldest are first
    const filesToDelete = currentFileBackups.slice(0, outdatedBackupsAmount)

    await Promise.all(filesToDelete.map(
      file => fse.remove(path.join(APP_BACKUP_PATH, file))
    ))
  }
}
