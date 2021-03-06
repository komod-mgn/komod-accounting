<template>
  <el-form
    :ref="formRefName"
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
        :ref="getFieldRefName(field)"
        :value="formData[field.name]"
        clearable
        @input="val => changeField(field, val)"
      />

      <el-input-number
        v-if="field.type === 'number'"
        :ref="getFieldRefName(field)"
        :value="formData[field.name]"
        :min="field.min"
        :max="field.max"
        controls-position="right"
        @input="val => changeField(field, val)"
        @focus="handleNumberInputFocus(field)"
      />

      <el-select
        v-if="field.type === 'enum' || field.type === 'multienum'"
        :ref="getFieldRefName(field)"
        :multiple="field.type === 'multienum'"
        :value="formData[field.name]"
        filterable
        default-first-option
        @input="val => handleSelectInput(field, val)"
      >
        <el-option
          v-for="(label, key) in field.optionsMap"
          :key="key"
          :label="label"
          :value="key"
        />
      </el-select>

      <el-select
        v-if="field.type === 'ref' || field.type === 'multiref'"
        :ref="getFieldRefName(field)"
        :multiple="field.type === 'multiref'"
        :value="formData[field.name]"
        clearable
        filterable
        default-first-option
        class="ref-select"
        @input="val => handleSelectInput(field, val)"
        @filter-change="val => $set(selectSearches, field.name, val)"
      >
        <create-client-hack-button
          v-if="field.addCreateClientHackButton"
          slot="prefix"
          :field-search="selectSearches[field.name]"
          class="ref-select__create-btn"
          @item-create="item => changeField(field, item.id)"
        />

        <template v-if="field.optionsArr">
          <el-option
            v-for="(option) in field.optionsArr"
            :key="option.key"
            :label="option.label"
            :value="option.value"
          />
        </template>

        <template v-else-if="field.optionsMap">
          <el-option
            v-for="(val, key) in field.optionsMap"
            :key="key"
            :label="field.controlFormatter(val)"
            :value="key"
          />
        </template>
      </el-select>

      <!-- TODO make `picker-options` optional -->
      <el-date-picker
        v-if="field.type === 'datetime' || field.type === 'daterange'"
        :ref="getFieldRefName(field)"
        :value="prepareDatepickerInputValue(formData[field.name])"
        :type="field.type"
        :picker-options="datePickerOptions"
        @input="val => handleDatePickerInput(field, val)"
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
        round
        plain
        type="danger"
        @click="cancelForm"
      >
        Отмена
      </el-button>
      <el-button
        round
        type="success"
        @click="acceptForm"
      >
        Сохранить
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import _ from 'lodash'
import CreateClientHackButton from '@/components/CreateClientHackButton'

const formRefName = 'formRefName'
const fieldRefPrefix = 'fieldRef__'

/** @typedef {Date | null | undefined} DateObjInput */
/** @typedef {string | null | undefined} DateStrInput */

export default {
  name: 'BaseForm',

  components: {
    CreateClientHackButton,
  },

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
        firstDayOfWeek: 1,
        disabledDate (time) {
          return time.getTime() > Date.now()
        },
      },
      selectSearches: {},
    }
  },

  computed: {
    fieldRules () {
      const rules = {}

      this.formView.fields.forEach(field => {
        rules[field.name] = field.validationRules && field.validationRules
          // Оборачивание валидатора из вьюхи,
          // предоставляя ему всю модель из формы
          // для каких-то контекстно-зависимых проверок.
          // Принять ПР с добавлением передачи модели
          // в валидатор мейнтейнеры element-ui отказались
          .map(sourceRule => {
            const modifiedRule = { ...sourceRule }

            if (sourceRule.validator) {
              // Валидатор для element-ui
              modifiedRule.validator = (rule, fieldValue, callback) => {
                // Валидатор из вьюхи с моделью в 4 аргументе
                return sourceRule.validator(rule, fieldValue, callback, {
                  ...this.formData,
                  [field.name]: fieldValue,
                })
              }
            }

            return modifiedRule
          })
      })

      return rules
    },

    formRefName: () => formRefName,
  },

  mounted () {
    const firstInput = this.$el.querySelector('input')

    if (firstInput) firstInput.focus()
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
        // (and ignore result, so no unhandled rejection).
        if (
          field.triggerRevalidation &&

          // Also, currently, `el-select` with `multiple`, in `created` hook,
          // immediately emits `[]` if its `value` is not an array (like `undefined`).
          // This happens before the current component finished its initialization
          // and has got `$refs` populated. So ignoring this update.
          this.$refs[formRefName]
        ) {
          this.$refs[formRefName].validate(() => {})
        }
      }
    },

    /**
     * @param {IPropertyBaseView} field
     * @return {string}
     */
    getFieldRefName (field) {
      return fieldRefPrefix + field.name
    },

    /**
     * @param {IPropertyBaseView} field
     * @return {VueComponent}
     */
    getRef (field) {
      let component = this.$refs[this.getFieldRefName(field)]

      // Почему-то в случае рефов полей, в реф помещается массив компонентов
      if (_.isArray(component)) component = component[0]

      return component
    },

    cancelForm () {
      this.$emit('cancel')
    },

    acceptForm () {
      this.$refs[formRefName].validate((isValid) => {
        if (isValid) {
          this.$emit('accept')
        }
      })
    },

    /**
     * @param {DateStrInput | Array<DateStrInput>} model
     * @return {DateObjInput | Array<DateObjInput>}
     */
    prepareDatepickerInputValue (model) {
      return _.isArray(model)
        ? _.map(model, this.toDateObject)
        : this.toDateObject(model)
    },

    /**
     * @param {DateObjInput | Array<DateObjInput>} payload
     * @return {DateStrInput | Array<DateStrInput>}
     */
    transformDatepickerOutputPayload (payload) {
      if (_.isArray(payload)) {
        let [ startDate, endDate ] = payload

        // `el-date-picker` outputs range as [`<startDate> 00:00`, `<endDate> 00:00`]
        // but we'd like [`<startDate> 00:00`, `<endDate> 23:59`]
        // for the range to include the entirety of the last day
        endDate = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate() + 1,
          0,
          0,
          0,
          -1,
        )

        return _.map([ startDate, endDate ], this.toDateISOString)
      }

      return this.toDateISOString(payload)
    },

    /**
     * @param {DateStrInput} dateISOstr
     * @return {DateObjInput}
     */
    toDateObject (dateISOstr) {
      return _.isString(dateISOstr)
        ? new Date(dateISOstr)
        : dateISOstr
    },

    /**
     * @param {DateObjInput} date
     * @return {DateStrInput}
     */
    toDateISOString (date) {
      return _.isDate(date)
        ? date.toISOString()
        : date
    },

    /**
     * @param {IPropertyBaseView} field
     */
    handleNumberInputFocus (field) {
      let numberComponent = this.getRef(field)

      // Внутреннее устройство `el-input-number`
      // TODO Поменять после принятия ПР
      const numberInputComponent = numberComponent.$refs.input

      numberInputComponent.select()
    },

    /**
     * @param {IPropertyBaseView} field
     * @param {DateObjInput} value
     */
    handleDatePickerInput (field, value) {
      let doneWithField = false

      if (field.type === 'datetime') {
        // В контроле с датой и временем НЕзаконченным изменением
        // надо считать изменение в контроле времени в пикере.
        // Но как понять откуда пришло изменение - из пикера
        // или из поля ввода - не известно - всегда эмитится только `input`.
        // Поэтому считаем, что изменение из контрола времени,
        // если изменлось только время, при этом игнорируя разницу миллисекунд
        // (из пикера всегда приходят значения без миллисекунд).

        // Однако, с такой логикой при изменении только времени
        // в виде выбора текущего дня / кнопки "Сейчас" / редактирования поля,
        // не отрабатывает переключение на следующее поле
        // (окончание работы с текущим - `doneWithField`).
        // Вообще, время фактически используется только упорядочивания
        // событий, и вручную почти никогда не редактируется,
        // и используется автоматически поставленное.
        // Поэтому компромиссным решением является
        // завершение на любое изменение - так будут
        // считаться завершением перечисленные выбор текущего дня и т.д.,
        // но будет "неработоспособным" редактирование времени в контроле времени
        // (но редактирование через ввод в поле ввода будет работать).
        //
        // const oldValueDateObj = this.toDateObject(this.formData[field.name])
        //
        // if (!oldValueDateObj || !value) {
        //   doneWithField = true
        // } else {
        //   const oldYear = oldValueDateObj.getFullYear()
        //   const oldMonth = oldValueDateObj.getMonth()
        //   const oldDay = oldValueDateObj.getDate()
        //   const oldHour = oldValueDateObj.getHours()
        //   const oldMinute = oldValueDateObj.getMinutes()
        //   const oldSeconds = oldValueDateObj.getSeconds()
        //
        //   const newYear = value.getFullYear()
        //   const newMonth = value.getMonth()
        //   const newDay = value.getDate()
        //   const newHour = value.getHours()
        //   const newMinute = value.getMinutes()
        //   const newSeconds = value.getSeconds()
        //
        //   if (
        //     oldYear === newYear &&
        //     oldMonth === newMonth &&
        //     oldDay === newDay &&
        //     (
        //       oldHour !== newHour ||
        //       oldMinute !== newMinute ||
        //       oldSeconds !== newSeconds ||
        //       // Бывает, что при работе с контролом времени,
        //       // эмитится уже установленное значение,
        //       // поэтому, для в таких ситуациях также остаемся в поле
        //       value.getTime() === oldValueDateObj.getTime()
        //     )
        //   ) {
        //     doneWithField = false
        //   } else {
        //     doneWithField = true
        //   }
        // }
        doneWithField = true
      }

      if (field.type === 'daterange') {
        // В диапазоне считать изменение законченным,
        // если оба конца установлены или сброшены

        if (
          !value ||
          (_.isArray(value) && value.length === 2)
        ) {
          doneWithField = true
        }
      }

      // Обновление значения в конце, т.к. предыдущий код зависит от предыдущего значения
      this.changeField(field, this.transformDatepickerOutputPayload(value))

      if (doneWithField) {
        // При фокусе следующего поля пикер не закрывается,
        // поэтому закрываем самостоятельно через _приватный_ метод
        let dateComponent = this.getRef(field)
        dateComponent.handleClose()

        this.$nextTick(() => {
          this.focusNextField(field)
        })
      }
    },

    /**
     * @param {IPropertyBaseView} field
     * @param {*} value
     */
    handleSelectInput (field, value) {
      let doneWithField = false

      if (
        field.type === 'enum' ||
        field.type === 'ref'
      ) {
        // С одиночными значениями считать изменение законченным,
        // если значение было установлено, не сброшено
        if (value) {
          doneWithField = true
        }
      }

      if (
        field.type === 'multienum' ||
        field.type === 'multiref'
      ) {
        // С множественными значениями считать изменение законченным,
        // если был добавлен элемент, или полностью сброшен массив

        const newValue = value || []
        const oldValue = this.formData[field.name] || []

        if (
          newValue.length > oldValue.length ||
          (newValue.length === 0 && oldValue.length > 0)
        ) {
          doneWithField = true
        }
      }

      // Обновление значения в конце, т.к. предыдущий код зависит от предыдущего значения
      this.changeField(field, value)

      if (doneWithField) {
        this.$nextTick(() => {
          this.focusNextField(field)
        })
      }
    },

    /**
     * @param {IPropertyBaseView} field
     */
    focusNextField (field) {
      const passedFieldIdx = this.formView.fields.findIndex(item => item === field)
      const nextField = this.formView.fields[passedFieldIdx + 1]

      // В любом случае убрать фокус из текущего
      // TODO (если есть метод)
      const passedFieldComponent = this.getRef(field)

      if (passedFieldComponent && _.isFunction(passedFieldComponent.blur)) {
        passedFieldComponent.blur()
      }

      // Если есть следующее, сфокусировать его
      if (nextField) {
        const nextFieldComponent = this.getRef(nextField)

        if (nextFieldComponent && _.isFunction(nextFieldComponent.focus)) {
          nextFieldComponent.focus()
        }
      }
    },
  },
}
</script>

<style scoped>

.ref-select /deep/ .el-input__prefix {
  left: auto;
  right: 40px;
}

</style>
