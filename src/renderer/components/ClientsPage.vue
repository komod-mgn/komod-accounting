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
        @click="openItemCreationModal"
      >
        Создать
      </el-button>

      <el-dialog
        :visible="isItemCreationModalActive"
        :close-on-click-modal="false"
        title="Создание"
        @close="closeItemCreationModal"
      >
        <base-form
          :form-data="itemCreationModel"
          :form-view="itemFormView"
          @input="({name, value}) => itemCreationModel[name] = value"
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

      <el-button
        v-if="currentSelectedItem"
        round
        type="warning"
        icon="el-icon-edit-outline"
        @click="openItemEditingModal"
      >
        Редактировать
      </el-button>

      <el-dialog
        v-if="isItemEditingModalActive"
        :visible="isItemEditingModalActive"
        :close-on-click-modal="false"
        title="Редактирование"
        @close="closeItemEditingModal"
      >
        <base-form-with-intermediate-model
          :initial-form-data="currentSelectedItem"
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
      :data="items"
      :row-class-name="getRowClass"
      border
      @row-click="selectItem"
    >
      <el-table-column
        type="index"
        align="center"
        header-align="center"
      />

      <el-table-column
        v-for="field in tableFields"
        :key="field.name"
        :prop="field.name"
        :label="field.label"
        :formatter="field.tableFormatter"
        :min-width="field.minWidth"
        header-align="center"
        resizable
        show-overflow-tooltip
      />

      <!--
      TODO move actions from a column into an action panel
      -->
      <el-table-column
        fixed="right"
        label="Действия"
      >
        <template slot-scope="scope">
          <el-button
            plain
            type="danger"
            size="small"
            @click="deleteItem(items[scope.$index])"
          >
            Удалить
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { concat, omit } from 'lodash-es'
import { mapState, mapGetters } from 'vuex'
import {
  QUERY_PARAM_ID,
  QUERY_PARAM_MODE,
  QUERY_PARAM_MODE_EDIT,
} from '@/router/table-view-constants'
import { KomodClient, KomodClientStatusEnum } from '@/types/KomodClient'
import BaseForm from '@/components/BaseForm'
import BaseFormWithIntermediateModel from '@/components/BaseFormWithIntermediateModel'

const storeModuleName = 'clients'

export default {
  name: 'ClientsPage',

  components: {
    BaseForm,
    BaseFormWithIntermediateModel,
  },

  data: () => ({
    isItemCreationModalActive: false,
    itemCreationModel: new KomodClient(),

    // TODO
    itemBaseFields: [
      {
        name: 'lastName',
        label: 'Фамилия',
        type: 'string',
        minWidth: 100,
      },
      {
        name: 'firstName',
        label: 'Имя',
        type: 'string',
        minWidth: 100,
      },
      {
        name: 'middleName',
        label: 'Отчество',
        type: 'string',
        minWidth: 100,
      },
      {
        name: 'status',
        label: 'Статус',
        type: 'enum',
        minWidth: 150,
        multiple: true,
        optionsMap: KomodClientStatusEnum,
        tableFormatter: (row, col, vals) => vals
          .map(val => KomodClientStatusEnum[val])
          .join(', '),
      },
      {
        name: 'idDocument',
        label: 'Удостоверение №',
        type: 'string',
        minWidth: 150,
      },
      {
        name: 'phoneNumber',
        label: 'Телефон',
        type: 'string',
        minWidth: 100,
      },
      {
        name: 'seasonItemsLimit',
        label: 'Норма на сезон',
        type: 'number',
        minWidth: 90,
        min: 0,
      },
    ],
    itemComputedFields: [
      {
        name: 'itemsAmountCurrentSeason',
        label: 'Кол-во взятых вещей (сезон)',
        type: 'number',
        minWidth: 100,
      },
      {
        name: 'itemsAmountTotal',
        label: 'Кол-во взятых вещей (всего)',
        type: 'number',
        minWidth: 100,
      },
      {
        name: 'lastTransaction',
        label: 'Последнее посещение',
        type: 'datetime',
        minWidth: 100,
      },
    ],

    itemEditingModel: null,
  }),

  computed: {
    ...mapState({
      items: state => state[storeModuleName].items,
    }),
    ...mapGetters({
      itemsMap: `${storeModuleName}/itemsMap`,
    }),

    currentSelectedItem () {
      return this.itemsMap[this.$store.state.route.query[QUERY_PARAM_ID]] || null
    },

    tableFields () {
      return concat(this.itemBaseFields, this.itemComputedFields)
    },

    itemFormView () {
      return {
        fields: this.itemBaseFields,
      }
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

    // --- Creation ---

    openItemCreationModal () {
      this.isItemCreationModalActive = true
    },
    closeItemCreationModal () {
      // reset value
      this.itemCreationModel = new KomodClient()
      this.isItemCreationModalActive = false
    },
    async submitItemCreationModal () {
      await this.$store.dispatch(`${storeModuleName}/updateClient`, this.itemCreationModel)

      this.closeItemCreationModal()
    },

    // --- Editing ---

    openItemEditingModal () {
      if (!this.currentSelectedItem) {
        throw new Error('An item must be selected before editing')
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
      this.itemEditingModel = newItem
    },
    async submitItemEditingModal () {
      await this.$store.dispatch(`${storeModuleName}/updateClient`, this.itemEditingModel)

      this.closeItemEditingModal()
    },

    // --- Deleting ---

    async deleteItem (item) {
      // TODO confirmation
      // http://element.eleme.io/#/en-US/component/popover#nested-operation

      await this.$store.dispatch(`${storeModuleName}/deleteClient`, item)
    },
  },
}
</script>

<style scoped>

</style>
