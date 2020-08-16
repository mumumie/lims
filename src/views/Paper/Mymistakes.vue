<template>
  <div class="page-container">
    <div>
      <tip :value="
    ['显示学生的错题库列表']" />
      <!--工具栏-->
<!--      <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">-->
<!--        <el-form :inline="true" :model="filters" :size="size">-->
<!--          <el-form-item>-->
<!--            <el-select v-model="filters.questBankId" clearable placeholder="请选择课程">-->
<!--              <el-option :label="item.name" :value="item.id" v-for="item in questBankData" :key="item.id"></el-option>-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--          <el-form-item>-->
<!--            <el-select v-model="filters.createAnnual" clearable placeholder="请选择学年" >-->
<!--              <el-option :label="item.label" :value="item.value" v-for="(item,index) in createAnnualData" :key="index"></el-option>-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--          <el-form-item>-->
<!--            <el-select v-model="filters.semester" clearable placeholder="请选择学期">-->
<!--              <el-option label="第一学期" value="第一学期" ></el-option>-->
<!--              <el-option label="第二学期" value="第二学期" ></el-option>-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--          <el-form-item>-->
<!--            <el-input v-model="filters.name" placeholder="试卷名称"></el-input>-->
<!--          </el-form-item>-->
<!--          <el-form-item>-->
<!--            <kt-button icon="fa fa-search" :label="$t('action.search')" perms="" type="primary" @click="findPage(null)"/>-->
<!--          </el-form-item>-->
<!--        </el-form>-->
<!--      </div>-->
      <!--表格内容栏-->
      <kt-table
        :height="600"
        :maxHeight="600"
        :btnWidth="180"
        permsDetail=""
        permsEdit=""
        permsDelete=""
        :data="pageResult"
        :columns="filterColumns"
        :showBtnEdit="false"
        :showBtnDetail="true"
        :showBtnDelete="true"
        :showBatchDelete="true"
        @findPage="findPage"
        @handleDetail="handleDetail"
        @handleBatchDelete="handleBatchDelete"
        @handleDelete="handleDelete">
      </kt-table>
      <SeeQuest
        :switchBtn="previewSwitch"
        :row="previewData"
        @close="previewSwitch = false"
      />
    </div>
  </div>
</template>

<script>
  import KtTable from "@/views/Core/ExamTable"
  import KtButton from "@/views/Core/KtButton"
  import { format } from "@/utils/datetime"
  import { queryBean, deleteBean, deleteBatchBean } from "@/http/base";
  import { difficultyFilter } from "@/utils";
  export default {
    name:'my-mistakes',
    components:{
      KtTable,
      KtButton,
      SeeQuest: () => import('@/components/Dialog/SeeQuest')
    },
    data() {
      return {
        size: 'mini',
        filters: {
          questBankId:'',
          createAnnual:null,
          semester:'',
          name:'',
        },
        columns: [],
        filterColumns: [],
        pageRequest: { pageNum: 1, pageSize: 10 },
        pageResult: {},
        tableData:[], //批量导入试题列表
        operation: false, // true:新增, false:编辑
        previewSwitch: false, // 预览
        statisticsVisible:false,
        editLoading: false,
        loading:false,
        dataFormRules: {
          name: [
            { required: true, message: '请输入用户名', trigger: 'blur' }
          ]
        },
        questBankData: [],
        createAnnualData:[
          {label:'2015-2016',value:2015},
          {label:'2016-2017',value:2016},
          {label:'2017-2018',value:2017},
          {label:'2018-2019',value:2018},
          {label:'2019-2020',value:2019},
          {label:'2020-2021',value:2020},
        ],
        typeData: [],
        deptTreeProps: {
          label: 'name',
          children: 'children'
        },
        AnswerType:['A','B','C','D','E','F','G','H'],
        AnswerIndex:['一','二','三','四','五','六','七','八'],
        type:['','单选题','多选题','判断题','填空题','问答题'],
        difficulty:['','易','较易','中','较难','难'],
        previewData:{},
        questId:'',
        scoreData:[],
        isShowAnswer: true
      }
    },
    watch:{
      editLoading:function(){
        if(this.editLoading === true){
          setTimeout(() =>{
            this.editLoading = false;
          },2000)
        }
      }
    },
    mounted() {
      this.findQuestBank();
      this.initColumns();
    },
    methods: {
      // 获取分页数据
      findPage: function (data) {
        let pageRequest={
          pageNum: 1,
          pageSize: 10 ,
          sort:{
            insertDt:-1,
          },
          condition:{}
        };
        if(data !== null) {
          pageRequest = data.pageRequest
        }
        if(this.filters.questBankId){
          pageRequest.condition.questBankId = this.filters.questBankId;
        }else{
          delete pageRequest.condition.questBankId;
        }
        if(this.filters.createAnnual){
          pageRequest.condition['createAnnual'] = this.filters.createAnnual;
        }else{
          delete pageRequest.condition['createAnnual'];
        }
        if(this.filters.semester){
          pageRequest.condition['semester'] = this.filters.semester;
        }else{
          delete pageRequest.condition['semester'];
        }
        if(this.filters.name){
          pageRequest.condition['name$regex'] = this.filters.name;
        }else{
          delete pageRequest.condition['name$regex'];
        }
        pageRequest.condition['status$ne'] = -1
        queryBean('QuestFailedBank', pageRequest.condition, pageRequest).then((res) => {
          this.pageResult = res.pageResult;
        }).then(data!=null?data.callback:'')
      },
      findQuestBank:function(){
        let condition={

        };
        queryBean('QuestBank',condition)
          .then(res =>{
            this.questBankData = res.bean.data;
          })
      },
      questBankChangeHandle:function(val){
        let questBankData = this.questBankData[this.questBankData.findIndex(item => item.id === val)]
      },
      // 单个删除
      handleDelete: function (params) {
        this.$confirm('确定删除这一项吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteBean('QuestFailedBank', params.row.id).then(res =>{
            if (res.retCode === 0) {
              this.$message({
                type:"success",
                message:'已删除！！！'
              })
              this.findPage(null)
            }
          })
        }).catch(() =>{

        })
      },
      // 批量删除
      handleBatchDelete: function (params) {
        this.$confirm('确定批量删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteBatchBean('QuestFailedBank', params).then(res =>{
            if (res.retCode === 0) {
              this.$message({
                type:"success",
                message:'已批量删除！！！'
              })
              this.findPage(null)
            }
          })
        }).catch(() =>{

        })
      },
      handleEdit: function (params) {
        this.questId = params.row.id;
        this.isEdit = true;
      },
      // 显示预览界面
      handleDetail: function (params) {
        this.previewData = Object.assign({}, params.row.quest)
        this.previewSwitch = true;
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
          {prop:"quest.name", label:"试题名称", minWidth:200, formatter: this.htmlFilter, tooltip: true},
          {prop:"quest.chapter", label:"章节", minWidth:120},
          {prop:"quest.type", label:"题型", minWidth:80},
          {prop:"quest.difficulty", label:"难易度", minWidth:80, formatter: difficultyFilter},
        ];
        this.filterColumns = this.columns;
      },
      // 时间格式化
      dateFormat: function (row, column, cellValue, index){
        return format(row[column.property])
      },
      htmlFilter(row, column, cellValue, index){
        if(row.quest.content){
          let str1 = row.quest.content.replace(/[\“\”\’\‘\'\"\\\/\s+\b\f\n\r\t]/g, '');
          let str2 = str1.replace(/<[^>]+>/g,"");
          return str2
        }else{
          return row.quest.content
        }
      }
    }
  }
</script>

<style scoped>
  .paper_box h3{
    margin:0 0 10px;
  }
  .paper_quest{
    margin-bottom:10px;
  }
  .paper_title{
    display: flex;
  }
  .paper_content{
  }
  .paper_option{
    padding:5px 10px;
    display: flex;
  }
  .paper_quest .success{
    color: #44ff04;
  }
  .paper_quest .error{
    color:#f90208;
  }
</style>


