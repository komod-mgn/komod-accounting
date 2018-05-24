<template>
  <el-form
    :model="formData"
    label-width="150px"
    label-position="right"
  >
    <el-form-item
      v-for="field in formView.fields"
      :key="field.name"
      :label="field.label"
    >

      <el-input
        v-if="field.type === 'string'"
        :value="formData[field.name]"
        @input="val => changeField(field.name, val)"
      />

      <el-select
        v-if="field.type === 'enum'"
        :multiple="field.multiple"
        :value="formData[field.name]"
        filterable
        @input="val => changeField(field.name, val)"
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
        filterable
        @input="val => changeField(field.name, val)"
      >
        <el-option
          v-for="(val, key) in field.optionsMap"
          :key="key"
          :label="field.controlFormatter(val)"
          :value="key"
        />
      </el-select>

      <!-- Transform date string to and from Date object -->
      <el-date-picker
        v-if="field.type === 'datetime'"
        :value="toDateObject(formData[field.name])"
        type="datetime"
        @input="val => changeField(field.name, toDateISOString(val))"
      />

    </el-form-item>
  </el-form>
</template>

<script>
import { isString, isDate } from 'lodash-es'

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

  methods: {
    changeField (fieldName, value) {
      this.$emit('input', {
        name: fieldName,
        value,
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
