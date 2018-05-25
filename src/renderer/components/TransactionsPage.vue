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
      <base-form
        :form-data="transactionCreationModel"
        :form-view="transactionFormView"
        @input="({name, value}) => transactionCreationModel[name] = value"
      />

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

    <!-- TODO pagination -->
    <!-- TODO sorting -->
    <!-- TODO `:max-height` for fixed header -->
    <el-table
      :data="transactions"
      border
    >
      <el-table-column
        type="index"
      />

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
import BaseForm from '@/components/BaseForm'

export default {
  name: 'TransactionsPage',

  components: {
    BaseForm,
  },

  data () {
    const self = this

    return {
      isTransactionCreationModalActive: false,
      transactionCreationModel: new KomodTransaction(),
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
          get optionsMap () {
            return self.clientsMap
          },
          controlFormatter: (obj) => {
            return stringifyKomodClient(obj)
          },
          tableFormatter: (row, col, id) => {
            return stringifyKomodClient(this.clientsMap[id])
          },
        },
        {
          name: 'itemsAmount',
          label: 'Кол-во вещей',
          type: 'number',
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

    transactionFormView () {
      return {
        fields: this.transactionBaseFields,
      }
    },
  },

  methods: {
    openTransactionCreationModal () {
      this.transactionCreationModel.date = (new Date()).toISOString()

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
