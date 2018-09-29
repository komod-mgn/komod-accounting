/**
 * @typedef {
 *  'ORPHAN' |
 *  'LOW_INCOME' |
 *  'MANY_CHILDREN' |
 *  'SINGLE_CAREGIVER' |
 *  'DISABILITY' |
 *  'PENSIONER' |
 *  'FIRE_VICTIM' |
 * } KomodClientStatusEnumValue
 */
export const KomodClientStatusEnum = {
  ORPHAN: 'Выпускник детского дома',
  LOW_INCOME: 'Малоимущий',
  MANY_CHILDREN: 'Многодетная семья',
  SINGLE_CAREGIVER: 'Одинокий родитель (попечитель)',
  DISABILITY: 'Особенности здоровья',
  PENSIONER: 'Пенсионер',
  FIRE_VICTIM: 'Погорелец',
}

export class KomodClient {
  constructor () {
    /** @type {string | null} */
    this.id = null
    this.lastName = ''
    this.firstName = ''
    /** @type {Array<KomodClientStatusEnumValue>} */
    this.status = []
    this.idDocument = ''
    this.phoneNumber = ''
    this.comment = ''

    // So far hardcoded default
    this.seasonItemsLimit = 12
  }
}

/**
 * @param {KomodClient | null | undefined} client
 * @return {string}
 */
export function stringifyKomodClient (client) {
  return client
    ? `${client.lastName || '<Неизв. фамилия>'} ${client.firstName || '<Неизв. имя>'}`
    : '<Неизв. клиент>'
}
