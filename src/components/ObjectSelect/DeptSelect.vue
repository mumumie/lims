<template>
  <el-col :span="4">
    <span class="demonstration"></span>
    <el-cascader
      :options="deptOptionTree"
      :props="{ multiple: true, checkStrictly: true}"
      v-model="selected1"
      clearable filterable @change="(v)=>$emit('input', v)" placeholder="请选择用户组"></el-cascader>
  </el-col>
</template>

<script>
  import {mapTree} from "@/utils"
  export default {
    props: ['value'],
    data() {
      return {
        deptOptionTree: [],//树状用户组选项
        selected1: this.value,
      }
    },
    methods: {
      findDeptTree: function () {
        this.$api.dept.findDeptTree().then((res) => {
          let list = res.bean.data
          mapTree(list, {
            key: 'id',
            label: 'name'
          })
          this.deptOptionTree = list
        })
      }
    },
    mounted() {
      this.findDeptTree()
    },
    created() {
      console.log(this.value)
      console.log(this.selected1)

    }
  }
</script>

<style scoped>

</style>
