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
      <el-form
        :model="clientCreationModel"
        :label-width="clientCreationFormLabelWidth"
        label-position="right"
      >
        <el-form-item
          v-for="field in clientBaseFields"
          :key="field.name"
          :label="field.label"
        >

          <el-input
            v-if="field.type === 'string'"
            v-model="clientCreationModel[field.name]"
          />

          <el-select
            v-if="field.type === 'enum'"
            v-model="clientCreationModel[field.name]"
            :multiple="field.multiple"
          >
            <el-option
              v-for="(label, key) in field.enumData"
              :key="key"
              :label="label"
              :value="key"
            />
          </el-select>

        </el-form-item>
      </el-form>

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

    <!-- TODO `:max-height` for fixed header -->
    <el-table
      :data="clients"
      border
    >
      <!-- TODO hover over empty cells causes exception -->
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

export default {
  name: 'ClientsPage',

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
        enumData: KomodClientStatusEnum,
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
    submitClientCreationModal () {
      this.$store.dispatch('updateClient', this.clientCreationModel)
      this.closeClientCreationModal()
    },
    deleteClient (client) {
      // TODO confirmation

      this.$store.dispatch('deleteClient', client)
    },
  },
}
</script>

<style>

</style>
