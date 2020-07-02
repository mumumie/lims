<template>
  <div class="page-container">
    <tip :value="
    ['从题库中选择一批试题来组成试卷']" />
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
          <el-select v-model="filters.practiceId" clearable placeholder="请选择练习">
            <el-option :label="item.name" :value="item.id" v-for="item in practiceData" :key="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="" type="primary" @click="searchPractice"/>
        </el-form-item>
      </el-form>
    </div>
    <!--表格内容栏-->
    <kt-table
      :height="600"
      permsEdit=""
      permsDelete=""
      permsDetail=""
      :data="pageResult"
      :columns="filterColumns"
      customLabel="统计"
      @findPage="findPage"
      :showCustom="true"
      :showBtnEdit="false"
      :showBtnDelete="false"
      @handleCustom="handleCustom"
      @handleDetail="handleDetail"
      @handleDelete="handleDelete">
    </kt-table>
    <!--统计界面-->
    <el-dialog title="统计" width="600px" :visible.sync="statisticsVisible" :close-on-click-modal="false" append-to-body>
      <div  v-if="statisticsVisible">
        <StudentPracticeStat :student-id="studentId" :practice-id="practiceId"></StudentPracticeStat>
      </div>
    </el-dialog>
  </div>
<!--  <div>-->
<!--    【学生列表 包含2个字段name 学生姓名，count(答题总数)】-->
<!--    {{pageResult}}-->
<!--    【学生答题详情 可用弹窗展示】-->
<!--    <StudentPracticeStat :student-id="studentId" :practice-id="practiceId">-->
<!--    </StudentPracticeStat>-->

<!--  </div>-->
</template>

<script>
  import PopupTreeInput from "@/components/PopupTreeInput"
  import KtTable from "@/views/Core/PracticeTable"
  import KtButton from "@/views/Core/KtButton"
  import TableColumnFilterDialog from "@/views/Core/TableColumnFilterDialog"
  import { format } from "@/utils/datetime"
  import {addBean, queryBean, updateBean,addBatchBean,post} from "@/http/base";
  import StudentPracticeStat from "../../components/Echarts/StudentPracticeStat";

  export default {
    components:{
      StudentPracticeStat,
      PopupTreeInput,
      KtTable,
      KtButton,
      TableColumnFilterDialog,
    },
    data() {
      return {
        size: 'mini',
        studentId: '',
        practiceId: '',
        pageResult: {},
        filters: {
          practiceId: '',
        },
        columns: [],
        filterColumns: [],
        pageRequest: { pageNum: 1, pageSize: 10 },
        practiceData: [],
        statisticsVisible:false,
      }
    },
    methods: {
      searchPractice() {
        if (!this.filters.practiceId) {
          this.$message.warning('请先选择练习')
          this.pageResult = {
            pageNum: 1,
            pageSize: 10,
            totalSize: 0,
            content: []
          }
        } else {
          this.findPage(null)
        }
      },
      // 获取分页数据
      findPage: function (data) {
        let pageRequest={
          pageNum: 1,
          pageSize: 10,
          conditionAccount:{

          },
          conditionPracticeResult: {
            status$in : [1,2],
            practiceId : ''
          },
          conditionLoginLog: {

          },
          sort:{
            count:1
          }
        };
        if(data !== null) {
          pageRequest = Object.assign({},data.pageRequest);
        }
        if(this.filters.practiceId){
          pageRequest.conditionPracticeResult['practiceId'] = this.filters.practiceId;

        }else{

        }
        pageRequest.pageno = pageRequest.pageNum - 1;
        pageRequest.pagesize = pageRequest.pageSize;
        post("getStudentStat", pageRequest).then(res => {
          this.pageResult = res.pageResult;
        }).then(data!=null?data.callback:'')
      },
      findPractice: function () {
        queryBean("Practice", {}).then(res => {
          this.practiceData = res.bean.data;
        })
      },
      handleCustom(params){
        console.log(params.row);
        this.studentId = params.row.id;
        this.practiceId = this.filters.practiceId;
        this.statisticsVisible = true;
      },
      // 菜单树选中
      deptTreeCurrentChangeHandle (data, node) {
        this.dataForm.deptmentId = data.id
        this.dataForm.deptName = data.name
      },
      // 时间格式化
      dateFormat: function (row, column, cellValue, index){
        return format(row[column.property][0])+ '---' + format(row[column.property][1])
      },
      // 处理表格列过滤显示
      displayFilterColumnsDialog: function () {
        this.$refs.tableColumnFilterDialog.setDialogVisible(true)
      },
      // 处理表格列过滤显示
      handleFilterColumns: function (data) {
        this.filterColumns = data.filterColumns
        this.$refs.tableColumnFilterDialog.setDialogVisible(false)
      },
      // 处理表格列过滤显示
      initColumns: function () {
        this.columns = [
          /*{prop:"id", label:"ID", minWidth:50},*/
          {prop:"name", label:"学生姓名", minWidth:120},
          // {prop:"nickName", label:"昵称", minWidth:100},
          {prop:"count", label:"已答题目总数", minWidth:120},
          // {prop:"time", label:"时间范围", minWidth:120, formatter: this.dateFormat},
          // {prop:"lastUpdateBy", label:"更新人", minWidth:100},
          // {prop:"lastUpdateTime", label:"更新时间", minWidth:120, formatter:this.dateFormat}
        ]
        this.filterColumns = this.columns;
      },
    },
    created() {
      this.initColumns();
      this.findPractice();
    }

  }
</script>

<style scoped>

</style>
