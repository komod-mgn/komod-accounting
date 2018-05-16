<template>
  <div id="app">
    <el-header id="app__header">
      <el-menu
        :default-active="activeNavIndex"
        :router="true"
        background-color="#4fc08d"
        text-color="#c0e8d6"
        active-text-color="#ffffff"
        mode="horizontal"
      >

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
    activeNavIndex: '/',
  }),
  methods: {
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
    padding: 0;
  }
</style>
