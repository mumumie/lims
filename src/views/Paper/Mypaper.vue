<template>
  <div class="page-container">
    <div v-if="!isEdit">
      <tip :value="
    ['显示试卷列表，能对试卷进行预览，统计、删除等；',
    '对未开始的试卷可以修改试卷名称、考试时间等；',
    '对已结束的试卷可以进行试卷批阅。']" />
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
        :showBtnApprove="true"
        customLabel="统计"
        @handleCustom="handleCustom"
        @handleApprove="handleApprove"
        @findPage="findPage"
        @handleDetail="handleDetail"
        @handleEdit="handleEdit"
        @handleBatchDelete="handleBatchDelete"
        @handleDelete="handleDelete">
      </kt-table>
      <!--新增编辑界面-->
      <el-dialog title="编辑" width="600px" :visible.sync="editVisible" :close-on-click-modal="false" append-to-body>
        <el-form :model="dataForm" label-width="100px" :rules="dataFormRules" ref="dataForm" :size="size" label-position="right">
          <el-form-item label="试卷名称" prop="name">
            <el-input v-model="dataForm.name" placeholder="请输入试卷名称" style="width:193px;"></el-input>
          </el-form-item>
          <el-form-item label="及格分数线" prop="passScore">
            <el-input v-model="dataForm.passScore" style="width:193px;"></el-input>
          </el-form-item>
          <el-form-item label="考试日期" prop="date">
            <el-date-picker
              v-model="dataForm.date"
              style="width:190px;"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="选择一个日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="起始时间" prop="startTime">
            <el-time-select
              placeholder="起始时间"
              style="width:190px;"
              v-model="dataForm.startTime"
              :picker-options="{start: '00:00',step: '00:05',end: '24:00'}">
            </el-time-select>
          </el-form-item>
          <el-form-item label="结束时间" prop="endTime">
            <el-time-select
              placeholder="结束时间"
              style="width:190px;"
              v-model="dataForm.endTime"
              :picker-options="{start: '08:00',step: '00:15',end: '24:00',minTime: dataForm.startTime}">
            </el-time-select>
          </el-form-item>
          <el-form-item label="用户组范围" >
            <el-cascader
              :options="deptData"
              v-model="dataForm.deptmentIds"
              :props="{multiple: true,checkStrictly: true}"
              collapse-tags
              clearable>
            </el-cascader>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button :size="size" @click.native="editVisible = false">{{$t('action.cancel')}}</el-button>
          <el-button :size="size" type="primary" @click.native="submitForm(-1)" :loading="editLoading" v-if="dataForm.status === -1">保存</el-button>
          <el-button :size="size" type="primary" @click.native="submitForm(0)" :loading="editLoading">保存并发布</el-button>
        </div>
      </el-dialog>
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
          <el-divider></el-divider>
          <m-echarts
            v-if="pieData.pass.e.length !== 0"
            id="pass"
            :echartStyle="pieData.pass.s"
            :titleText="pieData.pass.a"
            :tooltipFormatter="pieData.pass.b"
            :opinion="pieData.pass.c"
            :seriesName="pieData.pass.d"
            :opinionData="pieData.pass.e"
            v-on:currentEchartData="getEchartData"
          ></m-echarts>
        </div>
      </el-dialog>
<!--      批阅弹窗-->
      <el-drawer
        :with-header="false"
        append-to-body
        size="50%"
        :visible.sync="drawer"
        direction="rtl">
        <h1 style="text-align: center;">{{paper.name}}</h1>
        <ExamResult :paper="paper" v-if="drawer"></ExamResult>
      </el-drawer>
    </div>
  </div>
</template>

<script>
  import PopupTreeInput from "@/components/PopupTreeInput"
  import KtTable from "@/views/Core/PaperTable"
  import KtButton from "@/views/Core/KtButton"
  import EditQuest from "@/views/Tq/EditQuest"
  import ExamResult from "./ExamResult"
  import TableColumnFilterDialog from "@/views/Core/TableColumnFilterDialog"
  import { format } from "@/utils/datetime"
  import {addBean, queryBean, updateBean,findMyExamPaper,aggregate} from "@/http/base";
  import mEcharts from '@/components/Echarts/EchartsPie'
  import {mapTree} from "../../utils";
  import {queryCount} from "../../http/base";
  export default {
    name:'mypaper',
    components:{
      PopupTreeInput,
      KtTable,
      KtButton,
      TableColumnFilterDialog,
      EditQuest,
      mEcharts,
      ExamResult
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
        paperVisible: false, // 批阅
        editVisible: false, // 新增编辑界面是否显示
        statisticsVisible:false,
        editLoading: false,
        loading:false,
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
          pass:{
            a:'及格/不及格所占比例(仅已阅卷)',
            b:'数量',
            c:[],
            d:'所占比例',
            e:[],
            s: {
              height: '400px'
            }
          },
        },
        drawer: false,
        paper: {},
        dataForm: {
          name: '',
          passScore: '',
          date: '',
          startTime: '',
          endTime: '',
          deptmentIds: []
        },
        dataFormRules: {
          name: [
            {required: true, message: '请输入试卷名称', trigger: 'blur'}
          ],
          passScore: [
            {required: true, message: '请输入及格分数线', trigger: 'blur'}
          ],
          date: [
            {required: true, message: '选择考试日期', trigger: 'change'}
          ],
          startTime: [
            {required: true, message: '请选择开始时间', trigger: 'change'}
          ],
          endTime: [
            {required: true, message: '请选择结束时间', trigger: 'change'}
          ]
        },
        deptData: []
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
      findDeptTree: function () {
        this.$api.dept.findDeptTree().then((res) => {
          let options=function(option){
            let data=option.map( item =>{
              let arrStr={};
              arrStr.value=item.id;
              arrStr.label=item.name;
              if(item.children.length === 0){
              }else{
                arrStr.children=options(item.children);
              }
              return arrStr;
            })
            return data;
          }
          this.deptData=options(res.bean.data)
        })
      },
      submitForm(status) {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            const params = Object.assign({}, this.dataForm);
            params.deptmentIds = params.deptmentIds.flat();
            params.status = status;
            updateBean('Paper', params.id, params).then(res =>{
              if (res.retCode === 0) {
                this.findPage(null)
                this.$message({
                  type: 'success',
                  message: '试卷修改成功！'
                })
                this.editVisible = false;
              }
            })
          }
        })
      },
      handleClose(done) {
        this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {});
      },
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
          "paperId": paperId
        }).then(res => {
          let questIds = res.bean.data.map(v => v.questId);
          let condition = {"id$in": questIds}
          Promise.all([aggregate("Quest", "chapter", condition),aggregate("Quest", "type", condition),aggregate("Quest", "difficulty", condition),aggregate("PaperResult", "scoreDegree", {
            "status":2,
            "paperId": paperId
          })]).then(res =>{
            let pieData = res.map(v =>{
              mapTree(v.bean, {"name": "_id", "value": "count"})
              return v.bean;
            })
            this.pieData.chapter.e = pieData[0];
            this.pieData.chapter.c = pieData[0].map(v => v.name);
            this.pieData.type.e = pieData[1];
            this.pieData.type.c = pieData[1].map(v => v.name);
            // console.log(pieData[1])
            // console.log(pieData[pieData[1].map(v => v.name)])
            this.pieData.difficulty.e = pieData[2].map(v =>{
              v.name = this.difficulty[v.name];
              return v;
            });
            this.pieData.difficulty.c = this.pieData.difficulty.e.map(v => v.name);
            if (pieData[3].length==0){
              this.pieData.pass.e = []
            }else {
              let passType = ['不及格','及格'];
              this.pieData.pass.e = pieData[3].map(v => {
                v.name = passType[v.name];
                return v
              })
              this.pieData.pass.c = this.pieData.pass.e.map(v => v.name)
              console.log(this.pieData.pass.c);
            }
            this.statisticsVisible = true;
          })

            // aggregate("PaperResult", "scoreDegree", {
            //   "status":2,
            //   "paperId": paperId
            // }).then(res => {
            //
            // });

          /*let passList = [];
          let passScore = params.row.passScore
          queryCount("PaperResult", {
            "paperId": paperId,
            "totalScore$gte": passScore,

          }).then(res=>{
            passList.push({
              "name": '不及格',
              "value": '及格'
            })

          })*/

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
          paperId:params.row.id
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
          let questList = res.bean.data.map(item =>{
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
          this.paperVisible = true;
        })
        // this.previewData = Object.assign({},params.row)
      },
      // 批阅
      handleApprove:function(params){
        this.paper = params.row;
        if (params.row.status === -1 || params.row.status === 0) {
          this.dataForm = {
            id: params.row.id,
            name: params.row.name,
            passScore: params.row.passScore,
            date: params.row.date,
            startTime: params.row.startTime,
            endTime: params.row.endTime,
            deptmentIds: params.row.deptmentIds,
            status: params.row.status
          }
          this.editVisible = true;
        } else if (params.row.status === 1) {
          this.$message({
            type: 'warning',
            message: '考试进行中，请考试结束后进行批阅！'
          })
        } else if (params.row.status === 2) {
          this.drawer = true;
        }
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
          {prop:"name", label:"试卷名称"},
          {prop:"questBank.name", label:"题库名称"},
          {prop:"date", label:"考试日期"},
          {prop:"startTime", label:"开始"},
          {prop:"endTime", label:"结束"},
          {prop:"status", label:"状态", formatter: this.statusFilter},
          {prop:"questBank.course.name", label:"课程名称"},
          {prop:"createAnnual", label:"学年", formatter: this.annualFilter},
          {prop:"semester", label:"学期"},
          {prop:"waitForReview", label:"待批阅"},
          // {prop:"deptmentIds", label:"用户组范围"},

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
      this.findDeptTree()
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


