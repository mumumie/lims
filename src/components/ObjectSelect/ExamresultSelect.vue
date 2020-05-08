<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
<!--          <el-input v-model="filters.name" placeholder="试卷名称"></el-input>-->
          <el-select
            v-model="filters.name"
            filterable
            remote
            clearable
            reserve-keyword
            :remote-method="remoteMethod"
            :loading="loading"
            size="mini"
            placeholder="学生姓名">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
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
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="sys:role:view" type="primary" @click="findPage(null)"/>
        </el-form-item>
<!--        <el-form-item>-->
<!--          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="sys:user:add" type="primary" @click="handleAdd" />-->
<!--        </el-form-item>-->
<!--        <el-form-item>-->
<!--          <kt-button  icon="el-icon-upload" label="批量添加" perms="sys:user:add" type="primary" @click="handleBatchAdd" />-->
<!--        </el-form-item>-->
      </el-form>
    </div>
    <!--表格内容栏-->
    <kt-table
      :height="600"
      :maxHeight="600"
      :btnWidth="180"
      permsEdit="teach:curriculum:edit"
      permsDelete="sys:user:delete"
      permsDetail=""
      :data="pageResult"
      :columns="filterColumns"
      :showBtnEdit="false"
      :showBtnApprove="true"
      @findPage="findPage"
      @handleApprove="handleDetail"
      @handleDelete="handleDelete">
    </kt-table>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" label-width="120px" :rules="dataFormRules" ref="dataForm" :size="size"
               label-position="right">
        <el-form-item label="ID" prop="id" v-if="false">
          <el-input v-model="dataForm.id" :disabled="true" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="试卷名称" prop="examPaperId">
          <el-select v-model="dataForm.examPaperId" filterable placeholder="请选择"
                     style="width: 100%;">
            <el-option v-for="item in examPaper" :key="item.name"
                       :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="卷面总分值" prop="objCorrect">
          <el-input v-model.number="dataForm.objCorrect" auto-complete="off" ></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">{{$t('action.submit')}}</el-button>
      </div>
    </el-dialog>

    <!--    详情展示弹框-->
    <el-dialog
      width="60%"
      title="审批试卷"
      append-to-body
      :visible.sync="detailVisible">
      <div v-for="(item,index) in examResultAnswersData" :key="item.id" v-if="Approve.status!==0">
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
            <span v-if="item.type===1||item.type===2" :class="checkResult(item.optionAnswer.toString())===checkResult(examResultAnswerList[index].optionAnswer.toString())?'success_bg':'error_bg'">
              <i v-for="(optAsw,index) in examResultAnswerList[index].optionAnswer" :key="index">{{AnswerType[optAsw]===undefined?'空':AnswerType[optAsw] + ((item.optionAnswer.length-1)===index?'':'，') }}</i>
              <i :class="checkResult(item.optionAnswer.toString())===checkResult(examResultAnswerList[index].optionAnswer.toString())?'el-icon-check':'el-icon-close'"></i>
            </span>
            <span v-if="item.type===3" :class="Approve.examResultMarkList[index].score !== 0?'success_bg':'error_bg'">
              <i>{{examResultAnswerList[index].tfAnswer == '' ? '空' :(examResultAnswerList[index].tfAnswer=='1'?'对':'错')}}</i>
              <i :class="Approve.examResultMarkList[index].score !== 0?'el-icon-check':'el-icon-close'"></i>
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
          <div v-if="item.type===5 && Approve.status===1" style="line-height: 38px;font-weight: 700;" >
            <el-row>
              <el-col :span="3">请打分：</el-col>
              <el-col :span="12">
                <!--              <el-input v-model="AnswerContentScore[index]" size="mini"  auto-complete="off" ></el-input>-->
                <div class="block">
                  <el-slider
                    v-model="AnswerContentScore[index]"
                    :min="0"
                    :max="examPaperScores[index].scoreWeight"
                    input-size="mini"
                    show-input>
                  </el-slider>
                </div>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="3">请评价：</el-col>
              <el-col :span="12">
                <el-input  v-model="AnswerComment[index]" size="mini"  auto-complete="off" ></el-input>
              </el-col>
            </el-row>
          </div>
          <div v-if="item.type===5 && Approve.status===2" style="line-height: 38px;font-weight: 700;" >
            <el-row>
              <el-col :span="15">得分：{{Approve.examResultMarkList[index].score}}</el-col>
            </el-row>
            <el-row>
              <el-col :span="3">点评：</el-col>
              <el-col :span="21">
                {{Approve.examResultMarkList[index].comment}}
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
      <div style="line-height: 30px;height:30px;padding-left:20px;font-size: 20px;font-weight: 700;">
        <el-col :span="12" v-if="Approve.status===0">试卷还未提交</el-col>
        <el-col :span="12" v-if="Approve.status===1||Approve.status===2">客观题得分：{{Approve.objScore}}</el-col>
        <el-col :span="12" v-if="Approve.status===2">总得分：{{Approve.totalScore}}</el-col>
      </div>
      <div style="line-height: 30px;height:30px;padding-left:20px;">
        <el-checkbox v-model="anonymous" v-if="Approve.status===1">是否匿名</el-checkbox>
        <p v-if="Approve.status===2 && !Approve.anonymous">阅卷人：{{Approve.reviewer}}</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" type="primary" @click.native="approvalSubmit" v-if="Approve.status!==0&&Approve.status!==2">{{$t('action.submit')}}</el-button>
        <el-button :size="size" @click.native="detailVisible = false">{{$t('action.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import PopupTreeInput from "@/components/PopupTreeInput"
  import KtTable from "@/views/Core/KtTable"
  import KtButton from "@/views/Core/KtButton"
  import TableColumnFilterDialog from "@/views/Core/TableColumnFilterDialog"
  import { format } from "@/utils/datetime"
  import {addBean, queryBean, updateBean} from "@/http/base";
  import { getIFrameUrl, getIFramePath } from '@/utils/iframe'
  // import XLSX from 'xlsx'
  export default {
    name:'ExamResult',
    components:{
      PopupTreeInput,
      KtTable,
      KtButton,
      TableColumnFilterDialog
    },
    props:{
      examPaperId:{
        type:String,
        default:''
      }
    },
    data() {
      return {
        size: 'mini',
        filters: {
          name: ''
        },
        columns: [],
        filterColumns: [],
        pageRequest: { pageNum: 1, pageSize: 10 },
        pageResult: {},
        tableData:[], //批量导入用户列表
        operation: false, // true:新增, false:编辑
        dialogVisible: false, // 新增编辑界面是否显示
        dialogVisibleBatch:false, //批量新增界面是否显示
        detailVisible:false,//详情界面是否显示
        editLoading: false,
        loading:false,
        dataFormRules: {
          name: [
            { required: true, message: '请输入用户名', trigger: 'blur' }
          ]
        },
        // 新增编辑界面数据
        dataForm: {
          id: 0,
          examPaperId:'',
          examResultAnswerIds:[],
          objCorrect:0
        },
        deptData: [],
        deptTreeProps: {
          label: 'name',
          children: 'children'
        },
        examPaper: [],
        questData:[],
        examResultAnswersData:[],
        examResultAnswerList:[],
        queryType:['单选题','多选题','判断题','填空题','问答题'],
        AnswerType:['A','B','C','D'],
        AnswerContentScore:[],
        AnswerComment:[],
        examPaperScores:[],
        Approve:{},
        id:'',
        UserAll:[],
        options:[],
        anonymous:false,
        statusOptions:[
          {value:0,label:'未提交'},
          {value:1,label:'待批阅'},
          {value:2,label:'已批阅'},
        ],
      }
    },
    methods: {
      // 获取分页数据
      findPage: function (data) {
        let pageRequest={
          pageNum: 1,
          pageSize: 10 ,
          insertDt: -1,
          condition:{
            examPaperId: this.examPaperId
          }
        };
        if(data !== null) {
          pageRequest = data.pageRequest;
          pageRequest.condition.examPaperId = this.examPaperId;
        }
        if(this.filters && this.filters.name !==''){
          pageRequest.condition.userid = this.filters.name;
        }
        if(this.filters.status){
          pageRequest.condition.status = this.filters.status;
        }
        this.$api.examresult.findPage(pageRequest).then((res) => {
          this.pageResult = res.pageResult;
        }).then(data!=null?data.callback:'')
      },
      // 批量删除
      handleDelete: function (data) {
        this.$api.examresult.batchDelete(data.params).then(data!=null?data.callback:'')
      },
      // 显示新增界面
      handleAdd: function () {
        this.dialogVisible = true;
        this.operation = true;
        this.dataForm = {
          id: 0,
          examPaperId:'',
          examResultAnswerIds:[],
          objCorrect:0
        }
      },
      // 显示编辑界面
      handleEdit: function (params) {

        this.dialogVisible = true;
        this.operation = false;
      },
      //显示详情页
      handleDetail:function(params){
        console.log(params.row);
        this.examPaperScores=params.row.examPaper.examPaperScores;
        let Approve={
          status:params.row.status,
          objScore:params.row.objScore,
          totalScore:params.row.totalScore,
          examResultMarkList:params.row.examResultMarkList,
          anonymous:params.row.anonymous,
          reviewer:params.row.reviewer===null?'':params.row.reviewer.name
        };
        this.Approve=Approve;
        if(params.row.status!==0){
          this.id=params.row.id;
          this.examResultAnswersData=params.row.examPaper.examQuests;
          this.examResultAnswerList=params.row.examResultAnswerList;
          params.row.examResultAnswerList.forEach((item,index) =>{
            if(params.row.examPaper.examQuests[index].type===5){
              this.$set(this.AnswerContentScore,index,'');
              this.$set(this.AnswerComment,index,'')
            }
          });
        }
        console.log(Approve);
        this.detailVisible=true;
      },
      //考试
      handleExam:function(params){
        // 如果是嵌套页面，转换成iframe的path
        let path = getIFramePath('Teach/CurriculumDetail?id='+params.row.id);
        if(!path) {
          path = 'Teach/CurriculumDetail?id='+params.row.id
        }
        // 通过菜单URL跳转至指定路由
        this.$router.push("/" + path)
      },
      // 编辑
      submitForm: function () {
        this.$refs.dataForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let params = Object.assign({}, this.dataForm);
              this.$api.examresult.save(params).then((res) => {
                this.editLoading = false;
                this.dialogVisible = false;
                this.$refs['dataForm'].resetFields();
                this.findPage(null)
              })
            })
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
          {prop:"examPaper.name", label:"试卷名称", minWidth:120},
          {prop:"examPaper.scoreSum", label:"总分值", minWidth:120},
          {prop:"student.name", label:"学生", minWidth:120},
          {prop:"totalScore", label:"总得分", minWidth:100},
          {prop:"status", label:"状态", minWidth:120,formatter:this.statusFilter},

          // {prop:"difficulty", label:"难度级别", minWidth:100,formatter:this.difficultyFilter},
          // {prop:"area", label:"占地面积(m)", minWidth:120},
          // {prop:"netWork", label:"网络情况", minWidth:100},
          // {prop:"createBy", label:"创建人", minWidth:120},
          // {prop:"insertDt", label:"创建时间", minWidth:120,formatter:this.dateFormat}
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
          return '未提交';
        }else if(row.status === 1){
          return '待批阅';
        }else{
          return '已批阅';
        }
      },
      // 时间格式化
      dateFormat: function (row, column, cellValue, index){
        return format(row[column.property])
      },

      //查找所有试卷
      findPaper: function (){
        let condition={

        };
        queryBean('ExamPaper',condition)
          .then(res =>{
            this.examPaper=res.bean.data
          })
      },
      //查找所有试卷
      findUser: function (){
        let condition={

        };
        queryBean('Account',condition)
          .then(res =>{
            this.UserAll=res.bean.data.map((item) =>{
              return {
                value: item.id,
                label: item.name
              };
            })
          })
      },
      approvalSubmit:function(){
        let AnswerContentScore=0;
        let NotAnswer=[];
        let NotAnswerStr='';
        let examResultMarkList=this.Approve.examResultMarkList.map((item,index) =>{
          if(this.AnswerComment[index]){
            item.comment = this.AnswerComment[index]
          }
          if(this.AnswerContentScore[index]) {
            if(isNaN(Number(this.AnswerContentScore[index]))){
              msg='主观题分数不是数字！';
              flag=false;
            }else{
              AnswerContentScore += Number(this.AnswerContentScore[index]);
            }
            item.score = this.AnswerContentScore[index]
          }else if(this.AnswerContentScore[index] === 0){
            NotAnswer.push(`第${index}题`)
          }
          return item
        });
        if(NotAnswer.length>0){
          NotAnswerStr=NotAnswer.join()+'得分为零,';
        }
        this.$confirm(`${NotAnswerStr}是否继续提交批阅?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let postData={
            examResultMarkList:examResultMarkList,
            totalScore:Number(this.Approve.objScore) + Number(AnswerContentScore),
            status:2,
            reviewerId:sessionStorage.getItem('userid'),
            anonymous:this.anonymous
          };
          updateBean('ExamResult',this.id,postData)
            .then(res =>{
              if(res.retCode === 0){
                this.findPage(null);
                this.detailVisible=false;
              }
            })
            .catch( err =>{
              this.$message('审批失败' + err);
            })
        }).catch(() => {

        });

      },

      remoteMethod(query) {
        if (query !== '') {
          this.loading = true;
          setTimeout(() => {
            this.loading = false;
            this.options = this.UserAll.filter(item => {
              return item.label.toLowerCase()
                .indexOf(query.toLowerCase()) > -1;
            });
          }, 200);
        } else {
          this.options = [];
        }

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
        let flag=true;
        if (write.length === 0) {
          return false;
        }
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
      // this.findDeptTree();
      this.findUser();
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
  .answerContent >>> p{
    margin:0;
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
