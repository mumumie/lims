<template>
  <div class="page-container">
    <div v-if="!isEdit">
      <tip :value="['显示已通过审核的试题。可进行预览或退回试题。若删除则进入回收站']" />
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
        :showBtnDelete="false"
        :showBtnEdit="false"
        :showBtnExam="true"
        :showBatchDelete="false"
        @findPage="findPage"
        @handleDetail="handleDetail"
        @handleExam="handleExam"
        @handleEdit="handleEdit"
        @handleBatchDelete="handleBatchDelete"
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
      <!--    退回试题弹框-->
      <el-dialog
        width="500px"
        title="退回原因"
        append-to-body
        :visible.sync="quitVisible">
        <div class="quit_box">
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="5"
            placeholder="请输入退回原因">
          </el-input>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button :size="size" @click.native="quitVisible = false">{{$t('action.cancel')}}</el-button>
          <el-button :size="size" type="primary" @click.native="quitReason">提交</el-button>
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
  import {addBean, queryBean, updateBean,updateBatchBean,findMyExamPaper} from "@/http/base";
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
        quitVisible:false, //批量新增界面是否显示
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
        rejectReason:''
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
        pageRequest.condition.status = 1;
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
      // 单个删除
      handleDelete: function (params) {
        let condition={
          examQuestIds:[params.row.id]
        };
        let pageInfo={};
        findMyExamPaper('ExamPaper',condition).then(res =>{
          if(res.retCode === 0 && res.bean.total >0){
            if(res.bean.data.findIndex(item => item.status !== -1)>-1){
              this.isQuote=true;
            }else{
              this.isQuote=false;
            }
            this.paperQuoteData=res.bean.data;
          }else{
            this.isQuote=false;
          }

          if(this.isQuote){
            this.$alert('考试试卷已引用此题不能删除', '提示', {
              confirmButtonText: '确定',
              callback: action => {

              }
            });
          }else{
            this.$confirm('确认删除选中记录吗？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              let data=[params.row];
              this.$api.examquest.batchDelete(data).then(res => {
                if (res.retCode === 0) {
                  this.$message({message: '删除成功', type: 'success'});
                  this.findPage(null)
                }
              }).catch(err =>{
                this.$message(err);
              })
            }).catch(() =>{

            })
          }
        }).catch(err =>{
          this.$message(err);
        });

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
        console.log(params.row);
        this.previewData = Object.assign({},params.row)
        this.detailVisible = true;
      },
      handleExam:function(params){
        this.questId = params.row.id;
        this.quitVisible = true;
      },
      quitReason:function(){
        if (!this.rejectReason) {
          this.$message({
            type:"warning",
            message:'请填写退回原因！！！'
          })
          return false
        }
        let doc = {
          status:-1,
          rejectReason:this.rejectReason,
          id:this.questId
        }
        updateBean('Quest',doc.id,doc).then(res =>{
          if (res.retCode === 0) {
            this.$message({
              type:"success",
              message:'试题退回成功！！！'
            })
            this.rejectReason = '';
            this.findPage(null);
            this.quitVisible = false;
          }
        })
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
          {prop:"difficulty", label:"难易度", minWidth:80,formatter: this.difficultyFilter},
          {prop:"score", label:"分值", minWidth:80},
          // {prop:"creator.name", label:"创建人", minWidth:120},
          {prop:"status", label:"审核状态", minWidth:120, formatter: this.statusFilter},
          {prop:"insertDt", label:"提交时间", minWidth:160 , formatter : this.dateFormat},
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
            if(res.bean.data.findIndex(item => item.status !== -1)>-1){
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


