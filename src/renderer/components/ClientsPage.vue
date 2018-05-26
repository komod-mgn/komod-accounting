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
            Создать
          </el-button>
        </div>
      </el-dialog>
    </el-card>

    <!-- TODO pagination -->
    <!-- TODO sorting -->
    <!-- TODO `:max-height` for fixed header -->
    <el-table
      :data="items"
      border
    >
      <el-table-column
        type="index"
      />

      <el-table-column
        v-for="field in tableFields"
        :key="field.name"
        :prop="field.name"
        :label="field.label"
        :formatter="field.tableFormatter"
        :min-width="field.minWidth"
        resizable
        show-overflow-tooltip
      />

      <!--
      TODO `highlight-current-row` for table and
      move actions from a column into an action panel
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
import { concat } from 'lodash-es'
import { mapState } from 'vuex'
import { KomodClient, KomodClientStatusEnum } from '@/types/KomodClient'
import BaseForm from '@/components/BaseForm'

const storeModuleName = 'clients'

export default {
  name: 'ClientsPage',

  components: {
    BaseForm,
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
  }),

  computed: {
    ...mapState({
      items: state => state[storeModuleName].items,
    }),

    tableFields () {
      return concat(this.itemBaseFields, this.itemComputedFields)
    },

    itemFormView () {
      return {
        fields: this.itemBaseFields,
      }
    },
  },

  methods: {
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
