<template>
  <div id="app">
    <el-header id="app__header">
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
          <span
            v-if="isDev"
            :style="{
              marginRight: '10px',
              color: 'white',
            }"
            v-text="$store.state.route.fullPath"
          />

          <el-button-group>
            <el-button
              plain
              round
              size="mini"
              icon="el-icon-arrow-left"
              @click="goBack"
            />
            <el-button
              plain
              round
              size="mini"
              icon="el-icon-arrow-right"
              @click="goForward"
            />
          </el-button-group>
        </div>

        <el-menu-item index="/">
          Electron Vue starter landing
        </el-menu-item>

        <el-menu-item index="/clients">
          Клиенты
        </el-menu-item>

        <el-menu-item index="/transactions">
          Транзакции
        </el-menu-item>

      </el-menu>
    </el-header>

    <el-main>
      <router-view/>
    </el-main>
  </div>
</template>

<script>
export default {
  name: 'KomodAccounting',
  data: () => ({
  }),
  computed: {
    currentRouterPath () {
      return this.$store.state.route.path
    },
    isDev () {
      return process.env.NODE_ENV !== 'production'
    },
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

  #app {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  #app__header {
    --header-height: 40px;

    /* Override `el-header` `height` prop
    to only have the source of truth in CSS */
    height: var(--header-height) !important;
    padding: 0;
  }

  #app__header .el-menu-item {
    height: var(--header-height);
    line-height: var(--header-height);
  }

  .router-navigation {
    height: var(--header-height);
    display: flex;
    align-items: center;
  }

  .el-menu .router-navigation {
    float: right;
    margin-right: 10px;
  }

  .action-panel {
    margin-bottom: 20px;
  }

  /* Global ElementUI overrides */
  .el-select,
  .el-date-editor.el-input
  {
    width: 100%;
  }

  .el-table__row {
    cursor: pointer;
  }
  .el-table__row.--selected-row {
    background-color: #eaf3e6;
  }
</style>
