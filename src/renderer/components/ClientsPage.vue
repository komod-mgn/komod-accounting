<template>
  <div>
    <el-button
      round
      type="primary"
      icon="el-icon-plus"
      @click="openClientCreationModal"
    >
      Создать
    </el-button>

    <el-dialog
      :visible="isClientCreationModalActive"
      :close-on-click-modal="false"
      title="Создание клиента"
      @close="closeClientCreationModal"
    >
      <base-form
        :form-data="clientCreationModel"
        :form-view="clientFormView"
        @input="({name, value}) => clientCreationModel[name] = value"
      />

      <div slot="footer">
        <el-button
          plain
          type="danger"
          @click="closeClientCreationModal"
        >
          Отмена
        </el-button>
        <el-button
          type="success"
          @click="submitClientCreationModal"
        >
          Создать
        </el-button>
      </div>
    </el-dialog>

    <!-- TODO pagination -->
    <!-- TODO sorting -->
    <!-- TODO `:max-height` for fixed header -->
    <el-table
      :data="clients"
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
            @click="deleteClient(clients[scope.$index])"
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

export default {
  name: 'ClientsPage',

  components: {
    BaseForm,
  },

  data: () => ({
    isClientCreationModalActive: false,
    clientCreationModel: new KomodClient(),
    // TODO
    clientBaseFields: [
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
    clientComputedFields: [
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
      clients: state => state.clients.items,
    }),

    tableFields () {
      return concat(this.clientBaseFields, this.clientComputedFields)
    },

    clientFormView () {
      return {
        fields: this.clientBaseFields,
      }
    },
  },

  methods: {
    openClientCreationModal () {
      this.isClientCreationModalActive = true
    },
    closeClientCreationModal () {
      // reset value
      this.clientCreationModel = new KomodClient()
      this.isClientCreationModalActive = false
    },
    async submitClientCreationModal () {
      await this.$store.dispatch('clients/updateClient', this.clientCreationModel)

      this.closeClientCreationModal()
    },
    async deleteClient (client) {
      // TODO confirmation

      await this.$store.dispatch('clients/deleteClient', client)
    },
  },
}
</script>

<style>

</style>
