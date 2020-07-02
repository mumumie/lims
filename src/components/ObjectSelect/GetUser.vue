<template>
  <el-row :gutter="10">
    <el-col :span="5">
      <el-select
        v-model="deptId"
        placeholder="用户组名称"
        @change="findDeptUser"
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
        }"
        :titles="['可选用户', '已选用户']"
        :data="unSelectedUser"
        @change="zz">
      </el-transfer>
    </el-col>
  </el-row>
</template>


<script>
  export default {
    name:'getUser',
    props: ['memberData','limit'],
    data() {
      return {
        selected1: this.memberData,
        nickname: '',//成员名字
        deptId: '',//用户组id
        deptOption: [],//单个用户组选项
        unSelectedUser: [],//穿梭框数据-待选用户

      }
    },

    methods: {
      zz: function(v) {
        console.log(this.selected1);
        if(this.limit && this.selected1.length > this.limit){
          this.selected1 = this.memberData;
          this.$message({
            type:'warning',
            message:`最多选择 ${this.limit} 个`
          })
        }else{
          this.$emit('memberData', this.selected1)
        }
        console.log(this.selected1);

      },
      findDept: function() {
        this.$api.dept.findDept().then((res) => {
          let list = res.bean.data;
          list.forEach(v=>{
            v.label = v.name;
            v.value = v.id;
          });
          this.deptOption = list;
        })
      },
      findDeptUser: function() {
        this.$api.user.findByDeptId(this.deptId).then((res) => {
          this.unSelectedUser = res.bean.data;
        })
      },
      findUser: function() {
        this.$api.user.findByName(this.nickname).then((res) => {
          this.unSelectedUser = res.bean.data
        })
      }
    },
    created() {
      this.findDept();
    }
  };
</script>
<style>
  .el-row {
    margin-bottom: 10px;
  }

</style>
