<template>
  <div
    v-loading="isAsyncOpInProgress"
    class="tablePageView"
  >
    <el-card
      :body-style="{
        padding: '6px',
      }"
      class="action-panel"
    >
      <el-button-group
        v-if="filterableTableProperties.length > 0"
        class="action-panel__item"
      >
        <el-button
          round
          type="primary"
          icon="el-icon-search"
          @click="openFilteringModal"
        >
          Поиск
        </el-button>

        <el-button
          v-if="currentFilter"
          round
          type="primary"
          icon="el-icon-close"
          @click="resetFiltering"
        >
          Сбросить
        </el-button>
      </el-button-group>

      <el-button
        round
        type="success"
        icon="el-icon-plus"
        class="action-panel__item"
        @click="openItemCreationModal"
      >
        Создать
      </el-button>

      <el-button
        v-if="currentSelectedItem"
        round
        type="warning"
        icon="el-icon-edit-outline"
        class="action-panel__item"
        @click="openItemEditingModal"
      >
        Редактировать
      </el-button>

      <el-popover
        v-if="currentSelectedItem"
        v-model="isDeleteConfirmationVisible"
        class="action-panel__item"
      >
        <el-button
          slot="reference"
          round
          type="danger"
          icon="el-icon-delete"
        >
          Удалить
        </el-button>

        <p>Вы уверены, что хотите удалить текущий элемент?</p>
        <div
          :style="{
            marginTop: '10px',
            textAlign: 'right',
          }"
        >
          <el-button
            plain
            size="mini"
            @click="isDeleteConfirmationVisible = false"
          >
            Отмена
          </el-button>
          <el-button
            plain
            type="danger"
            size="mini"
            @click="isDeleteConfirmationVisible = false; deleteCurrentItem()"
          >
            Удалить
          </el-button>
        </div>
      </el-popover>

      <!--
      Держать "невидимые" элементы модалок последними,
      чтобы они не разбивали селекторы последовательности видимых элементов
      -->
      <el-dialog
        v-loading="isAsyncOpInProgress"
        v-if="isFilteringModalActive"
        :visible="isFilteringModalActive"
        :close-on-click-modal="false"
        title="Поиск"
        @close="closeModal"
      >
        <base-form-with-intermediate-model-and-events
          :get-form-data-template="getFilteringTemplateModel"
          :form-view="filteringFormView"
          @cancel="closeModal"
          @accept="submitFilteringModal"
        />
      </el-dialog>

      <el-dialog
        v-loading="isAsyncOpInProgress"
        v-if="isItemCreationModalActive"
        :visible="isItemCreationModalActive"
        :close-on-click-modal="false"
        title="Создание"
        @close="closeModal"
      >
        <base-form-with-intermediate-model-and-events
          :get-form-data-template="getItemCreationTemplateModel"
          :form-view="itemCreationFormView"
          @cancel="closeModal"
          @accept="submitItemCreationModal"
        >
          <template
            slot="form-addon"
            slot-scope="{ model }"
          >
            <slot
              :model="model"
              name="creation-form-addon"
            />
          </template>
        </base-form-with-intermediate-model-and-events>
      </el-dialog>

      <el-dialog
        v-loading="isAsyncOpInProgress"
        v-if="isItemEditingModalActive"
        :visible="isItemEditingModalActive"
        :close-on-click-modal="false"
        title="Редактирование"
        @close="closeModal"
      >
        <base-form-with-intermediate-model-and-events
          :get-form-data-template="getItemEditingTemplateModel"
          :form-view="itemEditingFormView"
          @cancel="closeModal"
          @accept="submitItemEditingModal"
        >
          <template
            slot="form-addon"
            slot-scope="{ model }"
          >
            <slot
              :model="model"
              name="editing-form-addon"
            />
          </template>
        </base-form-with-intermediate-model-and-events>
      </el-dialog>
    </el-card>

    <div
      ref="tableWrapperEl"
      class="tablePageView__table-w"
    >
      <!-- TODO На момент написания в `el-table` есть проблема с сортировкой
      после выбора строки: `current-row` отображается на корректной строке
      в фиксированных колонках, но на некорректной строке в нефиксированных.
      Воспроизвести минимальный кейс для issue не удалось,
      возможно какие-то ещё факторы влияют.
      Но вообще, здесь `highlight-current-row` не используется,
      и что `current-row` есть вообще - другой баг (#11560).
      Проблема не критична и сейчас на это нет времени.
      Проверить после обновления ElementUI.
      -->
      <el-table
        ref="table"
        :data="currentPageConfiguredDatasetWithComputedTableProps"
        :row-key="'id'"
        :row-class-name="getRowClass"
        :max-height="tableMaxHeight"
        :default-sort="currentSort"
        border
        @row-click="selectItem"
        @sort-change="changeSort"
      >
        <el-table-column
          v-if="!view.hideIndex"
          :index="(pageZeroBasedIdx) => (currentPage - 1) * tableRowsPerPage + pageZeroBasedIdx + 1"
          type="index"
          align="center"
          fixed="left"
          header-align="center"
        />

        <el-table-column
          v-for="field in tableProperties"
          :key="field.name"
          :prop="field.name"
          :label="field.label"
          :fixed="field.fixedToSide"
          :width="field.width"
          :min-width="field.minWidth"
          :align="field.align || 'left'"
          :sortable="field.sortable ? 'custom' : false"
          :default-sort="currentSort"
          header-align="center"
          resizable
          show-overflow-tooltip
        >
          <template slot-scope="scope">

            <!-- refs to hrefs -->
            <router-link
              v-if="field.type === 'ref' && field.hrefModuleName"
              :to="{
                path: field.hrefModuleName,
                query: {
                  [field.hrefQueryIdParam]: scope.row[field.name],
                },
              }"
              @click.native.stop
              v-text="formatCellText(scope, field)"
            />

            <!-- Default formatting -->
            <template
              v-else
            >{{
              formatCellText(scope, field)
            }}</template>

          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-pagination
      :current-page="currentPage"
      :page-size="tableRowsPerPage"
      :page-sizes="[10, 20, 50, 100]"
      :total="configuredDataset.length"
      layout="total, sizes, prev, pager, next, jumper"
      background
      class="paginator"
      @current-change="changePage"
      @size-change="(newSize) => tableRowsPerPage = newSize"
    />
  </div>
</template>

<script>
import _ from 'lodash'

import {
  QUERY_PARAM_ID,
  QUERY_PARAM_PAGE,
  QUERY_PARAM_SORT,
  QUERY_PARAM_FILTER,
} from '@/router/table-view-constants'
import BaseFormWithIntermediateModelAndEvents from '@/components/BaseFormWithIntermediateModelAndEvents'

import {
  formatSortRouterParam,
  parseSortRouterParam,
  formatFilterRouterParam,
  parseFilterRouterParam,
  isEmptyFilterModel,
  isMeaningfulFilterValue,
} from '@/utils/url'
import { defaultDatetimeTableFormatter } from '@/utils/date'

function noop () {}

function getIdClass (id) {
  return `id--${id}`
}

export default {
  name: 'TheTablePageView',

  components: {
    BaseFormWithIntermediateModelAndEvents,
  },

  props: {
    /** @type {ITablePageView} */
    view: {
      type: Object,
      required: true,
    },

    getItemCreationTemplateModel: {
      type: Function,
      required: true,
    },

    getComputedPropertyValue: {
      type: Function,
      required: false,
      default: () => noop,
    },
  },

  data () {
    return {
      isFilteringModalActive: false,
      isItemCreationModalActive: false,
      isItemEditingModalActive: false,
      isDeleteConfirmationVisible: false,

      isAsyncOpInProgress: false,

      tableMaxHeight: 10000,
      calcTableMaxHeightBound: this.calcTableMaxHeight.bind(this),

      tableRowsPerPage: 20,

      removeAfterEachRouterHook: noop(),
    }
  },

  computed: {
    items () {
      if (this.view.storeModuleName === 'clients') {
        return this.$store.getters[`${this.view.storeModuleName}/clientsSortedLastNameAsc`]
      }
      if (this.view.storeModuleName === 'transactions') {
        return this.$store.getters[`${this.view.storeModuleName}/transactionsSortedDateDesc`]
      }

      return []
    },
    itemsMap () {
      // Модуль с одноименной коллекцией внутри
      return this.$store.state[this.view.storeModuleName][this.view.storeModuleName]
    },

    filteredItems () {
      const datasetToFilter = this.items

      if (!this.currentFilter) return datasetToFilter

      /**
       * @param {string} substring
       * @return {RegExp}
       */
      function getStringMatchRegExp (substring) {
        if (!getStringMatchRegExp._cache) {
          getStringMatchRegExp._cache = {}
        }
        if (!getStringMatchRegExp._cache[substring]) {
          getStringMatchRegExp._cache[substring] = new RegExp(substring, 'i')
        }
        return getStringMatchRegExp._cache[substring]
      }

      const filterablePropsMap = _.keyBy(this.filterableTableProperties, 'name')

      const computedPropNamesMap = {}
      this.view.itemComputedTableProperties.forEach(prop => {
        computedPropNamesMap[prop.name] = true
      })

      return _.filter(datasetToFilter, item => {
        // An item must comply with all filters
        return _.every(this.currentFilter, (filterValue, filterField) => {
          // Checking presence by `in` is faster (https://jsfiddle.net/stsloth/zytu4o1n/)
          const itemFieldValue = filterField in computedPropNamesMap
            ? this.getComputedPropertyValue(item, filterField)
            : item[filterField]

          const fieldType = filterablePropsMap[filterField].type

          // `filterValue` is a case insensitive substring
          if (fieldType === 'string') {
            return getStringMatchRegExp(filterValue).test(itemFieldValue)
          }

          // `filterValue` is an array of possible values
          if (
            fieldType === 'enum' ||
            fieldType === 'ref'
          ) {
            return filterValue.includes(itemFieldValue)
          }

          // `filterValue` is an array of possible values;
          // `itemFieldValue` is also an array - matching any value
          if (
            fieldType === 'multienum' ||
            fieldType === 'multiref'
          ) {
            return _.some(
              itemFieldValue,
              itemOneOfFieldVal => filterValue.includes(itemOneOfFieldVal),
            )
          }

          // `filterValue` is a [ <startDate>, <endDate> ] array
          if (fieldType === 'datetime') {
            return filterValue[0] <= itemFieldValue && itemFieldValue <= filterValue[1]
          }

          // If didn't get handled - unknown filtration type
          console.error(`'${fieldType}' is unknown filter type`)
          return true
        })
      })
    },

    sortedItems () {
      const datasetToSort = this.filteredItems

      const { prop, order } = this.currentSort

      if (!prop) return datasetToSort

      if (this.isComputedProp(prop)) {
        // Computed props are not present in `items`,
        // but sorting by them requires their existence
        // for the entire dataset.

        // Recalculating when occasional sort change happens
        // seems to be preferable over having a copy of `items` objects
        // with merged comp props and constantly spending >2x memory
        const calcPropItemsMap = {}

        _.forEach(datasetToSort, (item) => {
          calcPropItemsMap[item.id] = this.getComputedPropertyValue(item, prop)
        })

        return _.orderBy(
          datasetToSort,
          [item => calcPropItemsMap[item.id]],
          [order === 'ascending' ? 'asc' : 'desc'],
        )
      }

      return _.orderBy(
        datasetToSort,
        [prop],
        [order === 'ascending' ? 'asc' : 'desc'],
      )
    },

    configuredDataset () {
      // Sorted items are also filtered
      // TODO move raw => configured dataset processing here
      // with methods with params instead of computed props
      return this.sortedItems
    },

    currentPage () {
      const routePage = this.$store.state.route.query[QUERY_PARAM_PAGE]

      return routePage ? Number(routePage) : 1
    },

    currentSort () {
      return parseSortRouterParam(this.$store.state.route.query[QUERY_PARAM_SORT])
    },

    currentFilter () {
      return parseFilterRouterParam(this.$store.state.route.query[QUERY_PARAM_FILTER])
    },

    currentPageConfiguredDatasetWithComputedTableProps () {
      const datasetToPage = this.configuredDataset

      const currentPageZeroBased = this.currentPage - 1

      return _.chain(datasetToPage)
        .slice(
          this.tableRowsPerPage * currentPageZeroBased,
          this.tableRowsPerPage * (currentPageZeroBased + 1),
        )
        .map(item => this.getCloneWithComputedProps(item, this.view.itemComputedTableProperties))
        .value()
    },

    currentSelectedItem () {
      return this.itemsMap[this.$store.state.route.query[QUERY_PARAM_ID]] || null
    },

    /**
     * @return {Array<IPropertyBaseView>}
     */
    tableProperties () {
      const allProps = _.concat(
        this.view.itemBaseProperties,
        this.view.itemComputedTableProperties,
      )

      if (this.view.customTablePropertiesOrder) {
        const propsByName = _.keyBy(allProps, 'name')

        return this.view.customTablePropertiesOrder.map(name => propsByName[name])
      }

      return allProps
    },

    /**
     * @return {Array<IPropertyBaseView>}
     */
    filterableTableProperties () {
      const filterableProps = _.filter(
        this.tableProperties,
        prop => prop.filterable,
      )

      if (this.view.customFilterPropertiesOrder) {
        const propsByName = _.keyBy(filterableProps, 'name')

        return this.view.customFilterPropertiesOrder.map(name => propsByName[name])
      }

      return filterableProps
    },

    /**
     * @return {Array<IPropertyBaseView>}
     */
    formProperties () {
      return this.view.itemBaseProperties
    },

    /**
     * @return {IFormView}
     */
    filteringFormView () {
      const filteringTypesMap = {
        'string': 'string',
        'enum': 'multienum',
        'multienum': 'multienum',
        'ref': 'multiref',
        'multiref': 'multiref',
        'datetime': 'daterange',
      }

      const filteringFormProps = _.map(
        this.filterableTableProperties,
        prop => ({
          ..._.omit(prop, [
            'validationRules',
            'addCreateClientHackButton',
          ]),
          type: filteringTypesMap[prop.type],
        }),
      )

      return {
        name: `${this.view.storeModuleName}/filtering`,
        fields: filteringFormProps,
      }
    },

    /**
     * @return {IFormView}
     */
    itemCreationFormView () {
      return {
        name: `${this.view.storeModuleName}/creation`,
        fields: this.formProperties,
      }
    },

    /**
     * @return {IFormView}
     */
    itemEditingFormView () {
      return {
        name: `${this.view.storeModuleName}/editing`,
        fields: this.formProperties,
      }
    },
  },

  watch: {
    currentSelectedItem: {
      immediate: true,
      handler (newVal) {
        const centerSelectedRow = () => {
          if (newVal) {
            const rowEl = document.getElementsByClassName(getIdClass(newVal.id))[0]
            if (rowEl) {
              rowEl.scrollIntoView({
                // vertically in ancestor context
                block: 'center',
                // horizontally in ancestor context
                inline: 'start',
              })
            }
          }
        }

        // В компоненте уже есть хук на изменение роута,
        // в том числе текущего выбранного элемента,
        // и там уже происходит связанная с этим
        // коррекция страницы. Поэтому просто через
        // таймаут центрируем строку.
        this.$nextTick(centerSelectedRow)
      },
    },

    currentSort (newVal, oldVal) {
      if (!_.isEqual(newVal, oldVal)) {
        // В ElTable нет пропа, контролирующего параметры сортировки
        // (`default-sort` - только инициализирующий, а затем
        // состояние параметоров изменяется только внутри),
        // поэтому приходится вручную вызывать "сортировку"
        // (которая меняет только отображение в заголовках колонок)
        this.$refs.table.sort(
          this.currentSort.prop,
          this.currentSort.order,
        )
      }
    },
  },

  created () {
    this.removeAfterEachRouterHook = this.$router.afterEach((to, from) => {
      // Игнорировать переходы на другие роуты
      if (to.name === this.view.routeName) {
        // Исправить роут при необходимости, типа
        // проставления дефолтных сортировок, если нет.
        this.updateRoute({
          newLocation: to,
          oldLocation: from,
          replace: true,
        })
      }
    })

    // Исправить роут при необходимости, типа
    // проставления дефолтных сортировок, если нет.
    this.updateRoute({
      replace: true,
    })
  },

  mounted () {
    this.calcTableMaxHeight()

    window.addEventListener('resize', this.calcTableMaxHeightBound)
  },

  beforeDestroy () {
    this.removeAfterEachRouterHook()

    window.removeEventListener('resize', this.calcTableMaxHeightBound)
  },

  methods: {
    isComputedProp (propName) {
      return _.some(this.view.itemComputedTableProperties, compProp => compProp.name === propName)
    },

    calcSelectedItemPage () {
      if (this.currentSelectedItem) {
        const itemIdx = _.indexOf(
          this.sortedItems,
          this.currentSelectedItem
        )

        return Math.floor(itemIdx / this.tableRowsPerPage) + 1
      }

      return null
    },

    calcTableMaxHeight () {
      const rect = this.$refs.tableWrapperEl.getBoundingClientRect()

      this.tableMaxHeight = rect.height
    },

    /**
     * @param {Object} item
     * @param {Array<IPropertyBaseView>} props
     * @return {Object}
     */
    getCloneWithComputedProps (item, props) {
      const itemShallowClone = { ...item }

      props.forEach(prop => {
        itemShallowClone[prop.name] = this.getComputedPropertyValue(
          itemShallowClone,
          prop.name,
        )
      })

      return itemShallowClone
    },

    /**
     * Функция для "агрегации" в одном месте программных изменений роутера,
     * для решения и отладки гонок изменения роута в разных местах
     * @param {RawLocation} [newLocation]
     * @param {RawLocation | Route} [oldLocation]
     * @param {boolean} replace
     * @return {Promise<void>}
     */
    async updateRoute ({ newLocation, oldLocation, replace }) {
      const LOCATION_AND_ROUTE_RELEVANT_PROPS = ['path', 'params', 'query']

      const currentRoute = this.$store.state.route

      let adjustedNewLocation = _.cloneDeepWith(
        newLocation || _.pick(currentRoute, LOCATION_AND_ROUTE_RELEVANT_PROPS),
        // Попытка избавиться от реактивности Vue
        // (иначе, при копировании из `currentRoute`,
        // похоже, что при изменении `adjustedNewLocation.query`
        // изменяется и `currentRoute.query`)
        value => {
          if (_.isArray(value)) return [ ...value ]
          if (_.isObject(value)) return { ...value }
          return value
        }
      )

      // При отсутствии сортировки форсировать
      // сортировку по умолчанию
      if (!adjustedNewLocation.query[QUERY_PARAM_SORT]) {
        let toSort = _.cloneDeep(this.view.defaultSort)

        // Если переходим с дефолтной сортировки по убыванию
        // на "без сортировки", форсится снова дефолтная по убыванию.
        // В таком случае меняем направление сортировки.
        if (oldLocation) {
          const fromSort = oldLocation.query[QUERY_PARAM_SORT]
            ? parseSortRouterParam(oldLocation.query[QUERY_PARAM_SORT])
            : {}

          if (
            _.isEqual(fromSort, toSort) &&
            fromSort.order === 'descending'
          ) {
            toSort.order = 'ascending'
          }
        }

        adjustedNewLocation.query = {
          ...adjustedNewLocation.query,
          [QUERY_PARAM_SORT]: formatSortRouterParam(toSort),
        }
      }

      if (isLocationEqualToRoute(adjustedNewLocation, currentRoute)) {
        // noop
      } else if (replace) {
        this.$router.replace(adjustedNewLocation)
      } else {
        this.$router.push(adjustedNewLocation)
      }

      // При наличии выбранного элемента надо перейти на страницу,
      // на которой этот элемент находится, с учетом примененных сортировок.
      // Поэтому ожидаем завершения применения переходов.
      if (this.currentSelectedItem) {
        this.$nextTick(() => {
          const itemPage = this.calcSelectedItemPage()

          if (itemPage !== null) {
            adjustedNewLocation.query = {
              ...adjustedNewLocation.query,
              [QUERY_PARAM_PAGE]: itemPage,
            }

            this.$router.replace(adjustedNewLocation)
          }
        })
      }

      function isLocationEqualToRoute (location, route) {
        const strippedLocation = _.pick(location, LOCATION_AND_ROUTE_RELEVANT_PROPS)
        const strippedRoute = _.pick(route, LOCATION_AND_ROUTE_RELEVANT_PROPS)

        return _.isEqual(strippedLocation, strippedRoute)
      }
    },

    changePage (newCurrentPage) {
      this.updateRoute({
        newLocation: {
          query: {
            ..._.omit(this.$store.state.route.query, [
              QUERY_PARAM_ID,
            ]),
            [QUERY_PARAM_PAGE]: newCurrentPage,
          },
        },
        replace: false,
      })

      this.$refs.table.$refs.bodyWrapper.scrollTop = 0
    },

    changeSort ({ prop, order }) {
      // Если какими-то судьбами в ответ на изменение роута
      // вызвалась эта функция и пытается просетить те же значения,
      // ничего не делать
      if (
        prop &&
        this.$store.state.route.query[QUERY_PARAM_SORT] === formatSortRouterParam({ prop, order })
      ) {
        return
      }

      const newLocationQuery = prop
        ? {
          ..._.omit(this.$store.state.route.query, [
            // QUERY_PARAM_ID, // при сортировке оставлять выбранным клиента
            QUERY_PARAM_PAGE,
          ]),
          [QUERY_PARAM_SORT]: formatSortRouterParam({ prop, order }),
        }
        : {
          ..._.omit(this.$store.state.route.query, [
            // QUERY_PARAM_ID, // при сортировке оставлять выбранным клиента
            QUERY_PARAM_PAGE,
            QUERY_PARAM_SORT,
          ]),
        }

      this.updateRoute({
        newLocation: {
          query: newLocationQuery,
        },
        // Для обработки "текущей" сортировки, с которой уходим
        oldLocation: this.$store.state.route,
        replace: false,
      })
    },

    changeFilter (filterModel) {
      const meaningfulFilter = _.omitBy(
        filterModel,
        prop => !isMeaningfulFilterValue(prop)
      )

      const newLocationQuery = !isEmptyFilterModel(meaningfulFilter)
        ? {
          ..._.omit(this.$store.state.route.query, [
            QUERY_PARAM_ID,
            QUERY_PARAM_PAGE,
          ]),
          [QUERY_PARAM_FILTER]: formatFilterRouterParam(meaningfulFilter),
        }
        : {
          ..._.omit(this.$store.state.route.query, [
            QUERY_PARAM_ID,
            QUERY_PARAM_PAGE,
            QUERY_PARAM_FILTER,
          ]),
        }

      this.updateRoute({
        newLocation: {
          query: newLocationQuery,
        },
        replace: false,
      })
    },

    selectItem (newSelectedItem) {
      this.updateRoute({
        newLocation: {
          query: {
            ..._.omit(this.$store.state.route.query, []),
            [QUERY_PARAM_ID]: newSelectedItem.id,
          },
        },
        replace: false,
      })
    },

    getRowClass ({ row, rowIndex }) {
      // Добавляем id в класс строки для поиска
      // её DOM-элемента по модели данных
      const classNames = [getIdClass(row.id)]

      if (
        this.currentSelectedItem &&
        this.currentSelectedItem.id === row.id
      ) {
        classNames.push('--selected-row')
      }

      return classNames.join('  ')
    },

    /**
     * @param {*} value
     * @param {Object} elUiCellScope
     * @param {IPropertyBaseView} fieldView
     * @return {string | *}
     */
    defaultTableFormatter ({ value, elUiCellScope, fieldView }) {
      switch (fieldView.type) {
        case 'datetime': return defaultDatetimeTableFormatter(value)
      }

      return value
    },

    /**
     * http://element.eleme.io/#/en-US/component/table#custom-column-template
     *
     * @param {{ row: Object, column: Object, store: Object }} elUiCellScope
     * @param {IPropertyBaseView} fieldView
     * @return {string | *}
     */
    formatCellText (elUiCellScope, fieldView) {
      const value = elUiCellScope.row[fieldView.name]

      return (fieldView.tableFormatter || this.defaultTableFormatter)({
        value,
        elUiCellScope,
        fieldView,
      })
    },

    closeModal () {
      this.isFilteringModalActive = false
      this.isItemCreationModalActive = false
      this.isItemEditingModalActive = false
    },

    // --- Filtering ---

    getFilteringTemplateModel () {
      return this.currentFilter || {}
    },
    openFilteringModal () {
      this.isFilteringModalActive = true
    },
    submitFilteringModal (filterModel) {
      this.closeModal()

      this.changeFilter(filterModel)
    },
    resetFiltering () {
      this.changeFilter(null)
    },

    // --- Creation ---

    openItemCreationModal () {
      this.isItemCreationModalActive = true
    },
    async submitItemCreationModal (acceptedItem) {
      this.isAsyncOpInProgress = true

      await this.$store.dispatch(
        `${this.view.storeModuleName}/updateItem`,
        acceptedItem,
      )

      this.closeModal()

      this.isAsyncOpInProgress = false
    },

    // --- Editing ---

    getItemEditingTemplateModel () {
      return this.currentSelectedItem
    },
    openItemEditingModal () {
      if (!this.currentSelectedItem) {
        throw new Error('An item must be selected to be edited')
      }

      this.isItemEditingModalActive = true
    },
    async submitItemEditingModal (acceptedItem) {
      this.isAsyncOpInProgress = true

      await this.$store.dispatch(
        `${this.view.storeModuleName}/updateItem`,
        acceptedItem,
      )

      this.closeModal()

      this.isAsyncOpInProgress = false
    },

    // --- Deleting ---

    async deleteCurrentItem () {
      if (!this.currentSelectedItem) {
        throw new Error('An item must be selected to be deleted')
      }

      this.isAsyncOpInProgress = true

      await this.$store.dispatch(
        `${this.view.storeModuleName}/deleteItem`,
        this.currentSelectedItem,
      )

      this.updateRoute({
        newLocation: {
          query: _.omit(this.$store.state.route.query, [
            QUERY_PARAM_ID,
          ]),
        },
        replace: false,
      })

      this.isAsyncOpInProgress = false
    },
  },
}
</script>

<style scoped>
  .tablePageView {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
  }

  .tablePageView__table-w {
    flex: 1 1 0;
    overflow: hidden;
  }

  .paginator {
    margin-top: 10px;
  }

  .el-button.is-round {
    padding: 5px 12px;
  }
</style>
