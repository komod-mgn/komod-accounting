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
    <!-- TODO `:max-height` for fixed header -->
    <el-table
      :data="clients"
      border
    >
      <!--
      TODO hover over empty cells causes exception
      (fixed in https://github.com/ElemeFE/element/pull/11137, not yet released)
      -->
      <el-table-column
        v-for="field in clientBaseFields"
        :key="field.name"
        :prop="field.name"
        :label="field.label"
        :formatter="field.tableFormatter"
      />

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
    clientCreationFormLabelWidth: '100px',
    // TODO
    clientBaseFields: [
      {
        name: 'lastName',
        label: 'Фамилия',
        type: 'string',
      },
      {
        name: 'firstName',
        label: 'Имя',
        type: 'string',
      },
      {
        name: 'middleName',
        label: 'Отчество',
        type: 'string',
      },
      {
        name: 'status',
        label: 'Статус',
        type: 'enum',
        multiple: true,
        optionsMap: KomodClientStatusEnum,
        tableFormatter: (row, col, vals) => vals
          .map(val => KomodClientStatusEnum[val])
          .join(', '),
      },
    ],
  }),

  computed: {
    ...mapState({
      clients: state => state.clients.items,
    }),

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
