/**
 * @param {Date} date
 * @return {Date}
 */
export function getSeasonStartDateByDate (date) {
  const year = date.getFullYear()
  const month = date.getMonth()

  const SEASON_LENGTH = 3
  const SPRING_START = 2 // March in zero-based
  const SUMMER_START = SPRING_START + SEASON_LENGTH
  const AUTUMN_START = SUMMER_START + SEASON_LENGTH
  const WINTER_START = AUTUMN_START + SEASON_LENGTH

  if (month < SPRING_START) {
    return new Date(year - 1, WINTER_START)
  } else if (month < SUMMER_START) {
    return new Date(year, SPRING_START)
  } else if (month < AUTUMN_START) {
    return new Date(year, SUMMER_START)
  } else if (month < WINTER_START) {
    return new Date(year, AUTUMN_START)
  } else {
    return new Date(year, WINTER_START)
  }
}

/**
 * @param {string} dateISO
 * @return {boolean}
 */
export function isDateInCurrentSeason (dateISO) {
  // todo handle future dates
  return dateISO > currentSeasonStartDateISO
}

const currentSeasonStartDateISO = getSeasonStartDateByDate(new Date()).toISOString()
