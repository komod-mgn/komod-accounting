export class KomodTransaction {
  constructor () {
    this.id = null
    /**
     * Например, '2018-05-23T17:30:06.984Z' (`Date.toISOString()`),
     * чтобы сразу было (де-)сериалезуемо
     * @type {string}
     */
    this.date = ''
    this.clientId = null
    // TODO other fields
  }
}
