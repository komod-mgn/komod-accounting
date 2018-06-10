<template>
  <el-form
    :ref="formName"
    :model="formData"
    :rules="fieldRules"
    label-width="150px"
    label-position="right"
  >
    <el-form-item
      v-for="field in formView.fields"
      :key="field.name"
      :prop="field.name"
      :label="field.label"
    >

      <el-input
        v-if="field.type === 'string'"
        :value="formData[field.name]"
        clearable
        @input="val => changeField(field, val)"
      />

      <el-input-number
        v-if="field.type === 'number'"
        :value="formData[field.name]"
        :min="field.min"
        :max="field.max"
        controls-position="right"
        @input="val => changeField(field, val)"
      />

      <el-select
        v-if="field.type === 'enum'"
        :multiple="field.multiple"
        :value="formData[field.name]"
        filterable
        @input="val => changeField(field, val)"
      >
        <el-option
          v-for="(label, key) in field.optionsMap"
          :key="key"
          :label="label"
          :value="key"
        />
      </el-select>

      <el-select
        v-if="field.type === 'ref'"
        :value="formData[field.name]"
        clearable
        filterable
        @input="val => changeField(field, val)"
      >
        <el-option
          v-for="(val, key) in field.optionsMap"
          :key="key"
          :label="field.controlFormatter(val)"
          :value="key"
        />
      </el-select>

      <!-- Transform date string to and from Date object -->
      <!-- TODO make `picker-options` optional -->
      <el-date-picker
        v-if="field.type === 'datetime'"
        :value="toDateObject(formData[field.name])"
        :picker-options="datePickerOptions"
        type="datetime"
        @input="val => changeField(field, toDateISOString(val))"
      />

    </el-form-item>

    <slot
      :model="formData"
      name="form-addon"
    />

    <el-form-item
      :style="{
        textAlign: 'right',
      }"
    >
      <el-button
        plain
        type="danger"
        @click="cancelForm"
      >
        Отмена
      </el-button>
      <el-button
        type="success"
        @click="acceptForm"
      >
        Сохранить
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { isString, isDate } from 'lodash-es'

const formName = 'form'

export default {
  name: 'BaseForm',

  props: {
    formData: {
      type: Object,
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

  data () {
    return {
      datePickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        },
      },
    }
  },

  computed: {
    fieldRules () {
      const rules = {}

      this.formView.fields.forEach(field => {
        rules[field.name] = field.validationRules
      })

      return rules
    },

    formName: () => formName,
  },

  methods: {
    /**
     * @param {IPropertyBaseView} field
     * @param {*} value
     */
    changeField (field, value) {
      // Only handle actual changes
      if (this.formData[field.name] !== value) {
        this.$emit('input', {
          name: field.name,
          value,
        })

        // If needed, revalidate entire form after the field is changed
        // (and ignore result, so no unhandled rejection)
        if (field.triggerRevalidation) {
          this.$refs[formName].validate(() => {})
        }
      }
    },

    cancelForm () {
      this.$emit('cancel')
    },

    acceptForm () {
      this.$refs[formName].validate((isValid) => {
        if (isValid) {
          this.$emit('accept')
        }
      })
    },

    /**
     * @param {string | null | undefined} dateISOstr
     * @return {Date | null | undefined}
     */
    toDateObject (dateISOstr) {
      return isString(dateISOstr)
        ? new Date(dateISOstr)
        : dateISOstr
    },

    /**
     * @param {Date | null | undefined} date
     * @return {string | null | undefined}
     */
    toDateISOString (date) {
      return isDate(date)
        ? date.toISOString()
        : date
    },
  },
}
</script>

<style scoped>

</style>
