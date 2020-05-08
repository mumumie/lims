<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
          <el-input v-model="filters.name" placeholder="试卷名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="filters.status"
            placeholder="状态"
            clearable
            style="width:100px;">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="" type="primary" @click="findPage(null)"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')"  perms="" type="primary" @click="handleAdd" />
        </el-form-item>
<!--        <el-form-item>-->
<!--          <kt-button  icon="el-icon-upload" label="批量添加" perms="sys:user:add" type="primary" @click="handleBatchAdd" />-->
<!--        </el-form-item>-->
      </el-form>
    </div>
    <div class="toolbar" style="float:right;padding-top:10px;padding-right:15px;">
      <el-form :inline="true" :size="size">
        <el-form-item>
          <el-button-group>
            <el-tooltip content="刷新" placement="top">
              <el-button icon="fa fa-refresh" @click="findPage(null)"></el-button>
            </el-tooltip>
            <el-tooltip content="列显示" placement="top">
              <el-button icon="fa fa-filter" @click="displayFilterColumnsDialog"></el-button>
            </el-tooltip>
            <el-tooltip content="导出" placement="top">
              <el-button icon="fa fa-file-excel-o"></el-button>
            </el-tooltip>
          </el-button-group>
        </el-form-item>
      </el-form>
      <!--表格显示列界面-->
      <table-column-filter-dialog
        ref="tableColumnFilterDialog"
        :columns="columns"
        @handleFilterColumns="handleFilterColumns">
      </table-column-filter-dialog>
    </div>
    <!--表格内容栏-->
    <kt-table
      :height="600"
      :maxHeight="600"
      :btnWidth="180"
      permsEdit=""
      permsDelete=""
      permsDetail=""
      permsExam=""
      permsPass=""
      :data="pageResult"
      :columns="filterColumns"
      @findPage="findPage"
      @handleEdit="handleEdit"
      @handleDetail="handleDetail"
      @handleExam="handleExam"
      @handlePass="handlePass"
      @handleApprove="handleApprove"
      :showBtnPass="true"
      :showBtnDetail="true"
      :showBtnEdit="true"
      :showBtnDelete="true"
      :showBtnExam="true"
      :showBtnApprove="true"
      @handleDelete="handleDelete">
    </kt-table>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="80%" :visible.sync="dialogVisible" :close-on-click-modal="false" append-to-body>
      <el-form :model="dataForm" label-width="100px" :rules="dataFormRules" ref="dataForm" :size="size"
               label-position="right">
        <div style="width:90%;margin:0 auto;">
          <el-form-item label="试卷名称" prop="name" style="margin-bottom:10px;">
            <el-input v-model="dataForm.name" auto-complete="off" size="mini" placeholder="试卷名称"></el-input>
          </el-form-item>
          <div class="question_type">
            <div class="question_type_title" style="padding-bottom: 1px;">
              <h4>单选题</h4>
              <i class="el-icon-circle-plus" @click="addQuestion(1)"></i>
            </div>
            <el-table
              :data="singleData"
              size="mini"
              border
              style="width: 100%">
              <el-table-column
                prop="subject"
                label="题目"
                show-overflow-tooltip>
              </el-table-column>
              <el-table-column
                prop="difficulty"
                label="难度级别"
                :formatter="difficultyFilter"
                width="100">
              </el-table-column>
              <el-table-column
                prop="scoreWeight"
                label="分值"
                width="100">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.score" size="mini"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                  <i class="el-icon-top"  @click="handleAscending(scope.$index, scope.row , singleData)"></i>
                  <i class="el-icon-bottom" @click="handleDescending(scope.$index, scope.row , singleData)"></i>
                  <i class="el-icon-delete" @click="handleDeleting(scope.$index, scope.row , singleData)"></i>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="question_type">
            <div class="question_type_title">
              <h4>多选题</h4>
              <i class="el-icon-circle-plus" @click="addQuestion(2)"></i>
            </div>
            <el-table
              :data="multipleData"
              size="mini"
              :show-header="false"
              border
              style="width: 100%">
              <el-table-column
                prop="subject"
                label="题目"
                show-overflow-tooltip>
              </el-table-column>
              <el-table-column
                prop="difficulty"
                label="难度级别"
                :formatter="difficultyFilter"
                width="100">
              </el-table-column>
              <el-table-column
                prop="scoreWeight"
                label="分值"
                width="100">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.score" size="mini"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                  <i class="el-icon-top"  @click="handleAscending(scope.$index, scope.row , multipleData)"></i>
                  <i class="el-icon-bottom" @click="handleDescending(scope.$index, scope.row , multipleData)"></i>
                  <i class="el-icon-delete" @click="handleDeleting(scope.$index, scope.row , multipleData)"></i>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="question_type">
            <div class="question_type_title">
              <h4>判断题</h4>
              <i class="el-icon-circle-plus" @click="addQuestion(3)"></i>
            </div>
            <el-table
              :data="judgeData"
              size="mini"
              :show-header="false"
              border
              style="width: 100%">
              <el-table-column
                prop="subject"
                label="题目"
                show-overflow-tooltip>
              </el-table-column>
              <el-table-column
                prop="difficulty"
                label="难度级别"
                :formatter="difficultyFilter"
                width="100">
              </el-table-column>
              <el-table-column
                prop="scoreWeight"
                label="分值"
                width="100">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.score" size="mini"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                  <i class="el-icon-top"  @click="handleAscending(scope.$index, scope.row , judgeData)"></i>
                  <i class="el-icon-bottom" @click="handleDescending(scope.$index, scope.row , judgeData)"></i>
                  <i class="el-icon-delete" @click="handleDeleting(scope.$index, scope.row , judgeData)"></i>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="question_type">
            <div class="question_type_title">
              <h4>填空题</h4>
              <i class="el-icon-circle-plus" @click="addQuestion(4)"></i>
            </div>
            <el-table
              :data="gapfillData"
              size="mini"
              :show-header="false"
              border
              style="width: 100%">
              <el-table-column
                prop="subject"
                label="题目"
                show-overflow-tooltip>
              </el-table-column>
              <el-table-column
                prop="difficulty"
                label="难度级别"
                :formatter="difficultyFilter"
                width="100">
              </el-table-column>
              <el-table-column
                prop="score"
                label="分值"
                width="100">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.score" size="mini"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                  <i class="el-icon-top"  @click="handleAscending(scope.$index, scope.row , gapfillData)"></i>
                  <i class="el-icon-bottom" @click="handleDescending(scope.$index, scope.row , gapfillData)"></i>
                  <i class="el-icon-delete" @click="handleDeleting(scope.$index, scope.row , gapfillData)"></i>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="question_type">
            <div class="question_type_title">
              <h4>问答题</h4>
              <i class="el-icon-circle-plus" @click="addQuestion(5)"></i>
            </div>
            <el-table
              :data="essayquestionData"
              size="mini"
              :show-header="false"
              border
              style="width: 100%;margin-bottom:20px;">
              <el-table-column
                prop="subject"
                label="题目"
                show-overflow-tooltip>
              </el-table-column>
              <el-table-column
                prop="difficulty"
                label="难度级别"
                :formatter="difficultyFilter"
                width="100">
              </el-table-column>
              <el-table-column
                prop="scoreWeight"
                label="分值"
                width="100">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.score" size="mini"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                  <i class="el-icon-top"  @click="handleAscending(scope.$index, scope.row , essayquestionData)"></i>
                  <i class="el-icon-bottom" @click="handleDescending(scope.$index, scope.row , essayquestionData)"></i>
                  <i class="el-icon-delete" @click="handleDeleting(scope.$index, scope.row , essayquestionData)"></i>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-form-item label="试卷总分值" prop="scoreSum">
<!--            <el-input v-model.number="scoreSum()" auto-complete="off" size="mini" placeholder="试卷总分值"></el-input>-->
            {{scoreSum}}
          </el-form-item>
        </div>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" @click.native="saveForm" :loading="editLoading">{{$t('action.save')}}</el-button>
        <el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">{{$t('action.submit')}}</el-button>
      </div>
      <QuestionSelect
        :type="questionType"
        ref="myQuestion"
        :dialogVisible="addQuestionVisible"
        @changeQuestion="changeQuestion"
        @dialogVisible="questionVisible">
      </QuestionSelect>
    </el-dialog>
    <!--    详情展示弹框-->
    <el-dialog
      width="60%"
      title="详情"
      append-to-body
      :visible.sync="detailVisible">
      <div v-for="(item,index) in questData" :key="item.id">
        <el-alert
          :title="(index+1) + '、'+item.subject+'('+queryType[(item.type-1)]+examPaperScores[index].scoreWeight+'分)'"
          type="info"
          :closable="false">
        </el-alert>
        <div class="queryContent">
          <p v-for="(opt,index) in item.option" :key="index" v-if="(item.type===1||item.type===2) && item.optionType===0">{{AnswerType[index]+'、 '+opt}}</p>
          <div class="optionPic" v-if="(item.type===1||item.type===2) && item.optionType===1">
            <div v-for="(opt,inde) in item.option" :key="inde">
              <img  :src="global.baseUrl+opt" alt="">
              <p>{{AnswerType[inde]}}</p>
            </div>
          </div>
          正确答案：
          <span v-if="item.type===1||item.type===2">
            <i v-for="(optAsw,index) in item.optionAnswer" :key="index">{{AnswerType[optAsw] + ((item.optionAnswer.length-1)===index?'':'，') }}</i>
          </span>
          <span v-if="item.type===3">
            <i>{{item.tfAnswer===true?'对':'错'}}</i>
          </span>
          <span v-if="item.type===4">
            <i v-for="(blkAsw,index) in item.blankAnswer" :key="index">{{blkAsw  + ((item.blankAnswer.length-1)===index?'':'，') }}</i>
          </span>
          <span v-if="item.type===5">
            <i>{{item.content}}</i>
          </span>
          <p>答案解析：{{item.note}}</p>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="detailVisible = false">{{$t('action.cancel')}}</el-button>
      </div>
    </el-dialog>
    <!--    考试结果弹框-->
    <el-dialog
      width="60%"
      title="考试结果"
      append-to-body
      :visible.sync="examResultVisible">
      <div v-for="(item,index) in examResultAnswersData" :key="item.id" >
        <el-alert
          :title="(index+1) + '、'+item.subject+'('+queryType[(item.type-1)]+examPaperScores[index].scoreWeight+'分)'"
          type="info"
          :closable="false">
        </el-alert>
        <div class="queryContent">
          <p v-for="(opt,index) in item.option" :key="index" v-if="(item.type===1||item.type===2) && item.optionType===0">{{AnswerType[index]+'、 '+opt}}</p>
          <div class="optionPic" v-if="(item.type===1||item.type===2) && item.optionType===1">
            <div v-for="(opt,inde) in item.option" :key="inde">
              <img  :src="global.baseUrl+opt" alt="">
              <p>{{AnswerType[inde]}}</p>
            </div>
          </div>
          <p>
            作答结果：
            <span v-if="item.type===1||item.type===2" :class="checkResult(item.optionAnswer.toString()) === checkResult(examResultAnswerList[index].optionAnswer.toString())?'success_bg':'error_bg'">
              <i v-for="(optAsw,inde) in examResultAnswerList[index].optionAnswer" :key="inde">{{AnswerType[optAsw]===undefined?'空':AnswerType[optAsw] + ((examResultAnswerList[index].optionAnswer.length-1)===inde?'':'，') }}</i>
              <i :class="checkResult(item.optionAnswer.toString()) === checkResult(examResultAnswerList[index].optionAnswer.toString())?'el-icon-check':'el-icon-close'"></i>
            </span>
            <span v-if="item.type===3" :class="examResultMarkList[index].score === 0?'error_bg':'success_bg'">
              <i>{{examResultAnswerList[index].tfAnswer == '' ? '空' :(examResultAnswerList[index].tfAnswer=='1'?'对':'错')}}</i>
              <i :class="examResultMarkList[index].score === 0?'el-icon-close':'el-icon-check'"></i>
            </span>
            <span v-if="item.type===4" :class="checkBlanckResult(item.blankAnswer,examResultAnswerList[index].blankAnswer)?'success_bg':'error_bg'">
              <i v-for="(blkAsw,index) in examResultAnswerList[index].blankAnswer" :key="index">{{blkAsw  + ((item.blankAnswer.length-1)===index?'':'，') }}</i>
              <i :class="checkBlanckResult(item.blankAnswer,examResultAnswerList[index].blankAnswer)?'el-icon-check':'el-icon-close'"></i>
            </span>
            <span v-if="item.type===5">
             <div class="answerContent" v-html="examResultAnswerList[index].answerContent"></div>
            </span>
          </p>
          正确答案：
          <span v-if="item.type===1||item.type===2">
            <i v-for="(optAsw,index) in item.optionAnswer" :key="index">{{AnswerType[optAsw] + ((item.optionAnswer.length-1)===index?'':'，') }}</i>
          </span>
          <span v-if="item.type===3">
            <i>{{item.tfAnswer===true?'对':'错'}}</i>
          </span>
          <span v-if="item.type===4">
            <i v-for="(blkAsw,index) in item.blankAnswer" :key="index">{{blkAsw  + ((item.blankAnswer.length-1)===index?'':'，') }}</i>
          </span>
          <span v-if="item.type===5">
            <i>{{item.content}}</i>
          </span>
          <p>答案解析：{{item.note}}</p>

        </div>
      </div>
      <div class="approvalResult">{{approvalResult}}</div>
      <p v-if="Approve.status === 2 && !Approve.anonymous">阅卷人：{{Approve.reviewer.name}}</p>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="examResultVisible = false">{{$t('action.cancel')}}</el-button>
      </div>
    </el-dialog>
    <!--    阅卷弹框-->
    <el-dialog
      title="学生试卷"
      width="80%"
      append-to-body
      :visible.sync="studentPaperVisible"
      :close-on-click-modal="false"
      v-if="studentPaperVisible"
      :fullscreen="true">
      <ExamresultSelect :examPaperId="examPaperId"></ExamresultSelect>
    </el-dialog>
  </div>
</template>

<script>
  import PopupTreeInput from "@/components/PopupTreeInput"
  import KtTable from "@/views/Core/ExamTable"
  import KtButton from "@/views/Core/KtButton"
  import TableColumnFilterDialog from "@/views/Core/TableColumnFilterDialog"
  import { format } from "@/utils/datetime"
  import {updateBean,addBean, queryBean, getBean,addBatchBean,findMyExamPaper} from "@/http/base";
  import QuestionSelect from "@/components/ObjectSelect/questionSelect";
  import ExamresultSelect from "@/components/ObjectSelect/ExamresultSelect";
  import { getIFrameUrl, getIFramePath } from '@/utils/iframe';
  import { hasPermission } from '@/permission/index';
  export default {
    name:'ExamPaper',
    components:{
      PopupTreeInput,
      KtTable,
      KtButton,
      TableColumnFilterDialog,
      QuestionSelect,
      ExamresultSelect
    },
    data() {
      return {
        size: 'mini',
        filters: {
          subject: '',
        },
        columns: [],
        filterColumns: [],
        pageRequest: { pageNum: 1, pageSize: 10 },
        pageResult: {},
        tableData:[], //批量导入用户列表
        operation: false, // true:新增, false:编辑
        dialogVisible: false, // 新增编辑界面是否显示
        examResultVisible:false, //考试结果是否显示
        detailVisible:false,//详情界面是否显示
        addQuestionVisible:false,//添加题目界面是否显示
        studentPaperVisible:false,//学生试卷界面是否显示
        editLoading: false,
        loading:false,
        dataFormRules: {
          name: [
            { required: true, message: '请输入试卷名称', trigger: 'blur' }
          ]
        },
        // 新增编辑界面数据
        dataForm: {
          id: 0,
          name: '',
          scoreSum: '',
          examQuestIds:[],
          examPaperScoreIds:[],
        },
        singleData:[],
        multipleData:[],
        judgeData:[],
        gapfillData:[],
        essayquestionData:[],
        examquest: [],
        questData:[],
        examResultAnswersData:[],
        examResultAnswerList:[],
        examPaperScores:[],
        queryType:['单选题','多选题','判断题','填空题','问答题'],
        AnswerType:['A','B','C','D'],
        approvalResult:'',
        questionType:1,
        examPaperId:'',
        Approve:{},
        statusOptions:[
          {value:0,label:'未发布'},
          {value:1,label:'启用'},
          {value:2,label:'停用'},
        ],
      }
    },
    watch:{
      editLoading:function(){
        setTimeout(()=>{
          this.editLoading=false;
        },2000)
      }
    },
    computed:{
      scoreSum:function(){
        let examPaperScores=[
          ...this.ArrayQuestScore(this.singleData),
          ...this.ArrayQuestScore(this.multipleData),
          ...this.ArrayQuestScore(this.judgeData),
          ...this.ArrayQuestScore(this.gapfillData),
          ...this.ArrayQuestScore(this.essayquestionData)
        ];
        let sum=0;
        examPaperScores.forEach((item) =>{
          sum +=item.scoreWeight
        });
        return sum;
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
          pageRequest = data.pageRequest;
        }
        // if(!this.hasPerms('teach:curriculum:edit')){
        //   pageRequest.condition['status.in']=[1,2];
        // }else{
        //   if(this.filters.status > -1){
        //     pageRequest.condition.status = this.filters.status;
        //   }else{
        //     delete pageRequest.condition.status;
        //   }
        // }
        if(this.filters.name){
          pageRequest.condition['name$regex'] = this.filters.name;
        }

        this.$api.exampaper.findPage(pageRequest).then((res) => {
          this.pageResult = res.pageResult;
        }).then(data!=null?data.callback:'')
      },
      // 批量删除
      handleDelete: function (data) {
        this.$api.exampaper.batchDelete(data.params).then(data!=null?data.callback:'')
      },
      // 显示新增界面
      handleAdd: function () {
        this.dialogVisible = true;
        this.operation = true;
        this.dataForm = {
          id: 0,
          name: '',
          scoreSum:100,
          examQuestIds:[],
          examPaperScoreIds:[],
        };
        this.singleData=[];
        this.multipleData=[];
        this.judgeData=[];
        this.gapfillData=[];
        this.essayquestionData=[];
      },
      // 显示编辑界面
      handleEdit: function (params) {
        this.singleData=[];
        this.multipleData=[];
        this.judgeData=[];
        this.gapfillData=[];
        this.essayquestionData=[];
        this.dialogVisible = true;
        this.operation = false;
        this.dataForm = Object.assign({}, params.row);
        params.row.examQuests.forEach((item,index) =>{
          if(params.row.examPaperScores.length>0){
            this.$set(item,'score',params.row.examPaperScores[index].scoreWeight);
          }else{
            this.$set(item,'score',0);
          }
          if(item.type===1){
            this.singleData.push(item)
          }else if(item.type===2){
            this.multipleData.push(item)
          }else if(item.type===3){
            this.judgeData.push(item)
          }else if(item.type===4){
            this.gapfillData.push(item)
          }else if(item.type===5){
            this.essayquestionData.push(item)
          }else{
            this.$message('错误的type类型'+item.type)
          }
        });
      },
      //显示详情页
      handleDetail:function(params){
        this.detailVisible=true;
        this.questData=params.row.examQuests;
        this.examPaperScores=params.row.examPaperScores;
      },
      handleApprove:function(params){
        this.examPaperId=params.row.id;
        this.studentPaperVisible=true;
      },
      //考试
      handleExam:function(params){
        let condition={
          userid:sessionStorage.getItem('userid'),
          examPaperId:params.row.id
        };
        queryBean('ExamResult',condition)
          .then(res =>{
            if(res.retCode===0){
              if(res.bean.total===0){
                let condition= params.row.id;
                getBean('ExamPaper',condition)
                  .then(res =>{
                    let arrValues=res.bean.examQuestIds.map((item) => {
                      return {
                        examQuestId:item
                      }
                    });
                    let doc={
                      examPaperId:params.row.id,
                      objCorrect:params.row.scoreSum,
                      examResultAnswerList:arrValues
                    };

                    addBean('ExamResult',doc)
                      .then(res =>{
                        if (res.retCode===0){
                          let id=res.bean.id;
                          // 如果是嵌套页面，转换成iframe的path
                          let path = getIFramePath('Teach/CurriculumDetail?id='+id);
                          if(!path) {
                            path = 'Teach/CurriculumDetail?id='+id
                          }
                          // 通过菜单URL跳转至指定路由
                          this.$router.push("/" + path);
                        }

                      })
                      .catch(err =>{
                        this.$message('添加试卷失败！'+err)
                      })
                  })

              }
              else if(res.bean.data[0].status===0){
                let id=res.bean.data[0].id;
                console.log(res.bean.data);
                // 如果是嵌套页面，转换成iframe的path
                let path = getIFramePath('Teach/CurriculumDetail?id='+id);
                if(!path) {
                  path = 'Teach/CurriculumDetail?id='+id
                }
                // 通过菜单URL跳转至指定路由
                this.$router.push("/" + path);
              }
              else {
                this.examPaperScores=res.bean.data[0].examPaper.examPaperScores;
                this.Approve=res.bean.data[0];
                if(res.bean.data[0].status===1){
                  this.examResultAnswerList=res.bean.data[0].examResultAnswerList;
                  this.examResultAnswersData=res.bean.data[0].examPaper.examQuests;
                  this.examResultMarkList=res.bean.data[0].examResultMarkList;
                  this.examResultVisible=true;
                  this.approvalResult=`客观题得分: ${res.bean.data[0].objScore}，审批后显示最终分数。。`
                }else if(res.bean.data[0].status===2){
                  this.examResultAnswerList=res.bean.data[0].examResultAnswerList;
                  this.examResultAnswersData=res.bean.data[0].examPaper.examQuests;
                  this.examResultMarkList=res.bean.data[0].examResultMarkList;
                  this.examResultVisible=true;
                  this.approvalResult=`最终得分：${res.bean.data[0].totalScore}`;

                  console.log(this.Approve)
                }
              }

            }
          })


      },
      // 编辑
      submitForm: function () {
        this.$refs.dataForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let params = Object.assign({}, this.dataForm);
              params.examQuestIds=[
                ...this.ArrayQuestId(this.singleData),
                ...this.ArrayQuestId(this.multipleData),
                ...this.ArrayQuestId(this.judgeData),
                ...this.ArrayQuestId(this.gapfillData),
                ...this.ArrayQuestId(this.essayquestionData)];
              params.examPaperScores=[
                ...this.ArrayQuestScore(this.singleData),
                ...this.ArrayQuestScore(this.multipleData),
                ...this.ArrayQuestScore(this.judgeData),
                ...this.ArrayQuestScore(this.gapfillData),
                ...this.ArrayQuestScore(this.essayquestionData)];
              console.log(params);
              let flag=true;
              params.examPaperScores.forEach((item) =>{
                if(item.scoreWeight===0 || isNaN(item.scoreWeight)){
                  this.$message('题目分值不能设置为0');
                  flag=false;
                  return;
                }
              });
              params.status=1;
              if(flag){
                params.scoreSum=this.scoreSum;
                this.$api.exampaper.save(params).then((res) => {
                  this.getStatus();
                  this.editLoading = false;
                  this.dialogVisible = false;
                  this.$refs['dataForm'].resetFields();
                  this.findPage(null)
                }).catch((err) =>{
                  this.$message(err)
                })
              }

            })
          }
        })
      },
      // 保存
      saveForm: function () {
        this.$refs.dataForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let params = Object.assign({}, this.dataForm);
              params.examQuestIds=[
                ...this.ArrayQuestId(this.singleData),
                ...this.ArrayQuestId(this.multipleData),
                ...this.ArrayQuestId(this.judgeData),
                ...this.ArrayQuestId(this.gapfillData),
                ...this.ArrayQuestId(this.essayquestionData)];
              params.examPaperScores=[
                ...this.ArrayQuestScore(this.singleData),
                ...this.ArrayQuestScore(this.multipleData),
                ...this.ArrayQuestScore(this.judgeData),
                ...this.ArrayQuestScore(this.gapfillData),
                ...this.ArrayQuestScore(this.essayquestionData)];
              console.log(params);
              let flag=true;
              params.examPaperScores.forEach((item) =>{
                if(item.scoreWeight===0 || isNaN(item.scoreWeight)){
                  this.$message('题目分值不能设置为0');
                  flag=false;
                  return;
                }
              });
              params.status=0;
              if(flag){
                params.scoreSum=this.scoreSum;
                this.$api.exampaper.save(params).then((res) => {
                  this.editLoading = false;
                  this.dialogVisible = false;
                  this.$refs['dataForm'].resetFields();
                  this.findPage(null)
                }).catch((err) =>{
                  this.$message(err)
                })
              }

            })
          }
        })
      },
      //通过
      handlePass:function(params){
        let oldState='待审核';
        let state='启用';
        let status=1;
        if(params.row.status===1){
          oldState='启用';
          state='停用';
          status=2;
        }else if(params.row.status===2){
          oldState='停用';
          state='启用';
          status=1;
        }else{
          this.$alert('试卷未发布，请重新编辑发布！！', '提示', {
            confirmButtonText: '确定',
            callback: action => {

            }
          });
          return;
        }
        this.$prompt(`请备注说明${state}课程的原因`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(({value}) => {
          let postData={
            status:status,
            reviewerId:sessionStorage.getItem('userid')
          };
          let doc={
            targetName:'ExamPaper',
            targetId:params.row.id,
            content:value,
            title:`${oldState} -> ${state}`
          };
          updateBean('ExamPaper', params.row.id, postData)
            .then(res =>{
              this.findPage(null);
              this.$message({
                type: 'success',
                message: `${state}成功!`
              });
            });
          addBean('OperateMark',doc)
            .then(res =>{

            })
            .catch(err =>{
              this.$message(err)
            })

        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
      },
      // 处理表格列过滤显示
      displayFilterColumnsDialog: function () {
        this.$refs.tableColumnFilterDialog.setDialogVisible(true)
      },
      // 处理表格列过滤显示
      handleFilterColumns: function (data) {
        this.filterColumns = data.filterColumns;
        this.$refs.tableColumnFilterDialog.setDialogVisible(false)
      },
      // 处理表格列过滤显示
      initColumns: function () {
        this.columns = [
          /*{prop:"id", label:"ID", minWidth:50},*/
          {prop:"name", label:"试卷名称", minWidth:120},
          {prop:"scoreSum", label:"总分值", minWidth:120},
          {prop:"status", label:"状态", minWidth:120, formatter:this.statusFilter},
          {prop:"creator.name", label:"创建人", minWidth:120},
          {prop:"insertDt", label:"创建时间", minWidth:120,formatter:this.dateFormat}
          // {prop:"lastUpdateBy", label:"更新人", minWidth:100},
          // {prop:"lastUpdateTime", label:"更新时间", minWidth:120, formatter:this.dateFormat}
        ];
        // this.filterColumns = JSON.parse(JSON.stringify(this.columns));
        this.filterColumns = this.columns;
      },
      //题型过滤
      typeFilter:function(row, column, cellValue, index){
        if(row.type === 1){
          return '单选题';
        }else if(row.type === 2){
          return '多选题';
        }else if(row.type === 3){
          return '判断题';
        }else if(row.type === 4){
          return '填空题';
        }else if(row.type === 5){
          return '问答题';
        }else{
          return '';
        }
      },
      //题型过滤
      difficultyFilter:function(row, column, cellValue, index){
        if(row.difficulty === 1){
          return '简单';
        }else if(row.difficulty === 2){
          return '中等';
        }else if(row.difficulty === 3){
          return '困难';
        }else{
          return '';
        }
      },
      //过滤状态字段
      statusFilter:function(row, column, cellValue, index){
        if(row.status===0){
          return '未发布';
        }else if(row.status === 1){
          return '启用';
        }else{
          return '停用';
        }
      },
      // 时间格式化
      dateFormat: function (row, column, cellValue, index){
        return format(row[column.property])
      },

      //题目分数
      ArrayQuestScore: function (data){
        let arr = data.map((item) => {
          return {
            examQuestId:item.id,
            scoreWeight:Number(item.score)
          }
        });
        return arr;
      },
      //题目id
      ArrayQuestId: function (data){
        let arr=[];
        data.forEach((item) => {
          arr.push(item.id);
        });
        return arr;
      },
      //添加题目
      addQuestion:function(type){
        this.addQuestionVisible=true;
        this.questionType=type;
        this.$refs.myQuestion.getTableData1(type);
      },
      questionVisible:function(val){
        this.addQuestionVisible=val;
      },
      changeQuestion:function(val){
        val.tableData.forEach((item,index) =>{
          this.$set(val.tableData[index],'score',val.tableData[index].scoreWeight);
        });
        if(val.type===1){
          let singleData=[];
          let temp={};
          let singleData1=[];
          [...this.singleData,...val.tableData].map(item =>{
            if(!temp[item.id]){
              singleData.push(item);
              temp[item.id]=true;
            }else{
              singleData1.push(item.subject);
            }
          });
          if (singleData1.length > 0) {
            this.$message(singleData1.toString()+'选题重复了，已去掉！！');
          }
          this.singleData=singleData;

        }else if(val.type===2){
          let multipleData=[];
          let temp={};
          let multipleData1=[];
          [...this.multipleData,...val.tableData].map(item =>{
            if(!temp[item.id]){
              multipleData.push(item);
              temp[item.id]=true;
            }else{
              multipleData1.push(item.subject);
            }
          });
          if (multipleData1.length > 0) {
            this.$message(multipleData1.toString()+'选题重复了，已去掉！！');
          }
          this.multipleData=multipleData;

        }else if(val.type===3){
          let judgeData=[];
          let temp={};
          let judgeData1=[];
          [...this.judgeData,...val.tableData].map(item =>{
            if(!temp[item.id]){
              judgeData.push(item);
              temp[item.id]=true;
            }else{
              judgeData1.push(item.subject);
            }
          });
          if (judgeData1.length > 0) {
            this.$message(judgeData1.toString()+'选题重复了，已去掉！！');
          }
          this.judgeData=judgeData;
        }else if(val.type===4){
          let gapfillData=[];
          let temp={};
          let gapfillData1=[];
          [...this.gapfillData,...val.tableData].map(item =>{
            if(!temp[item.id]){
              gapfillData.push(item);
              temp[item.id]=true;
            }else{
              gapfillData1.push(item.subject);
            }
          });
          if (gapfillData1.length > 0) {
            this.$message(gapfillData1.toString()+'选题重复了，已去掉！！');
          }
          this.gapfillData=gapfillData;
        }else if(val.type===5){
          let essayquestionData=[];
          let temp={};
          let essayquestionData1=[];
          [...this.essayquestionData,...val.tableData].map(item =>{
            if(!temp[item.id]){
              essayquestionData.push(item);
              temp[item.id]=true;
            }else{
              essayquestionData1.push(item.subject);
            }
          });
          if (essayquestionData1.length > 0) {
            this.$message(essayquestionData1.toString()+'选题重复了，已去掉！！');
          }
          this.essayquestionData=essayquestionData;
        }else{
          this.$message('题目类型为空！')
        }
        this.addQuestionVisible=false;
      },
      //向上移动
      handleAscending(index, row , data) {
        if(index!==0){
          let rowData={};
          rowData=row;
          data.splice(index,1);
          data.splice(index-1,0,rowData);
        }
      },
      //向下移动
      handleDescending(index, row ,data) {
        if(index!==data.length-1){
          let rowData={};
          rowData=row;
          data.splice(index,1);
          data.splice(index+1,0,rowData);
        }
      },
      //删除题目
      handleDeleting:function(index, row , data){
        this.$confirm('此操作将永久删除, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          data.splice(index,1);
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      hasPerms: function (perms) {
        // 根据权限标识和外部指示状态进行权限判断
        return hasPermission(perms)

      },
      getStatus:function(){
        let navTree=this.$store.state.menu.navTree;
        this.$api.exampaper.findPage({pageNum: 1, condition:{status:0}}).then((res) => {
          this.navTree=navTree.map( item =>{
            item.children.map( ite =>{
              if (ite.name === '试卷/习题') {
                ite.value = res.bean.total;
              }
              return ite;
            });
            return item;
          });
        });
        // this.$store.commit('setNavTree', res.result.menuTree)
      },
      checkResult(str){
        if(str){
          let str1 = str.toLowerCase();
          let str2 = str1.replace(/[\“\”\’\‘\'\"\\\/\s+\b\f\n\r\t]/g, '');
          return str2
        }else{
          return str
        }
      },
      checkBlanckResult(answer,write){
        if (write.length === 0) {
          return false;
        }
        let flag=true;
        for(let i=0;i<answer.length;i++){
          let answerArr=answer[i].split('&');
          if( answerArr.findIndex(item => this.checkResult(item) === this.checkResult(write[i])) > -1){

          }else{
            flag = false;
          }
        }
        return flag;
      }
    },
    mounted() {
      this.initColumns();
    }
  }
</script>

<style scoped>
  .batchAddHeader{
    display: flex;
    justify-content:  flex-start;
    align-items:center;
  }
  .batchAddHeader a{padding-left:20px;text-decoration: none;}
  .queryContent{padding:10px 20px;}
  .queryContent p{
    margin:0;
    line-height: 30px;
  }
  .question_type{

  }
  .question_type_title{
    overflow: hidden;
    line-height: 30px;
    margin-bottom: 1px;
  }
  .question_type_title h4{
    float:left;
    margin:0;
  }
  .question_type_title .el-icon-circle-plus{
    float:right;
    line-height: 30px;
    font-size: 20px;
    color:#55a532;
    cursor: pointer;
  }
  .question_type .cell i{
    font-size:16px;
    padding:0 10px;
    cursor: pointer;
  }
  .success_bg{
    color: #13f902;
  }
  .error_bg{
    color: #f90208;
  }
  .approvalResult{
    color: #f90208;
    font-size: 20px;
    font-weight: bold;
  }
  .optionPic{
    overflow: hidden;
  }
  .optionPic div{
    float:left;
    margin-right:20px;
  }
  .optionPic div img{
    width:100px;
    height:100px;
  }
  .optionPic div p{
    text-align: center;
  }
</style>
