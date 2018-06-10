<template>
  <div
    v-loading="isAsyncOpInProgress"
    class="tablePageView"
  >
    <el-card
      :body-style="{
        padding: '10px',
      }"
      class="action-panel"
    >
      <el-button
        round
        type="primary"
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
        v-if="isItemCreationModalActive"
        :visible="isItemCreationModalActive"
        :close-on-click-modal="false"
        title="Создание"
        @close="closeItemCreationModal"
      >
        <base-form-with-intermediate-model-and-events
          :get-form-data-template="getItemCreationTemplateModel"
          :form-view="itemCreationFormView"
          @model-change="handleItemCreationChange"
          @cancel="closeItemCreationModal"
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
        @close="closeItemEditingModal"
      >
        <base-form-with-intermediate-model-and-events
          :get-form-data-template="getItemEditingTemplateModel"
          :form-view="itemEditingFormView"
          @model-change="handleItemEditingChange"
          @cancel="closeItemEditingModal"
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
      <!-- TODO pagination -->
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
        :data="itemsWithComputedTableProps"
        :row-key="'id'"
        :row-class-name="getRowClass"
        :max-height="tableMaxHeight"
        border
        @row-click="selectItem"
      >
        <el-table-column
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
          :min-width="field.minWidth"
          :sortable="field.sortable"
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
  </div>
</template>

<script>
import {
  concat,
  map,
  omit,
} from 'lodash-es'
import {
  QUERY_PARAM_ID,
  QUERY_PARAM_MODE,
  QUERY_PARAM_MODE_CREATE,
  QUERY_PARAM_MODE_EDIT,
} from '@/router/table-view-constants'
import BaseFormWithIntermediateModelAndEvents from '@/components/BaseFormWithIntermediateModelAndEvents'

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
    /** @type {Array<IPropertyBaseView>} */
    itemBaseProperties: {
      type: Array,
      required: true,
    },

    /** @type {Array<IPropertyBaseView>} */
    itemComputedTableProperties: {
      type: Array,
      required: false,
      default: () => [],
    },

    storeModuleName: {
      type: String,
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
      lastItemCreationModel: null,
      lastItemEditingModel: null,
      isDeleteConfirmationVisible: false,
      isAsyncOpInProgress: false,
      tableMaxHeight: 10000,
      calcTableMaxHeightBound: this.calcTableMaxHeight.bind(this),
    }
  },

  computed: {
    items () {
      return this.$store.state[this.storeModuleName].items
    },
    itemsWithComputedTableProps () {
      return map(
        this.items,
        item => this.getCloneWithComputedProps(item, this.itemComputedTableProperties),
      )
    },
    itemsMap () {
      return this.$store.getters[`${this.storeModuleName}/itemsMap`]
    },

    currentSelectedItem () {
      return this.itemsMap[this.$store.state.route.query[QUERY_PARAM_ID]] || null
    },

    /**
     * @return {Array<IPropertyBaseView>}
     */
    tableProperties () {
      return concat(this.itemBaseProperties, this.itemComputedTableProperties)
    },

    /**
     * @return {Array<IPropertyBaseView>}
     */
    formProperties () {
      return concat(this.itemBaseProperties)
    },

    /**
     * @return {IFormView}
     */
    itemCreationFormView () {
      return {
        name: `${this.storeModuleName}/creation`,
        fields: this.formProperties,
      }
    },

    /**
     * @return {IFormView}
     */
    itemEditingFormView () {
      return {
        name: `${this.storeModuleName}/editing`,
        fields: this.formProperties,
      }
    },

    isItemCreationModalActive () {
      return (
        this.$store.state.route.query[QUERY_PARAM_MODE] === QUERY_PARAM_MODE_CREATE
      )
    },

    isItemEditingModalActive () {
      return (
        this.currentSelectedItem &&
        this.$store.state.route.query[QUERY_PARAM_MODE] === QUERY_PARAM_MODE_EDIT
      )
    },
  },

  watch: {
    currentSelectedItem: {
      immediate: true,
      handler (newVal) {
        // Watcher is first called before component is rendered,
        // so have to wait until the row element exists and
        // row is not yet de-selected
        this.$nextTick(() => {
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
        })
      },
    },
  },

  mounted () {
    this.calcTableMaxHeight()

    window.addEventListener('resize', this.calcTableMaxHeightBound)
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.calcTableMaxHeightBound)
  },

  methods: {
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

    selectItem (newSelectedItem) {
      this.$router.push({
        query: {
          ...omit(this.$store.state.route.query, QUERY_PARAM_MODE),
          [QUERY_PARAM_ID]: newSelectedItem.id,
        },
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
     * @param {Object} row
     * @param {Object} col
     * @param {*} value
     * @param {IPropertyBaseView} fieldView
     * @return {string | *}
     */
    defaultTableFormatter (row, col, value, fieldView) {
      switch (fieldView.type) {
        case 'datetime': return value
          ? (new Date(value)).toLocaleString('ru-RU')
          : value
      }

      return value
    },

    /**
     * http://element.eleme.io/#/en-US/component/table#custom-column-template
     *
     * @param {{ row: Object, column: Object }} elUiRowScope
     * @param {IPropertyBaseView} fieldView
     * @return {string | *}
     */
    formatCellText (elUiRowScope, fieldView) {
      const value = elUiRowScope.row[fieldView.name]

      return (fieldView.tableFormatter || this.defaultTableFormatter)(
        elUiRowScope.row,
        elUiRowScope.column,
        value,
        fieldView,
      )
    },

    // --- Creation ---

    openItemCreationModal () {
      this.$router.push({
        query: {
          ...this.$store.state.route.query,
          [QUERY_PARAM_MODE]: QUERY_PARAM_MODE_CREATE,
        },
      })
    },
    closeItemCreationModal () {
      this.$router.push({
        query: omit(this.$store.state.route.query, QUERY_PARAM_MODE),
      })
    },
    handleItemCreationChange (newItem) {
      this.lastItemCreationModel = newItem
    },
    async submitItemCreationModal () {
      this.isAsyncOpInProgress = true

      await this.$store.dispatch(`${this.storeModuleName}/updateItem`, this.lastItemCreationModel)

      this.closeItemCreationModal()

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

      this.$router.push({
        query: {
          ...this.$store.state.route.query,
          [QUERY_PARAM_MODE]: QUERY_PARAM_MODE_EDIT,
        },
      })
    },
    closeItemEditingModal () {
      this.$router.push({
        query: omit(this.$store.state.route.query, QUERY_PARAM_MODE),
      })
    },
    handleItemEditingChange (newItem) {
      this.lastItemEditingModel = newItem
    },
    async submitItemEditingModal () {
      this.isAsyncOpInProgress = true

      await this.$store.dispatch(`${this.storeModuleName}/updateItem`, this.lastItemEditingModel)

      this.closeItemEditingModal()

      this.isAsyncOpInProgress = false
    },

    // --- Deleting ---

    async deleteCurrentItem () {
      if (!this.currentSelectedItem) {
        throw new Error('An item must be selected to be deleted')
      }

      this.isAsyncOpInProgress = true

      await this.$store.dispatch(`${this.storeModuleName}/deleteItem`, this.currentSelectedItem)

      this.$router.push({
        query: omit(this.$store.state.route.query, [QUERY_PARAM_ID, QUERY_PARAM_MODE]),
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
</style>
