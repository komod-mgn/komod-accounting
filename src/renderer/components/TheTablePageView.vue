<template>
  <div>
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
        v-if="isItemCreationModalActive"
        :visible="isItemCreationModalActive"
        :close-on-click-modal="false"
        title="Создание"
        @close="closeItemCreationModal"
      >
        <base-form-with-intermediate-model
          :get-form-data-template="getItemCreationTemplateModel"
          :form-view="itemFormView"
          @model-change="handleItemCreationChange"
        />

        <div slot="footer">
          <el-button
            plain
            type="danger"
            @click="closeItemCreationModal"
          >
            Отмена
          </el-button>
          <el-button
            type="success"
            @click="submitItemCreationModal"
          >
            Сохранить
          </el-button>
        </div>
      </el-dialog>

      <el-dialog
        v-if="isItemEditingModalActive"
        :visible="isItemEditingModalActive"
        :close-on-click-modal="false"
        title="Редактирование"
        @close="closeItemEditingModal"
      >
        <base-form-with-intermediate-model
          :get-form-data-template="getItemEditingTemplateModel"
          :form-view="itemFormView"
          @model-change="handleItemEditingChange"
        />

        <div slot="footer">
          <el-button
            plain
            type="danger"
            @click="closeItemEditingModal"
          >
            Отмена
          </el-button>
          <el-button
            type="success"
            @click="submitItemEditingModal"
          >
            Сохранить
          </el-button>
        </div>
      </el-dialog>
    </el-card>

    <!-- TODO pagination -->
    <!-- TODO sorting -->
    <!-- TODO `:max-height` for fixed header -->
    <el-table
      :data="itemsWithComputedProperties"
      :row-class-name="getRowClass"
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
        :formatter="field.tableFormatter"
        :min-width="field.minWidth"
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
          >{{ formatCellText(scope, field) }}</template>
        </template>
      </el-table-column>
    </el-table>
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
import BaseFormWithIntermediateModel from '@/components/BaseFormWithIntermediateModel'

function noop () {}

export default {
  name: 'TheTablePageView',

  components: {
    BaseFormWithIntermediateModel,
  },

  props: {
    /** @type {Array<IPropertyBaseView>} */
    itemBaseProperties: {
      type: Array,
      required: true,
    },

    /** @type {Array<IPropertyBaseView>} */
    itemComputedProperties: {
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

  data: () => ({
    lastItemCreationModel: null,
    lastItemEditingModel: null,
    isDeleteConfirmationVisible: false,
  }),

  computed: {
    items () {
      return this.$store.state[this.storeModuleName].items
    },
    itemsWithComputedProperties () {
      return map(this.items, item => {
        const itemShallowClone = { ...item }

        this.itemComputedProperties.forEach(prop => {
          itemShallowClone[prop.name] = this.getComputedPropertyValue(
            item,
            prop.name,
          )
        })

        return itemShallowClone
      })
    },
    itemsMap () {
      return this.$store.getters[`${this.storeModuleName}/itemsMap`]
    },

    currentSelectedItem () {
      return this.itemsMap[this.$store.state.route.query[QUERY_PARAM_ID]] || null
    },

    tableProperties () {
      return concat(this.itemBaseProperties, this.itemComputedProperties)
    },

    itemFormView () {
      return {
        fields: this.itemBaseProperties,
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

  methods: {
    selectItem (newSelectedItem) {
      this.$router.push({
        query: {
          ...omit(this.$store.state.route.query, QUERY_PARAM_MODE),
          [QUERY_PARAM_ID]: newSelectedItem.id,
        },
      })
    },

    getRowClass ({ row, rowIndex }) {
      if (
        this.currentSelectedItem &&
        this.currentSelectedItem.id === row.id
      ) {
        return '--selected-row'
      }

      return ''
    },

    /**
     * http://element.eleme.io/#/en-US/component/table#custom-column-template
     *
     * @param {{ row: Object, column: Object }} elUiRowScope
     * @param {IPropertyBaseView} fieldView
     */
    formatCellText (elUiRowScope, fieldView) {
      const value = elUiRowScope.row[fieldView.name]

      return fieldView.tableFormatter
        ? fieldView.tableFormatter(
          elUiRowScope.row,
          elUiRowScope.column,
          value,
        )
        : value
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
      await this.$store.dispatch(`${this.storeModuleName}/updateItem`, this.lastItemCreationModel)

      this.closeItemCreationModal()
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
      await this.$store.dispatch(`${this.storeModuleName}/updateItem`, this.lastItemEditingModel)

      this.closeItemEditingModal()
    },

    // --- Deleting ---

    async deleteCurrentItem () {
      if (!this.currentSelectedItem) {
        throw new Error('An item must be selected to be deleted')
      }

      await this.$store.dispatch(`${this.storeModuleName}/deleteItem`, this.currentSelectedItem)

      this.$router.push({
        query: omit(this.$store.state.route.query, [QUERY_PARAM_ID, QUERY_PARAM_MODE]),
      })
    },
  },
}
</script>

<style scoped>

</style>