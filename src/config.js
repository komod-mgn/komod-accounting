const path = require('path')
const os = require('os')
const packageJson = require('../package.json')

const APP_NAME = packageJson.build.productName

const APP_DIR_NAME = APP_NAME
// Put in `Documents` so it's easier to access on Windows
// where the homedir is hundreds clicks away.
// Other OSes seem to also have `Documents`.
const APP_DIR_PATH = path.join(os.homedir(), 'Documents', APP_DIR_NAME)

const APP_DB_NAME = 'db.json'
const APP_DB_PATH = path.join(APP_DIR_PATH, APP_DB_NAME)

const APP_BACKUP_PATH = path.join(APP_DIR_PATH, 'Backups')
const APP_BACKUP_AMOUNT = 20

module.exports.APP_NAME = APP_NAME
module.exports.APP_DIR_NAME = APP_DIR_NAME
module.exports.APP_DIR_PATH = APP_DIR_PATH
module.exports.APP_DB_NAME = APP_DB_NAME
module.exports.APP_DB_PATH = APP_DB_PATH
module.exports.APP_BACKUP_PATH = APP_BACKUP_PATH
module.exports.APP_BACKUP_AMOUNT = APP_BACKUP_AMOUNT
