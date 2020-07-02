<template>
  <div class="page-container">
    <div>
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
        :showBtnExam="true"
        :showBatchDelete="false"
        @handleExam="handleExam"
        @findPage="findPage"
        @handleDetail="handleDetail"
        @handleEdit="handleEdit"
        @handleBatchDelete="handleBatchDelete"
        @handleDelete="handleDelete">
      </kt-table>
      <!--    试卷展示弹框-->
      <el-dialog
        width="800px"
        title="批阅试卷"
        append-to-body
        :visible.sync="paperVisible">
        <div class="paper_box" ref="print" v-if="scoreData.length > 0">
          <div style="line-height: 80px;font-size: 25px;font-weight:bold;">
            <span v-if="paperResult.status === 1">客观题得分：{{paperResult.objScore}}</span>
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
              <div v-if="ite.baseType === 5 && paperResult.status === 1" style="line-height: 38px;font-weight: 700;" >
                <el-row>
                  <el-col :span="3">请打分：</el-col>
                  <el-col :span="12">
                    <!--              <el-input v-model="AnswerContentScore[index]" size="mini"  auto-complete="off" ></el-input>-->
                    <div class="block">
                      <el-slider
                        v-model="scoreData[index].children[ind].topScore"
                        :min="0"
                        :max="ite.score"
                        input-size="mini"
                        show-input>
                      </el-slider>
                    </div>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="3">请评价：</el-col>
                  <el-col :span="12">
                    <el-input  v-model="scoreData[index].children[ind].comment" size="mini"  auto-complete="off" ></el-input>
                  </el-col>
                </el-row>
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
            <el-checkbox v-model="paperResult.anonymous" v-if="paperResult.status === 1">是否匿名</el-checkbox>
            <p v-if="paperResult.status === 2 && !paperResult.anonymous">阅卷人：{{paperResult.reviewer.nickname}}</p>
          </div>
        </div>
        <div slot="footer" class="dialog-footer">
<!--          <el-button :size="size" @click.native="isShowAnswer = !isShowAnswer">{{isShowAnswer?'隐藏答案':'显示答案'}}</el-button>-->
<!--          <el-button :size="size" @click.native="$print($refs.print)">打印</el-button>-->
          <el-button :size="size" @click.native="submitRead" v-if="paperResult.status === 1">批阅</el-button>
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
    name:'ExamResult',
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
          paperId:'',
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
        isShowAnswer:true,
        paperResult: {},
        anonymous: false,
      }
    },
    props: ['paper'],
    watch:{
      editLoading:function(){
        if(this.editLoading === true){
          setTimeout(() =>{
            this.editLoading = false;
          },2000)
        }
      }
    },
    created() {
      this.initColumns();
    },
    mounted() {

    },
    methods: {
      submitRead() {
        const paperResult = JSON.parse(JSON.stringify(this.paperResult));
        this.scoreData.map(item => {
          item.children.map(v => {
            if (v.baseType === 5) {
              paperResult.paperResultAnswerList.map(answer => {
                if (answer.questId === v.id) {
                  answer.score = v.topScore
                  answer.comment = v.comment
                }
              })
            }
          })
        })
        paperResult.totalScore = paperResult.paperResultAnswerList.reduce((prev,next) => (prev + next.score), 0);
        paperResult.status = 2;
        if (!paperResult.anonymous) {
          paperResult.reviewerId = sessionStorage.getItem('userid')
        }
        updateBean('PaperResult',paperResult.id,paperResult).then(res =>{
          if (res.retCode === 0) {
            this.findPage(null)
            this.$message({
              type: 'success',
              message: '批阅成功！'
            })
          }
          this.paperVisible = false;
        })
      },
      // 获取分页数据
      findPage: function (data) {
        let pageRequest={
          pageNum: 1,
          pageSize: 10 ,
          sort:{
            insertDt:-1,
          },
          condition:{
          }
        };
        if(data !== null) {
          pageRequest = data.pageRequest
        }
        pageRequest.condition.paperId = this.paper.id
        console.log(pageRequest.condition);
        queryBean('PaperResult', pageRequest.condition, pageRequest).then((res) => {
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
      handleExam: function (params) {
        if (params.row.status === 0) {
          this.$confirm('试卷未提交，是否继续阅卷！?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            updateBean('PaperResult', params.row.id, {status: 1}).then(data =>{
              this.paperResult = params.row;
              this.paperResult.status = 1
              let postData = {
                paperId:params.row.paperId
              }
              queryBean('PaperQuest', postData).then(res =>{
                let questBankData = this.paper.questBank;
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
                this.scoreData.map(item => {
                  item.children.map(v => {
                    const answer = params.row.paperResultAnswerList.filter(item => item.questId === v.id)[0]
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
            })
          }).catch(() => {
          })
        } else {
          this.paperResult = params.row;
          let postData = {
            paperId:params.row.paperId
          }
          queryBean('PaperQuest', postData).then(res =>{
            let questBankData = this.paper.questBank;
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
                const answer = params.row.paperResultAnswerList.filter(item => item.questId === v.id)[0]
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
          {prop:"student.nickname", label:"学生", minWidth:120},
          {prop:"objScore", label:"客观题得分", minWidth:120},
          {prop:"totalScore", label:"总得分", minWidth:120},
          {prop:"status", label:"状态", minWidth:120, formatter: this.statusFilter},
          // {prop:"status", label:"审核状态", minWidth:120, formatter: this.statusFilter},
        ];
        // this.filterColumns = JSON.parse(JSON.stringify(this.columns));
        this.filterColumns = this.columns;
      },
      // 时间格式化
      dateFormat: function (row, column, cellValue, index){
        return format(row[column.property])
      },
      //过滤状态字段
      statusFilter:function(row, column, cellValue, index) {
        if (row.status === 0) {
          return '未提交';
        } else if (row.status === 1) {
          return '待批阅';
        } else if (row.status === 2) {
          return '已批阅';
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


