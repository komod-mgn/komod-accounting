/**
 * @typedef {
 *  'MANY_CHILDREN' |
 *  'SINGLE_CAREGIVER' |
 *  'DISABILITY' |
 *  'FIRE_VICTIM' |
 *  'LOW_INCOME' |
 * } KomodClientStatusEnumValue
 */
export const KomodClientStatusEnum = {
  MANY_CHILDREN: 'Многодетная семья',
  SINGLE_CAREGIVER: 'Одинокий родитель (попечитель)',
  DISABILITY: 'Особенности здоровья',
  FIRE_VICTIM: 'Погорелец',
  LOW_INCOME: 'Малоимущий',
}

export class KomodClient {
  constructor () {
    this.id = null
    this.lastName = ''
    this.firstName = ''
    this.middleName = ''
    /** @type {Array<KomodClientStatusEnumValue>} */
    this.status = []
    this.idDocument = ''
    this.phoneNumber = ''

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
