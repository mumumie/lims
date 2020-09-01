<template>
  <el-dialog
    title="添加"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    append-to-body
    width="600px">
    <div style="margin-bottom: 20px;">
      <el-input v-model="keyword" placeholder="请输入学生名称" size="mini" style="width:200px;"></el-input>
      <el-button type="success" @click="handleKeyword" size="mini">搜索</el-button>
    </div>
    <el-table
      ref="multipleTable"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      height="400px"
      size="mini"
      stripe
      @select="handleSingleChange"
      @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
      >
      </el-table-column>
      <el-table-column
        label="学生姓名"
        prop="nickname"
        show-overflow-tooltip
      />
      <el-table-column
        label="学生账号"
        prop="name"
        show-overflow-tooltip
      />
      <el-table-column
        label="所属用户组"
        prop="deptName"
        align="center"
      />
    </el-table>
<!--    <el-pagination-->
<!--      @size-change="handleSizeChange"-->
<!--      @current-change="handleCurrentChange"-->
<!--      :hide-on-single-page="true"-->
<!--      :current-page.sync="currentPage"-->
<!--      :page-size="pageSize"-->
<!--      layout="prev, pager, next, jumper"-->
<!--      :total="total">-->
<!--    </el-pagination>-->
    <div slot="footer">
      <el-button @click="addTeacherId" size="mini" type="primary">确定</el-button>
      <el-button @click="handleClose" size="mini">取消</el-button>
    </div>

  </el-dialog>
</template>

<script>
  import { queryBean } from "@/http/base";
  export default {
    name: "studentSelect",
    props:['dialogVisible', 'studentList'],
    data(){
      return{
        allStudent: [],
        tableData:[],
        keyword:'',
        pageSize:10,
        currentPage:1,
        pageno:0,
        total:0,
        multipleSelection: this.studentList,
        currentSelect: []
      }
    },
    mounted() {
      this.getTableData().then(data => {
        this.allStudent = data
      })
    },
    methods:{
      toggleSelection(rows) {
        this.currentSelect = []
        rows.forEach(row => {
          if (this.multipleSelection.includes(row.id)) {
            this.$nextTick(() => {
              this.$refs.multipleTable.toggleRowSelection(row, true);
            })
          }
        });
      },
      handleSingleChange(val, row) {
        if (val.includes(row)) {
          this.multipleSelection.push(row.id)
        } else {
          this.multipleSelection = this.multipleSelection.filter(v => v !== row.id)
        }
      },
      handleSelectionChange(val) {
        // this.multipleSelection = val;
      },
      getTableData() {
        let condition = {
          roleIdList$in: ["5e85aeee0efa842d5f5dfd82"],
          nickname$regex: this.keyword
        };
        let pageInfo = {
          pageNum: 0,
          sort: {
            insertDt: -1
          }
        };
        const vm = this
        return new Promise((resolve, reject) => {
          queryBean('Account', condition, pageInfo).then(res => {
            if (res.retCode === 0) {
              vm.tableData = res.bean.data;
              vm.toggleSelection(vm.tableData);
              vm.total = res.bean.total;
              resolve(res.bean.data)
            }
          })
        })

      },
      handleSizeChange(val) {
        console.log(`每页 ${val} 条`);
      },
      handleCurrentChange(val) {
        this.pageno=val;
        this.getTableData();
        console.log(`当前页: ${val}`);
      },
      handleKeyword:function(){
        this.getTableData();
      },
      handleClose:function(){
        this.$emit('teacherVisible',false);
        this.keyword='';
      },
      addTeacherId:function(){
        if (this.multipleSelection.length === 0) {
          this.$message('请选择教师')
        }else{
          let tableData = []
          this.allStudent.map(v => {
            if (this.multipleSelection.includes(v.id)) {
              tableData.push(v)
            }
          })
          this.$emit('changeTeacher', tableData);
          this.keyword='';
        }

      },
    }
  }
</script>
<style scoped>

</style>

