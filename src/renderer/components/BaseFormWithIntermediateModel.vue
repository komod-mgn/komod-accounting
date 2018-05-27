<template>
  <base-form
    :form-data="intermediateModel"
    :form-view="formView"
    @input="handleInput"
  />
</template>

<script>
import { cloneDeep } from 'lodash-es'
import BaseForm from '@/components/BaseForm'

/**
 * Компонент, имеющий промежуточную модель для работы с формой,
 * которая агрегирует множество изменений полей в объект.
 * Эта промежуточная модель инициализируется при создании компонента,
 * используя переданную функцию `getFormDataTemplate`.
 */
export default {
  name: 'BaseFormWithIntermediateModel',

  components: {
    BaseForm,
  },

  props: {
    getFormDataTemplate: {
      type: Function,
      required: true,
    },

    /**
     * @type {IFormView}
     */
    formView: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    intermediateModel: {},
  }),

  created () {
    this.intermediateModel = cloneDeep(this.$props.getFormDataTemplate())
  },

  methods: {
    handleInput ({ name, value }) {
      this.intermediateModel[name] = value

      this.$emit('model-change', this.intermediateModel)
    },
  },
}
</script>

<style scoped>

</style>
