<template>
  <el-dialog
    title="添加"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    append-to-body
    width="60%">
    <el-col :span="6"><el-input v-model="keyword" placeholder="请输入内容" size="mini"></el-input></el-col>
    <el-col :span="6">
      <el-button type="success" @click="handleKeyword" size="mini">搜索</el-button>
<!--      <el-button type="danger" @click="addHandle" size="mini">增加</el-button>-->
    </el-col>
    <el-table
      ref="multipleTable"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
      >
      </el-table-column>
      <el-table-column
        label="学生姓名"
        prop="nickname"
        align="center">
      </el-table-column>
      <el-table-column
        label="学生账号"
        prop="name"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        label="所属部门"
        prop="deptment.name"
        align="center">
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :hide-on-single-page="true"
      :current-page.sync="currentPage"
      :page-size="pageSize"
      layout="prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    <div style="margin-top: 20px">
      <el-button @click="addTeacherId">添加</el-button>
      <el-button @click="handleClose">取消选择</el-button>
    </div>

  </el-dialog>
</template>

<script>
  import {queryBean} from "@/http/base";
  export default {
    name: "studentSelect",
    props:['dialogVisible'],
    data(){
      return{
        tableData:[],
        keyword:'',
        pageSize:10,
        currentPage:1,
        pageno:0,
        total:0,
        multipleSelection:[],
      }
    },
    methods:{
      toggleSelection(rows) {
        if (rows) {
          rows.forEach(row => {
            this.$refs.multipleTable.toggleRowSelection(row);
          });
        } else {
          this.$refs.multipleTable.clearSelection();
        }
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      getTableData:function(){
        let condition={
          'roleIdList':["5e85aeee0efa842d5f5dfd82"],
          'nickname$regex':this.keyword
        };
        let pageInfo={
          pageSize:this.pageSize,
          pageNum:this.pageno,
          sort: {
            insertDt: -1
          }
        };
        queryBean('Account', condition,pageInfo).then(res =>{
          if(res.retCode===0){
            this.tableData=res.bean.data;
            this.total=res.bean.total;
          }
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
          let tableData = this.multipleSelection;
          this.$emit('changeTeacher',tableData);
          this.keyword='';
        }

      },
    },
    created(){

    }
  }
</script>
<style scoped>

</style>

