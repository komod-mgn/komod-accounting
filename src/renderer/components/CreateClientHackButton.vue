<template>
  <div class="button-plus-modal-w">
    <el-button
      type="default"
      size="small"
      round
      tabindex="-1"
      @click.stop="openItemCreationModal"
    >
      Создать
    </el-button>

    <el-dialog
      v-loading="isAsyncOpInProgress"
      v-if="isModalActive"
      :visible="isModalActive"
      :close-on-click-modal="false"
      title="Создание клиента"
      append-to-body
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
  </div>
</template>

<script>
import { KomodClient } from '@/types/KomodClient'
import ClientsPageView from '@/views/ClientsPageView'

export default {
  name: 'CreateClientHackButton',

  props: {
    fieldSearch: {
      type: String,
      required: false,
      default: '',
    },
  },

  // components: {
  // },

  data () {
    return {
      isModalActive: false,
      isAsyncOpInProgress: false,
    }
  },

  computed: {
    /**
     * @return {IFormView}
     */
    itemCreationFormView () {
      return {
        name: `${ClientsPageView.storeModuleName}/creation`,
        fields: ClientsPageView.itemBaseProperties,
      }
    },
  },

  beforeCreate () {
    // Решение рекурсивной зависимости компонентов
    this.$options.components.BaseFormWithIntermediateModelAndEvents = require(
      '@/components/BaseFormWithIntermediateModelAndEvents',
    ).default
  },

  methods: {
    openItemCreationModal () {
      this.isModalActive = true
    },

    closeModal () {
      this.isModalActive = false
    },

    getItemCreationTemplateModel () {
      const newClient = new KomodClient()

      if (this.fieldSearch) {
        // Вычленить из поисковой строки фамилию и имя
        const match = this.fieldSearch.trim().match(/([^ ]+)( +(.+))?/)

        if (match) {
          const [ , lastName, , firstName ] = match

          // Озаглавить все первые буквы
          if (lastName) {
            newClient.lastName = lastName.replace(/[\wа-яА-Я]+/g, word => word[0].toUpperCase() + word.slice(1))
          }
          if (firstName) {
            newClient.firstName = firstName.replace(/[\wа-яА-Я]+/g, word => word[0].toUpperCase() + word.slice(1))
          }
        }
      }

      return newClient
    },

    async submitItemCreationModal (acceptedItem) {
      this.isAsyncOpInProgress = true

      const createdItem = await this.$store.dispatch(
        `${ClientsPageView.storeModuleName}/updateItem`,
        acceptedItem,
      )

      this.closeModal()

      this.isAsyncOpInProgress = false

      this.$emit('item-create', createdItem)
    },
  },
}
</script>

<style scoped>

.button-plus-modal-w {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

</style>
