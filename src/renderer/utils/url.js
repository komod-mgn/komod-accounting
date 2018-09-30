import _ from 'lodash'

const SORT_PARAMS_SEPARATOR = '-'

export function formatSortRouterParam ({ prop, order }) {
  return prop + SORT_PARAMS_SEPARATOR + order
}

export function parseSortRouterParam (sortString) {
  // TODO make null and handle accordingly ?
  if (!sortString) return {}

  const [ prop, order ] = sortString.split(SORT_PARAMS_SEPARATOR)
  return { prop, order }
}

export function formatFilterRouterParam (filterModel) {
  return JSON.stringify(filterModel)
}

export function parseFilterRouterParam (filterString) {
  if (!filterString) return null

  const filterObj = JSON.parse(filterString)

  return isEmptyFilterModel(filterObj) ? null : filterObj
}

/**
 * `null`, `undefined`, empty strings, empty arrays, empty objects
 * are meaningless for filtering
 *
 * @param {*} value
 * @return {boolean}
 */
export function isMeaningfulFilterValue (value) {
  if (
    [null, undefined, ''].includes(value) ||
    _.isEmpty(value)
  ) return false

  return true
}

/**
 * Filter model is considered empty if it's not
 * an object with properties that contain meaningful values
 * @param {Object | null} filterModel
 * @return {boolean}
 */
export function isEmptyFilterModel (filterModel) {
  return (
    !_.isObject(filterModel) ||
    _.isEmpty(filterModel) ||
    _.every(filterModel, prop => !isMeaningfulFilterValue(prop))
  )
}
