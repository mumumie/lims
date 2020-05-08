<template>
  <el-collapse accordion>
    <el-collapse-item>
      <template slot="title">操作提示<i class="header-icon el-icon-info"></i>
      </template>
      <div v-for="item in items">
        {{item}}
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
    export default {
      name: "Tip",
      props: ['value'],
      data() {
        return {
          items: this.value

        }
      },
    }
</script>

<style scoped>

</style>
