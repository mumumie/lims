<template>
  <div class="page-container">
    <div v-if="!isEdit">
      <tip :value="
    ['展示已审核和待提交试题，提交后进入待审核，若删除则进入回收站','管理员组可以查看到所有题库']" />
      <!--工具栏-->
      <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
        <el-form :inline="true" :model="filters" :size="size">
<!--          <el-form-item>-->
<!--            <el-select v-model="filters.from" placeholder="来源" style="width:120px;" @change="findQuestBank">-->
<!--              <el-option label="全部" :value="-1" ></el-option>-->
<!--              <el-option label="自建题库" :value="1" ></el-option>-->
<!--              <el-option label="非自建题库" :value="2" ></el-option>-->
<!--            </el-select>-->
<!--          </el-form-item>-->
          <el-form-item>
            <el-select v-model="filters.questBankId" placeholder="请选择题库" @change="questBankChangeHandle">
              <el-option :label="item.name" :value="item.id" v-for="item in questBankData" :key="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="filters.chapter" placeholder="请选择章节" >
              <el-option :label="item" :value="item" v-for="(item,index) in chapterData" :key="index"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="filters.type" placeholder="请选择" style="width:150px;">
              <el-option :label="item.value" :value="item.value" v-for="(item,index) in typeData" :key="index"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model="filters.content" placeholder="试题内容"></el-input>
          </el-form-item>
          <el-form-item>
            <el-select v-model="filters.status" clearable placeholder="状态" style="width:120px;" @change="changeStatus">
              <el-option label="未提交" :value="-1" ></el-option>
              <el-option label="待审核" :value="0" ></el-option>
              <el-option label="已审核" :value="1" ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <kt-button icon="fa fa-search" :label="$t('action.search')" perms="" type="primary" @click="searchBtn"/>
          </el-form-item>
        </el-form>
      </div>
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
        :showBtnDetail="true"
        :showBtnApprove="true"
        :showBatchDelete="showBatchDelete"
        :showBatchAudit="showBatchAudit"
        :showBatchSubmit="showBatchSubmit"
        @findPage="findPage"
        @handleDetail="handleDetail"
        @handleApprove="handleApprove"
        @handleEdit="handleEdit"
        @handleBatchDelete="handleBatchDelete"
        @handleBatchSubmit="handleBatchSubmit"
        @handleBatchAudit="handleBatchAudit"
        @handleDelete="handleDelete">
      </kt-table>
      <!--    详情展示弹框-->
      <el-dialog
        width="60%"
        title="预览"
        append-to-body
        :visible.sync="detailVisible">
        <div class="detail_box" v-if="previewData.content">
          <h2>题目</h2>
          <div class="detail_content" v-html="previewData.content"></div>
          <div v-if="previewData.baseType === 1 || previewData.baseType === 2">
            <h2>选项</h2>
            <div v-for="(item,index) in previewData.option" class="detail_option">
              <div>{{AnswerType[index] + '、 '}}</div>
              <div v-html="item"></div>
            </div>
          </div>
          <h2>答案</h2>
          <div class="detail_content">
            <div v-if="previewData.baseType === 1 || previewData.baseType === 2">
              <i v-for="(optAsw,index) in previewData.optionAnswer" :key="index">{{AnswerType[optAsw] + ((previewData.optionAnswer.length-1)===index?'':'，') }}</i>
            </div>
            <div v-if="previewData.baseType === 3">
              <i>{{previewData.tfAnswer===true?'对': previewData.tfAnswer === false ? '错' : '-'}}</i>
            </div>
            <div v-if="previewData.baseType === 4">
              <div v-for="(item,index) in previewData.blankAnswer" style="display: flex;">
                <div>{{'填空' + (index+1) + '：'}}</div>
                <div v-html="item"></div>
              </div>
            </div>
            <div v-if="previewData.baseType === 5" v-html="previewData.subjectAnswer"></div>
          </div>
          <h2>解析</h2>
          <div class="detail_content"  v-html="previewData.remark"></div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button :size="size" @click.native="detailVisible = false">{{$t('action.cancel')}}</el-button>
        </div>
      </el-dialog>
    </div>
    <div  v-if="isEdit">
      <div>
        <el-button icon="el-icon-back" @click="isEdit = false" size="mini">返回</el-button> <span>试题编辑</span>
      </div>
      <EditQuest :questId="questId" @on-change="editQuestChange"></EditQuest>
    </div>
  </div>
</template>

<script>
  import PopupTreeInput from "@/components/PopupTreeInput"
  import KtTable from "@/views/Core/QuestTable"
  import KtButton from "@/views/Core/KtButton"
  import EditQuest from "@/views/Tq/EditQuest"
  import TableColumnFilterDialog from "@/views/Core/TableColumnFilterDialog"
  import { format } from "@/utils/datetime"
  import {getBean, queryBean, updateBean,updateBatchBean,findMyExamPaper} from "@/http/base";
  export default {
    name:'ExamQuest',
    components:{
      PopupTreeInput,
      KtTable,
      KtButton,
      TableColumnFilterDialog,
      EditQuest
    },
    data() {
      return {
        size: 'mini',
        filters: {
          questBankId:'',
          chapter:'',
          type:'',
          content:'',
          from:-1,
        },
        columns: [],
        filterColumns: [],
        pageRequest: { pageNum: 1, pageSize: 10 },
        pageResult: {},
        tableData:[], //批量导入试题列表
        operation: false, // true:新增, false:编辑
        detailVisible: false, // 新增编辑界面是否显示
        dialogVisibleBatch:false, //批量新增界面是否显示
        editLoading: false,
        loading:false,
        dataFormRules: {
          name: [
            { required: true, message: '请输入用户名', trigger: 'blur' }
          ]
        },
        questBankData: [],
        chapterData: [],
        typeData: [],
        deptTreeProps: {
          label: 'name',
          children: 'children'
        },
        AnswerType:['A','B','C','D','E','F'],
        type:['','单选题','多选题','判断题','填空题','问答题'],
        difficulty:['','简单','中等','困难'],
        previewData:{},
        isEdit:false,
        questId:'',
        showBatchDelete:false,
        showBatchAudit:false,
        showBatchSubmit:false,
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
        pageRequest.condition.questBankId = this.filters.questBankId;
        if(this.filters.status === -1){
          pageRequest.condition['status'] = -1;
        }else if(this.filters.status === 0){
          pageRequest.condition['status'] = 0;
        }else if(this.filters.status === 1){
          pageRequest.condition['status'] = 1;
        }else{
          pageRequest.condition['status$ne'] = 2;
        }

        if(this.filters.chapter){
          pageRequest.condition['chapter'] = this.filters.chapter;
        }
        if(this.filters.type){
          pageRequest.condition['type'] = this.filters.type;
        }
        if(this.filters.content){
          pageRequest.condition['content$regex'] = this.filters.content;
        }
        this.$api.quest.findPage(pageRequest).then((res) => {
          this.pageResult = res.pageResult;
        }).then(data!=null?data.callback:'')
      },
      findQuestBank:function(val){
        let condition={

        };
        let exCondition = {

        };
        if(val !== -1){
          exCondition.from = val;
        };
        queryBean('QuestBank',condition,undefined,exCondition)
          .then(res =>{
            this.questBankData = res.bean.data;
            if(this.questBankData.length>0){
              this.filters.questBankId=this.questBankData[0].id;
            }else{
              this.filters.questBankId='';
            }
            this.findPage(null)
            this.chapterData = res.bean.data[0].chapter;
            let selectType = [
              {type:1,arrStr:'singleSelectType'},
              {type:2,arrStr:'multiplySelectType'},
              {type:3,arrStr:'trueFalseType'},
              {type:4,arrStr:'completionType'},
              {type:5,arrStr:'subjectType'},
            ];
            let typeData=[];
            selectType.forEach(item =>{
              if (res.bean.data[0][item.arrStr].length > 0) {
                res.bean.data[0][item.arrStr].forEach(ite =>{
                  typeData.push({type:item.type,value:ite})
                })
              }
            });
            this.typeData = typeData;
          })
      },
      questBankChangeHandle:function(val){
        let questBankData = this.questBankData[this.questBankData.findIndex(item => item.id === val)]
        this.chapterData = questBankData.chapter;
        let selectType = [
          {type:1,arrStr:'singleSelectType'},
          {type:2,arrStr:'multiplySelectType'},
          {type:3,arrStr:'trueFalseType'},
          {type:4,arrStr:'completionType'},
          {type:5,arrStr:'subjectType'},
        ];
        let typeData=[];
        selectType.forEach(item =>{
          if (questBankData[item.arrStr].length > 0) {
            questBankData[item.arrStr].forEach(ite =>{
              typeData.push({type:item.type,value:ite})
            })
          }
        });
        this.typeData = typeData;
        this.filters.type = null;
        this.filters.chapter = null;
      },
      changeStatus(val){
        if(val === 0){
          this.findPage(null)
          this.showBatchDelete=false;
          this.showBatchAudit=true;
          this.showBatchSubmit=false;
        }else if(val === -1){
          this.findPage(null)
          this.showBatchDelete=true;
          this.showBatchAudit=false;
          this.showBatchSubmit=true;
        }else if(val === 1){
          this.findPage(null)
          this.showBatchDelete=false;
          this.showBatchAudit=false;
          this.showBatchSubmit=false;
        }else{
          this.findPage(null)
          this.showBatchDelete=false;
          this.showBatchAudit=false;
          this.showBatchSubmit=false;
        }
      },
      // 单个删除
      handleDelete: function (params) {
        this.$confirm('删除后可在【试题回收站】中恢复，确定批量删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let doc = {
            status:2
          }
          updateBean('Quest',params.row.id,doc).then(res =>{
            if (res.retCode === 0) {
              this.$message({
                type:"success",
                message:'已删除试题到回收站！！！'
              })
              this.findPage(null)
            }
          })
        }).catch(() =>{

        })

      },
      // 批量删除
      handleBatchDelete: function (params) {
        this.$confirm('删除后可在【试题回收站】中恢复，确定删除这一项吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let doc = {
            status:2
          }
          updateBatchBean('Quest',params,doc).then(res =>{
            if (res.retCode === 0) {
              this.$message({
                type:"success",
                message:'已删除试题到回收站！！！'
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
        this.previewData = Object.assign({},params.row)
        this.detailVisible = true;
      },
      handleBatchSubmit:function(params){
        this.$confirm('提交审核, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let doc = {
            status:1
          }
          updateBatchBean('Quest',params,doc).then(res =>{
            if (res.retCode === 0) {
              this.$message({
                type:"success",
                message:'已批量提交审核！！！'
              })
              this.findPage(null)
            }
          })
        }).catch(() => {

        });
      },
      handleBatchAudit:function(params){
        this.$confirm('审核通过, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let doc = {
            status:1
          }
          updateBatchBean('Quest',params,doc).then(res =>{
            if (res.retCode === 0) {
              this.$message({
                type:"success",
                message:'批量审核通过！！！'
              })
              this.findPage(null)
            }
          })
        }).catch(() => {

        });
      },
      handleApprove:function(params){
        console.log(params.row);
        this.$confirm('确定提交审核, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          getBean('QuestBank',params.row.questBankId).then(res =>{
            let questBank = res.bean;
            let doc = {
              status:0
            }
            if(questBank.reviewerId === ''){
              doc.status = 1;
            }
            updateBean('Quest',params.row.id,doc).then(res =>{
              if (res.retCode === 0) {
                if (doc.status === 0) {
                  this.$message({
                    type:"success",
                    message:'已提交审核！！！'
                  })
                }else if (doc.status === 1){
                  this.$message({
                    type:"success",
                    message:'此试题无需审核，直接审核通过！！！'
                  })
                }
                this.findPage(null)
              }
            })
          })

        }).catch(() => {

        });
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
          // {prop:"questBank.name", label:"题目名称", minWidth:120},
          {prop:"chapter", label:"章节", minWidth:240},
          {prop:"type", label:"题型", minWidth:80},
          {prop:"difficulty", label:"难易度", minWidth:80,formatter : this.difficultyFilter},
          {prop:"score", label:"分值", minWidth:80},
          // {prop:"creator.name", label:"创建人", minWidth:120},
          {prop:"status", label:"审核状态", minWidth:120, formatter: this.statusFilter},
          {prop:"insertDt", label:"创建时间", minWidth:160 , formatter : this.dateFormat},
        ];
        // this.filterColumns = JSON.parse(JSON.stringify(this.columns));
        this.filterColumns = this.columns;
      },
      // 时间格式化
      dateFormat: function (row, column, cellValue, index){
        return format(row[column.property])
      },
      //是否被试卷引用
      isPaperQuote:function(id){
        let condition={
          examQuestIds:[id]
        };
        let pageInfo={};
        findMyExamPaper('ExamPaper',condition).then(res =>{
          if(res.retCode === 0 && res.bean.total >0){
            console.log(res.bean.data);
            if(res.bean.data.findIndex(item => item.status !== 0)>-1){
              this.isQuote=true;
            }else{
              this.isQuote=false;
            }
            this.paperQuoteData=res.bean.data;
          }else{
            this.isQuote=false;
          }
          return this.isQuote
        }).catch(err =>{
          this.$message(err);
        })
      },
      //过滤状态字段
      statusFilter:function(row, column, cellValue, index) {
        if (row.status === -1) {
          return '未提交';
        } else if (row.status === 0) {
          return '审核中';
        } else if (row.status === 1) {
          return '已审核';
        } else if (row.status === 2) {
          return '回收站';
        } else {
          return ' - ';
        }
      },
      //过滤难易度字段
      difficultyFilter:function(row, column, cellValue, index) {
        if (row.difficulty === 1) {
          return '易';
        } else if (row.difficulty === 2) {
          return '较易';
        } else if (row.difficulty === 3) {
          return '中';
        } else if (row.difficulty === 4) {
          return '较难';
        } else if (row.difficulty === 5) {
          return '难';
        } else {
          return ' - ';
        }
      },
      editQuestChange(val){
        this.isEdit = false;
        this.findPage(null);
      },
      searchBtn(){
        if (this.questBankData.length > 0) {
          if (this.filters.questBankId) {
            this.findPage(null);
          }else{
            this.$message({
              type:'warning',
              message:'请先选择题库'
            })
          }
        }else{
          this.$message({
            type:'warning',
            message:'暂无可查询的题库'
          })
        }

      }
    },
    created() {

    },
    mounted() {
      this.findQuestBank(-1);
      this.initColumns();
    }
  }
</script>

<style scoped>
  .detail_box h2{
    margin:0;
  }
  .detail_content{
    padding:10px;
  }
  .detail_option{
    padding:5px 10px;
    display: flex;
  }
</style>


