<template>
  <div
    v-loading="isLoading"
    id="app"
  >
    <el-header
      v-if="!isLoading && !lastError"
      id="app__header"
    >
      <el-menu
        :default-active="currentRouterPath"
        router
        mode="horizontal"
        background-color="#4fc08d"
        text-color="#c0e8d6"
        active-text-color="#ffffff"
      >

        <div
          class="router-navigation"
        >
          <input
            v-if="isDev"
            :value="decodedUrlFullPath"
            :title="decodedUrlFullPath"
            class="devAddressBar"
            disabled
          >

          <el-button-group>
            <el-button
              plain
              round
              size="mini"
              icon="el-icon-arrow-left"
              title="Вернуться назад"
              class="router-navigation__button"
              @click="goBack"
            />
            <el-button
              plain
              round
              size="mini"
              icon="el-icon-arrow-right"
              title="Вернуться вперед"
              class="router-navigation__button"
              @click="goForward"
            />
          </el-button-group>
        </div>

        <el-menu-item index="/transactions">
          Журнал
        </el-menu-item>

        <el-menu-item index="/clients">
          Клиенты
        </el-menu-item>

      </el-menu>
    </el-header>

    <el-main id="app__content">
      <router-view
        v-if="!isLoading && !lastError"
      />

      <el-alert
        v-if="lastError"
        :closable="false"
        :description="lastError.stack"
        title="Произошла ошибка!"
        type="error"
        show-icon
      />
    </el-main>
  </div>
</template>

<script>
import { dbGet } from './db'

export default {
  name: 'KomodAccounting',

  data: () => ({
    isLoading: true,
    /** @type {Error} */
    lastError: null,
  }),

  computed: {
    currentRouterPath () {
      return this.$store.state.route.path
    },
    isDev () {
      return process.env.NODE_ENV !== 'production'
    },
    decodedUrlFullPath () {
      return decodeURIComponent(this.$store.state.route.fullPath)
    },
  },

  async created () {
    this.isLoading = true

    // init vuex state from db
    try {
      this.$store.commit('clients/UPDATE_STATE', await dbGet('clients'))
      this.$store.commit('transactions/UPDATE_STATE', await dbGet('transactions'))
    } catch (error) {
      this.lastError = error
    } finally {
      this.isLoading = false
    }
  },

  methods: {
    goBack () {
      this.$router.go(-1)
    },
    goForward () {
      this.$router.go(1)
    },
  },
}
</script>

<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
  }

  a {
    color: royalblue;
  }

  #app {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  #app__header {
    --header-height: 32px;

    /* Override `el-header` `height` prop
    to only have the source of truth in CSS */
    height: var(--header-height) !important;
    padding: 0;
  }

  #app__header .el-menu-item {
    height: var(--header-height);
    line-height: var(--header-height);
  }

  #app__content {
    display: flex;
    flex-direction: column;
    padding: 10px;
  }

  .router-navigation {
    height: var(--header-height);
    display: flex;
    align-items: center;
  }

  .router-navigation__button {
    padding: 5px 10px !important;
  }

  .el-menu .router-navigation {
    float: right;
    margin-right: 10px;
  }

  .devAddressBar {
    width: 400px;
    margin-right: 10px;
    white-space: pre;
  }

  .action-panel {
    margin-bottom: 10px;
    flex: 0 0 auto;
  }
  .action-panel__item + .action-panel__item {
    margin-left: 10px;
  }

  /* Global ElementUI overrides */
  .el-alert .el-alert__description {
    white-space: pre-wrap;
  }

  .el-select,
  .el-date-editor.el-input,
  .el-date-editor.el-input__inner
  {
    width: 100%;
  }

  .el-range-editor .el-range-input {
    flex: 1 1 0;
  }

  .el-select .el-select__caret {
    color: dimgray !important;
    font-weight: bold;
  }

  .el-date-picker .el-picker-panel__icon-btn,
  .el-date-range-picker .el-picker-panel__icon-btn {
    font-size: 15px;
    margin-left: 3px;
    margin-right: 3px;
    padding-left: 15px;
    padding-right: 15px;
  }

  .el-date-table td.in-range div,
  .el-date-table td.in-range div:hover {
    background-color: rgba(67, 158, 255, 0.35);
  }

  /*
  Скрывать стрелки для перехода по годам в режиме дней
  - `.el-date-picker__header--bordered` применяется в остальных, но не в нем
  - в range переключения между режимами в данный момент нет, поэтому фактически скрываем всегда
  */
  .el-date-picker__header:not(.el-date-picker__header--bordered) .el-icon-d-arrow-left,
  .el-date-picker__header:not(.el-date-picker__header--bordered) .el-icon-d-arrow-right,
  .el-date-range-picker__header:not(.el-date-range-picker__header--bordered) .el-icon-d-arrow-left,
  .el-date-range-picker__header:not(.el-date-range-picker__header--bordered) .el-icon-d-arrow-right
  {
    display: none;
  }

  .el-table__row {
    cursor: pointer;
  }
  .el-table__row.--selected-row {
    background-color: #eaf3e6;
  }
  .el-table .cell {
    word-break: break-word;
  }
  .el-table .el-table__body .cell {
    white-space: pre !important;
  }
  .el-table th {
    padding: 4px 0;
  }
  .el-table td {
    padding: 6px 0;
  }
  .el-table .caret-wrapper {
    height: 20px;
  }
  .el-table .caret-wrapper {
    height: 20px;
  }
  .el-table .sort-caret.ascending {
    top: -1px;
  }
  .el-table .sort-caret.descending {
    bottom: -1px;
  }

  .el-pagination .el-select .el-input {
    width: 140px;
  }

  .el-dialog {
    margin-top: 5vh !important;
    margin-bottom: 5vh !important;
    min-width: 700px;
  }

  .el-dialog__body {
    padding: 20px;
  }

  .el-form-item {
    display: flex;
    align-items: center;
  }
  .el-form-item:last-child {
    margin-bottom: 0;
  }
  .el-form-item__label {
    line-height: 20px;
  }
  .el-form-item__content {
    flex: 1 1 0;
    margin-left: 0 !important;
  }

  /* TODO temp fix, until element-ui 2.4.2 is released where it's fixed */
  .el-button-group .el-button:first-child:last-child.is-round {
    border-radius: 20px;
  }
</style>
