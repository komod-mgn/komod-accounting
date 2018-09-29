export class KomodTransaction {
  constructor () {
    /** @type {string | null} */
    this.id = null
    /**
     * Например, '2018-05-23T17:30:06.984Z' (`Date.toISOString()`),
     * чтобы сразу было (де-)сериалезуемо
     * @type {string}
     */
    this.date = (new Date()).toISOString()
    this.clientId = ''
    this.itemsAmount = 0
    this.comment = ''
  }
}
