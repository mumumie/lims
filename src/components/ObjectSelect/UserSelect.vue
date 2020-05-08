<template>
    <el-row :gutter="10">
      <el-col :span="3">
        <el-input v-model="nickname" placeholder="姓名" @change="findUser"></el-input>
        <el-select v-model="deptId" placeholder="部门名称" @change="findDeptUser"
                   filterable>
          <el-option
            v-for="item in deptOption"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-col>

      <el-col :span="18">
        <el-transfer
          v-model="selected1"
          :props="{
      key: 'id',
      label: 'nickname'
    }" :titles="['可选用户', '已选用户']"
          :data="unSelectedUser" @change="zz">
        </el-transfer>
      </el-col>
    </el-row>
</template>


<script>
  export default {
    props: ['value'],
    data() {
      return {
        selected1: this.value,
        nickname: '',//成员名字
        deptId: '',//部门id
        deptOption: [],//单个部门选项
        unSelectedUser: [],//穿梭框数据-待选用户
      }
    },
    methods: {
      zz: function(v) {
        console.log(this.selected1)
        this.$emit('input', this.selected1)
      },
      findDept: function() {
        this.$api.dept.findDept().then((res) => {
          let list = res.bean.data
          list.forEach(v=>{
            v.label = v.name;
            v.value = v.id;
          })
          this.deptOption = list
        })
      },
      findDeptUser: function() {
        this.$api.user.findByDeptId(this.deptId).then((res) => {

          this.unSelectedUser = res.bean.data

        })
      },
      findUser: function() {
        this.$api.user.findByName(this.nickname).then((res) => {
          this.unSelectedUser = res.bean.data
        })
      }
    },
    created() {
      this.findDept()
    }
  };
</script>
<style>
  .el-row {
    margin-bottom: 10px;
  }

</style>
