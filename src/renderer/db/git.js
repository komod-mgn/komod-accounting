/**
 * Для версионирования и бэкапа БД используем git.
 * Для отсутствия внешней завимости `nodegit` выглядит неплохо,
 * но:
 * - имеется проблема уже на этапе установки на дев-машине -
 *    для Manjaro + Nodejs 10 сбилженных бинарников нет,
 *    и при их сборке есть проблема с `libssh2` - в `nodegit`
 *    библиотека 1.7.0 версии, которая ещё не поддерживает OpenSSL 1.1.0.
 *    В итоге установка пакета фейлится. При обновлении `libssh2`
 *    в форке установка фейлится теперь на отсутствии `binding.gyp`.
 * - будущая прод-сборка приложения может потребовать нетривиальную конфигурацию
 *    сборки бинарников под ОС пользовательской машины (в отличие от дев)
 *    и под Nodejs внутри Electron.
 *
 * Пока решено, что проще устанавливать `git` вместе с / перед приложением,
 * но может в будущем `nodegit` исправится, или вообще откажемся от git.
 */

import gitP from 'simple-git/promise'

/** @type {simplegit.SimpleGit} */
let configuredGit

/**
 * @param {string} dir
 * @return {Promise<void>}
 */
export async function prepare (dir) {
  configuredGit = gitP(dir)

  const isRepo = await configuredGit.checkIsRepo()

  if (!isRepo) {
    await configuredGit.init()

    // TODO configure user.name and user.email?

    await configuredGit.add(['.'])
    await configuredGit.commit('init')
  }
}

/**
 * @return {Promise<void>}
 */
export async function commit () {
  if (!configuredGit) {
    throw new Error('Git module must be configured with `prepare` first')
  }

  await configuredGit.add(['.'])
  await configuredGit.commit('update')
}
