<template>
  <div class="page-container">
    <div v-if="!isEdit">
      <tip :value="
    ['显示学生的考试列表，状态分别为未开始、进行中、已结束。',
    '未开始的考试需等待，进行中的考试可以点击进入考试，已结束的考试待老师批阅完之后可以查看考试结果。']" />
      <!--工具栏-->
      <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
        <el-form :inline="true" :model="filters" :size="size">
          <el-form-item>
            <el-select v-model="filters.questBankId" clearable placeholder="请选择课程">
              <el-option :label="item.name" :value="item.id" v-for="item in questBankData" :key="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="filters.createAnnual" clearable placeholder="请选择学年" >
              <el-option :label="item.label" :value="item.value" v-for="(item,index) in createAnnualData" :key="index"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="filters.semester" clearable placeholder="请选择学期">
              <el-option label="第一学期" value="第一学期" ></el-option>
              <el-option label="第二学期" value="第二学期" ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model="filters.name" placeholder="试卷名称"></el-input>
          </el-form-item>
          <el-form-item>
            <kt-button icon="fa fa-search" :label="$t('action.search')" perms="" type="primary" @click="findPage(null)"/>
          </el-form-item>
        </el-form>
      </div>
      <!--表格内容栏-->
      <kt-table
        :height="600"
        :maxHeight="600"
        :btnWidth="90"
        permsDetail=""
        permsEdit=""
        permsDelete=""
        :data="pageResult"
        :columns="filterColumns"
        :showBtnEdit="false"
        :showBtnDelete="false"
        :showBtnApprove="true"
        :showBatchDelete="false"
        @handleApprove="handleApprove"
        @findPage="findPage"
        @handleDetail="handleDetail"
        @handleEdit="handleEdit"
        @handleBatchDelete="handleBatchDelete"
        @handleDelete="handleDelete">
      </kt-table>
      <!--    试卷展示弹框-->
      <el-dialog
        width="800px"
        title="试卷结果"
        append-to-body
        :visible.sync="paperVisible">
        <div></div>
        <div class="paper_box" ref="print" v-if="scoreData.length > 0">
          <div style="line-height: 80px;font-size: 25px;font-weight:bold;">
            <span v-if="paperResult.status === 1">客观题得分：{{paperResult.objScore}}</span>
            <span style="padding-left:20px;color:#ff3724;" v-if="paperResult.status === 1">总得分请等待老师批阅！</span>
            <span v-if="paperResult.status === 2">总得分：{{paperResult.totalScore}}</span>
          </div>
          <div v-for="(item,index) in scoreData" :key="index">
            <h3>{{AnswerIndex[index]+'、'+item.name + '(共' +item.count+'题，共'+ item.totalScore+ '分)'}}</h3>
            <div v-for="(ite,ind) in item.children" :key="ind" class="paper_quest">
              <div class="paper_title">
                <div>{{ind+1+'、'}}</div>
                <div class="paper_content" v-html="ite.content"></div>
              </div>

              <div v-if="ite.baseType === 1 || ite.baseType === 2">
                <div v-for="(opt,index) in ite.option" class="paper_option">
                  <div>{{AnswerType[index] + '、 '}}</div>
                  <div v-html="opt"></div>
                </div>
              </div>
              <div>
                <span>作答结果： </span>
                <span :class="ite.flag ? 'success' : 'error'" v-if="ite.baseType !== 5">
                  {{ ite.answer && ite.answer.length ? ite.answer.toString() : '未作答' }}
                  <i :class="ite.flag ? 'el-icon-check' : 'el-icon-close'"></i>
                </span>
                <div v-else v-html="ite.answer"></div>
              </div>
              <div class="detail_content" v-show="isShowAnswer">
                <div v-if="ite.baseType === 1 || ite.baseType === 2">
                  <span>正确答案：</span><i v-for="(optAsw,oi) in ite.optionAnswer" :key="oi">{{AnswerType[optAsw] + ((ite.optionAnswer.length-1)===oi?'':'，') }}</i>
                </div>
                <div v-if="ite.baseType === 3">
                  <span>正确答案：</span><i>{{ite.tfAnswer===true?'对': ite.tfAnswer === false ? '错' : '-'}}</i>
                </div>
                <div v-if="ite.baseType === 4">
                  <span>正确答案：</span>
                  <div v-for="(blank,bi) in ite.blankAnswer" style="display: flex;">
                    <div>{{'填空' + (bi+1) + '：'}}</div>
                    <div v-html="blank"></div>
                  </div>
                </div>
                <div v-if="ite.baseType === 5">
                  <span>正确答案：</span>
                  <div v-html="ite.subjectAnswer"></div>
                </div>
              </div>
              <div v-if="ite.baseType === 5 && paperResult.status === 2" style="line-height: 38px;font-weight: 700;" >
                <el-row>
                  <el-col :span="15">得分：{{ite.topScore}}</el-col>
                </el-row>
                <el-row>
                  <el-col :span="3">点评：</el-col>
                  <el-col :span="21">
                    {{ite.comment}}
                  </el-col>
                </el-row>
              </div>
            </div>
          </div>
          <div style="line-height: 30px;height:30px;padding-left:20px;">
<!--            <el-checkbox v-model="paperResult.anonymous" v-if="paperResult.status === 1">是否匿名</el-checkbox>-->
            <p v-if="paperResult.status === 2 && !paperResult.anonymous">阅卷人：{{paperResult.reviewer.nickname}}</p>
          </div>
        </div>
        <div slot="footer" class="dialog-footer">
<!--          <el-button :size="size" @click.native="isShowAnswer = !isShowAnswer">{{isShowAnswer?'隐藏答案':'显示答案'}}</el-button>-->
<!--          <el-button :size="size" @click.native="$print($refs.print)">打印</el-button>-->
          <el-button :size="size" @click.native="paperVisible = false">{{$t('action.cancel')}}</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import PopupTreeInput from "@/components/PopupTreeInput"
  import KtTable from "@/views/Core/PaperExamTable"
  import KtButton from "@/views/Core/KtButton"
  import EditQuest from "@/views/Tq/EditQuest"
  import TableColumnFilterDialog from "@/views/Core/TableColumnFilterDialog"
  import { format } from "@/utils/datetime"
  import {addBean, queryBean, updateBean, getBean, aggregate} from "@/http/base";
  import mEcharts from '@/components/Echarts/EchartsPie'
  import {mapTree} from "../../utils";
  export default {
    name:'Exam',
    components:{
      PopupTreeInput,
      KtTable,
      KtButton,
      TableColumnFilterDialog,
      EditQuest,
      mEcharts
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
        paperVisible: false, // 新增编辑界面是否显示
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
        isEdit:false,
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
        this.$api.paper.findPage(pageRequest).then((res) => {
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
      //考试
      handleApprove:function(params){
        const date = new Date().getTime()
        if (params.row.validTime[0] > date) {
          this.$message({
            type: 'warning',
            message: '考试还未开始，请耐心等待！'
          })
        } else if (params.row.validTime[0] <= date && date <= params.row.validTime[1]) {
          if(params.row.paperResult === null){
            queryBean('PaperQuest', {paperId: params.row.id}).then(res =>{
              let arrValues = res.bean.data.map((item) => ({questId: item.questId}));
              let doc={
                paperId: params.row.id,
                paperResultAnswerList: arrValues
              };
              addBean('PaperResult', doc).then(res =>{
                if (res.retCode===0){
                  this.$message.success('进入考试！')
                  setTimeout(() =>{
                    this.$router.push('/Paper/ExamDetail?id=' + params.row.id);
                  },500)
                }
              }).catch(err =>{
                this.$message('添加试卷失败！'+err)
              })
            })
          } else {
            // 通过菜单URL跳转至指定路由
            if (params.row.paperResult.status === 1) {
              this.$message.warning('您已提交该试卷，请耐心等待老师批阅！')
            } else {
              this.$router.push('/Paper/ExamDetail?id=' + params.row.id);
            }
          }
        } else if (params.row.validTime[1] < date) {
          if (params.row.paperResult !== null && params.row.paperResult.status !== 0) {
            this.handleDetail(params)
          } else {
            this.$message({
              type: 'warning',
              message: '您未提交此次考试答案，无结果查看！'
            })
          }

        }
      },
      // 单个删除
      handleDelete: function (params) {
        this.$confirm('试卷删除后不可恢复，确定删除这一项吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$api.paper.singleDelete(params.row).then(res =>{
            if (res.retCode === 0) {
              this.$message({
                type:"success",
                message:'已删除试卷！！！'
              })
              this.findPage(null)
            }
          })
        }).catch(() =>{

        })
      },
      // 批量删除
      handleBatchDelete: function (params) {
        this.$confirm('试卷删除后不可恢复，确定批量删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$api.paper.deleteBatchBean(params).then(res =>{
            if (res.retCode === 0) {
              this.$message({
                type:"success",
                message:'已批量删除试卷！！！'
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
        this.paperResult = params.row.paperResult;
        let postData = {
          paperId:params.row.id
        }
        queryBean('PaperQuest', postData).then(res =>{
          let questBankData = params.row.questBank;
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
          let scoreData=[];
          let questList=res.bean.data.map(item =>{
            item.quest.score = item.score
            return item.quest;
          });
          typeData.forEach((item,index) =>{
            scoreData[index]={};
            scoreData[index].name = item.value;
            scoreData[index].baseType = item.type;
            scoreData[index].count = questList.filter(type => type.type === item.value).length;
            scoreData[index].children = questList.filter(type => type.type === item.value);
            scoreData[index].totalScore = scoreData[index].children.reduce((prev,next) => (prev + next.score), 0);
          })
          this.scoreData = scoreData.filter(item => item.count !== 0);
          this.scoreData.map(item => {
            item.children.map(v => {
              const answer = params.row.paperResult.paperResultAnswerList.filter(item => item.questId === v.id)[0]
              if (v.baseType === 1) {
                v.answer = answer.optionAnswer && answer.optionAnswer.length > 0 ? this.AnswerType[answer.optionAnswer[0]] : ''
              } else if (v.baseType === 2) {
                v.answer = answer.optionAnswer.map(v => this.AnswerType[v])
              } else if (v.baseType === 3) {
                v.answer = answer.tfAnswer
              } else if (v.baseType === 4) {
                v.answer = answer.blankAnswer
              } else if (v.baseType === 5) {
                v.answer = answer.answerContent
              }
              this.$set(v, 'topScore', answer.score)
              this.$set(v, 'comment', answer.comment)
              v.flag = answer.score > 0 ? true : false;
            })
          })
          this.paperVisible = true;
        })

        // this.previewData = Object.assign({},params.row)

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
          {prop:"name", label:"试卷名称", minWidth:120},
          {prop:"questBank.course.name", label:"课程名称", minWidth:120},
          {prop:"questBank.name", label:"题库名称", minWidth:120},
          {prop:"createAnnual", label:"学年", minWidth:120, formatter: this.annualFilter},
          {prop:"semester", label:"学期", minWidth:120},
          {prop:"date", label:"考试日期", minWidth:120},
          {prop:"startTime", label:"开始时间点", minWidth:120},
          {prop:"endTime", label:"结束时间点", minWidth:120},
          {prop:"status", label:"状态", minWidth:120, formatter: this.statusFilter},
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
          return '未开始';
        } else if (row.status === 1) {
          return '进行中';
        } else if (row.status === 2) {
          return '已结束';
        } else {
          return '-';
        }
      },
      //过滤状态字段
      annualFilter:function(row, column, cellValue, index) {
        if (row.createAnnual === 2015) {
          return '2015-2016';
        } else if (row.createAnnual === 2016) {
          return '2016-2017';
        }else if (row.createAnnual === 2017) {
          return '2017-2018';
        }else if (row.createAnnual === 2018) {
          return '2018-2019';
        }else if (row.createAnnual === 2019) {
          return '2019-2020';
        } else if (row.createAnnual === 2020) {
          return '2020-2021';
        } else {
          return ' - ';
        }
      },
    },
    created() {

    },
    mounted() {
      this.findQuestBank();
      this.initColumns();
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


