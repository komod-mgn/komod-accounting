<template>
  <div>
    <el-button
      round
      type="primary"
      icon="el-icon-plus"
      @click="openTransactionCreationModal"
    >
      Создать
    </el-button>

    <el-dialog
      :visible="isTransactionCreationModalActive"
      :close-on-click-modal="false"
      title="Создание транзакции"
      @close="closeTransactionCreationModal"
    >
      <el-form
        :model="transactionCreationModel"
        :label-width="transactionCreationFormLabelWidth"
        label-position="right"
      >
        <el-form-item
          v-for="field in transactionBaseFields"
          :key="field.name"
          :label="field.label"
        >

          <el-input
            v-if="field.type === 'string'"
            v-model="transactionCreationModel[field.name]"
          />

          <el-select
            v-if="field.type === 'enum'"
            v-model="transactionCreationModel[field.name]"
            :multiple="field.multiple"
            filterable
          >
            <el-option
              v-for="(label, key) in field.enumData"
              :key="key"
              :label="label"
              :value="key"
            />
          </el-select>

          <el-select
            v-if="field.type === 'ref'"
            v-model="transactionCreationModel[field.name]"
            filterable
          >
            <el-option
              v-for="(val, key) in field.options()"
              :key="key"
              :label="field.controlFormatter(val)"
              :value="key"
            />
          </el-select>

          <el-date-picker
            v-if="field.type === 'datetime'"
            v-model="transactionCreationModel[field.name]"
            type="datetime"
          />

        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button
          plain
          type="danger"
          @click="closeTransactionCreationModal"
        >
          Отмена
        </el-button>
        <el-button
          type="success"
          @click="submitTransactionCreationModal"
        >
          Создать
        </el-button>
      </div>
    </el-dialog>

    <!-- TODO `:max-height` for fixed header -->
    <el-table
      :data="transactions"
      border
    >
      <!--
      TODO hover over empty cells causes exception
      (fixed in https://github.com/ElemeFE/element/pull/11137, not yet released)
      -->
      <el-table-column
        v-for="field in transactionBaseFields"
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
            @click="deleteTransaction(transactions[scope.$index])"
          >
            Удалить
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { KomodTransaction } from '@/types/KomodTransaction'
import { stringifyKomodClient } from '@/types/KomodClient'

export default {
  name: 'TransactionsPage',

  data () {
    return {
      isTransactionCreationModalActive: false,
      transactionCreationModel: new KomodTransaction(),
      transactionCreationFormLabelWidth: '100px',
      // TODO
      transactionBaseFields: [
        {
          name: 'date',
          label: 'Дата',
          type: 'datetime',
        },
        {
          name: 'clientId',
          label: 'Клиент',
          type: 'ref',
          options: () => this.clientsMap,
          controlFormatter: (obj) => {
            return stringifyKomodClient(obj)
          },
          tableFormatter: (row, col, id) => {
            return stringifyKomodClient(this.clientsMap[id])
          },
        },
      ],
    }
  },

  computed: {
    ...mapState({
      transactions: state => state.transactions.items,
    }),
    ...mapGetters({
      clientsMap: 'clients/itemsMap',
    }),
  },

  methods: {
    openTransactionCreationModal () {
      this.transactionCreationModel.date = new Date()

      this.isTransactionCreationModalActive = true
    },
    closeTransactionCreationModal () {
      // reset value
      this.transactionCreationModel = new KomodTransaction()
      this.isTransactionCreationModalActive = false
    },
    async submitTransactionCreationModal () {
      await this.$store.dispatch('transactions/updateTransaction', this.transactionCreationModel)

      this.closeTransactionCreationModal()
    },
    async deleteTransaction (transaction) {
      // TODO confirmation

      await this.$store.dispatch('transactions/deleteTransaction', transaction)
    },
  },
}
</script>

<style>

</style>
