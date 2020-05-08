<template>
  <div class="page-container">
    <div v-if="!isEdit">
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
        :btnWidth="180"
        permsDetail=""
        permsEdit=""
        permsDelete=""
        :data="pageResult"
        :columns="filterColumns"
        :showBtnEdit="false"
        :showBtnDetail="true"
        :showCustom="true"
        customLabel="统计"
        @handleCustom="handleCustom"
        @findPage="findPage"
        @handleDetail="handleDetail"
        @handleEdit="handleEdit"
        @handleBatchDelete="handleBatchDelete"
        @handleDelete="handleDelete">
      </kt-table>
      <!--    试卷展示弹框-->
      <el-dialog
        width="600px"
        title="查看试卷"
        append-to-body
        :visible.sync="paperVisible">
        <div class="paper_box" ref="print" v-if="scoreData.length > 0">
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
            </div>

          </div>

        </div>
        <div slot="footer" class="dialog-footer">
          <el-button :size="size" @click.native="isShowAnswer = !isShowAnswer">{{isShowAnswer?'隐藏答案':'显示答案'}}</el-button>
          <el-button :size="size" @click.native="$print($refs.print)">打印</el-button>
          <el-button :size="size" @click.native="paperVisible = false">{{$t('action.cancel')}}</el-button>
        </div>
      </el-dialog>
      <!--统计界面-->
      <el-dialog title="统计" width="600px" :visible.sync="statisticsVisible" :close-on-click-modal="false" append-to-body>
        <div  v-if="statisticsVisible">
          <m-echarts
            :echartStyle="pieData.type.s"
            id="type"
            :titleText="pieData.type.a"
            :tooltipFormatter="pieData.type.b"
            :opinion="pieData.type.c"
            :seriesName="pieData.type.d"
            :opinionData="pieData.type.e"
            v-on:currentEchartData="getEchartData"
          ></m-echarts>
          <el-divider></el-divider>
          <m-echarts
            v-if="pieData.difficulty.e.length !== 0"
            id="difficulty"
            :echartStyle="pieData.difficulty.s"
            :titleText="pieData.difficulty.a"
            :tooltipFormatter="pieData.difficulty.b"
            :opinion="pieData.difficulty.c"
            :seriesName="pieData.difficulty.d"
            :opinionData="pieData.difficulty.e"
            v-on:currentEchartData="getEchartData"
          ></m-echarts>
          <el-divider></el-divider>
          <m-echarts
            v-if="pieData.chapter.e.length !== 0"
            id="chapter"
            :echartStyle="pieData.chapter.s"
            :titleText="pieData.chapter.a"
            :tooltipFormatter="pieData.chapter.b"
            :opinion="pieData.chapter.c"
            :seriesName="pieData.chapter.d"
            :opinionData="pieData.chapter.e"
            v-on:currentEchartData="getEchartData"
          ></m-echarts>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import PopupTreeInput from "@/components/PopupTreeInput"
  import KtTable from "@/views/Core/PaperTable"
  import KtButton from "@/views/Core/KtButton"
  import EditQuest from "@/views/Tq/EditQuest"
  import TableColumnFilterDialog from "@/views/Core/TableColumnFilterDialog"
  import { format } from "@/utils/datetime"
  import {addBean, queryBean, updateBean,findMyExamPaper,aggregate} from "@/http/base";
  import mEcharts from '@/components/Echarts/EchartsPie'
  import {mapTree} from "../../utils";
  export default {
    name:'mypaper',
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
        isShowAnswer:false,
        pieData:{
          chapter:{
            a:'试卷内各章节所占比例',
            b:'数量',
            c:[],
            d:'所占比例',
            e:[],
            s: {
              height: '400px'
            }
          },
          type:{
            a:'试卷内各题型所占比例',
            b:'数量',
            c:[],
            d:'所占比例',
            e:[],
            s: {
              height: '400px'
            }
          },
          difficulty:{
            a:'试卷内难易度所占比例',
            b:'数量',
            c:[],
            d:'所占比例',
            e:[],
            s: {
              height: '400px'
            }
          },
        }
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
        pageRequest.condition['status$ne'] = 3;
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

      handleCustom:function(params){
        //let paperId = params.row.id;
        let paperId = params.row.id;
        this.$api.base.queryBean("PaperQuest", {
          "paperQuestId": paperId
        }).then(res => {
          let questIds = res.bean.data.map(v => v.questId);
          let condition = {"id$in": questIds}
          Promise.all([aggregate("Quest", "chapter", condition),aggregate("Quest", "type", condition),aggregate("Quest", "difficulty", condition)]).then(res =>{
            let pieData = res.map(v =>{
              mapTree(v.bean, {"name": "_id", "value": "count"})
              return v.bean;
            })
            this.pieData.chapter.e = pieData[0];
            this.pieData.chapter.c = pieData[0].map(v => v.name);
            this.pieData.type.e = pieData[1];
            this.pieData.type.c = pieData[1].map(v => v.name);
            this.pieData.difficulty.e = pieData[2].map(v =>{
              let difficult = this.difficulty[v.name];
              v.name = difficult;
              return v;
            });
            this.pieData.difficulty.c = this.pieData.difficulty.e.map(v => v.name);
            this.statisticsVisible = true;
          })
          // aggregate("Quest", "chapter", condition).then(res => {
          //   mapTree(res.bean, {"name": "_id", "value": "count"})
          //   console.log(res.bean)
          // });
          // aggregate("Quest", "type", condition).then(res => {
          //   mapTree(res.bean, {"name": "_id", "value": "count"})
          //   console.log(res.bean)
          // });
          // aggregate("Quest", "difficulty", condition).then(res => {
          //   mapTree(res.bean, {"name": "_id", "value": "count"})
          //   console.log(res.bean)
          // });
        })
      },
      getEchartData(val){
        console.log(val);
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
        let postData = {
          paperQuestId:params.row.id
        }
        queryBean('PaperQuest',postData).then(res =>{
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
          this.paperVisible = true;
        })

        // this.previewData = Object.assign({},params.row)

      },
      handleApprove:function(params){
        this.$confirm('确定提交审核, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let doc = {
            status:1
          }
          if(params.row.questBank.reviewerId === ''){
            doc.status = 2;
          }
          updateBean('Quest',params.row.id,doc).then(res =>{
            if (res.retCode === 0) {
              if (doc.status === 1) {
                this.$message({
                  type:"success",
                  message:'已提交审核！！！'
                })
              }else{
                this.$message({
                  type:"success",
                  message:'此试题无需审核，直接审核通过！！！'
                })
              }
              this.findPage(null)
            }
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
          {prop:"questBank.course.name", label:"课程名称", minWidth:120},
          {prop:"questBank.name", label:"题库名称", minWidth:120},
          {prop:"name", label:"试卷名称", minWidth:120},
          {prop:"createAnnual", label:"学年", minWidth:120, formatter: this.annualFilter},
          {prop:"semester", label:"学期", minWidth:120},
          // {prop:"status", label:"审核状态", minWidth:120, formatter: this.statusFilter},
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
        if (row.status === 0) {
          return '未提交';
        } else if (row.status === 1) {
          return '审核中';
        } else if (row.status === 2) {
          return '已审核';
        } else if (row.status === 3) {
          return '回收站';
        } else {
          return ' - ';
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
</style>


