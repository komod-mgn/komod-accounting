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

      <!-- TODO changing causes errors of mutability -->
      <el-date-picker
        v-if="field.type === 'datetime'"
        :value="formData[field.name]"
        type="datetime"
        @input="val => changeField(field.name, val)"
      />

    </el-form-item>
  </el-form>
</template>

<script>
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
  },
}
</script>

<style scoped>

</style>
