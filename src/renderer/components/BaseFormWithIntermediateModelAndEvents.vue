<template>
  <base-form
    :form-data="intermediateModel"
    :form-view="formView"
    @input="handleInput"
  >
    <template
      slot="form-addon"
      slot-scope="{ model }"
    >
      <slot
        :model="model"
        name="form-addon"
      />
    </template>
  </base-form>
</template>

<script>
import { cloneDeep } from 'lodash-es'
import EventBus from '@/EventBus'
import BaseForm from '@/components/BaseForm'

/**
 * Компонент, имеющий промежуточную модель для работы с формой,
 * которая агрегирует множество изменений полей в объект.
 * Эта промежуточная модель инициализируется при создании компонента,
 * используя переданную функцию `getFormDataTemplate`.
 * Также компонент эмитит событие на глобальной шине событий.
 */
export default {
  name: 'BaseFormWithIntermediateModelAndEvents',

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
    initialModel: {},
    intermediateModel: {},
  }),

  created () {
    this.initialModel = this.$props.getFormDataTemplate()
    this.intermediateModel = cloneDeep(this.initialModel)

    EventBus.$emit('form-change', {
      formName: this.formView.name,
      model: this.intermediateModel,
      initialModel: this.initialModel,
    })
  },

  methods: {
    handleInput ({ name, value }) {
      this.intermediateModel[name] = value

      this.$emit('model-change', this.intermediateModel)

      EventBus.$emit('form-change', {
        formName: this.formView.name,
        model: this.intermediateModel,
        initialModel: this.initialModel,
      })
    },
  },
}
</script>

<style scoped>

</style>
