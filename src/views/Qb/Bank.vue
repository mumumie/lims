<template>
  <div class="page-container">
    <tip :value="
    ['题库是某一门课程中一大批题目的集合，题库的建立基于课程，试卷和练习依赖于题库而从中抽取题目。',
    '先创建题库后，在试题中创建题目以丰富该题库']" />
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
          <el-input v-model="filters.name" style="width:150px;" placeholder="题库名称"></el-input>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="" type="primary" @click="findPage(null)"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="" type="primary" @click="handleAdd" />
        </el-form-item>
      </el-form>
    </div>

    <!--表格内容栏-->
    <kt-table
      :height="600"
      :maxHeight="600"
      permsEdit="sys:user:edit"
      permsDelete="sys:user:delete"
      permsDetail=""
      :data="pageResult"
      :columns="filterColumns"
      @selectionChange="selectionChange"
      @findPage="findPage"
      :showBtnDetail="false"
      :showBatchDelete="false"
      :showCustom="true"
      customLabel="统计"
      @handleEdit="handleEdit"
      @handleCustom="handleCustom"
      @handleDetail="handleDetail"
      @handleDelete="handleDelete">
    </kt-table>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="700px" :visible.sync="dialogVisible" :close-on-click-modal="false" append-to-body>
      <el-form :model="dataForm" label-width="140px" :rules="dataFormRules" ref="dataForm" :size="size"
               label-position="right">
        <el-form-item label="题库名称" prop="name">
          <el-input v-model="dataForm.name" auto-complete="off"  placeholder="请输入题库姓名"></el-input>
        </el-form-item>
        <el-form-item label="题库编号" prop="code">
          <el-input v-model="dataForm.code" auto-complete="off"  placeholder="请输入题库编号"></el-input>
        </el-form-item>
        <el-form-item label="题库类别" prop="type">
          <el-select
            v-model="dataForm.type"
            clearable
            style="width:200px;">
            <el-option label="通识课" value="通识课"></el-option>
            <el-option label="基础课" value="基础课"></el-option>
            <el-option label="必修课" value="必修课"></el-option>
            <el-option label="选修课" value="选修课"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="题库对应课程" prop="courseId">
          <el-select
            v-model="dataForm.courseId"
            placeholder="请选择课程"
            @change="courseChangeHandle(dataForm.courseId)"
            clearable
            style="width:200px;">
            <el-option v-for="(item,index) in courseData" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="教材" prop="textbook">
          <el-select
            v-model="dataForm.textbook"
            placeholder="请选择教材"
            clearable
            style="width:200px;">
            <el-option v-for="(item,index) in textbookData" :key="index" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="题库规划建设题量" prop="planCount">
          <el-input v-model="dataForm.planCount" auto-complete="off" ></el-input>
        </el-form-item>
        <el-form-item label="主观题规划建设题量" prop="planSubjectiveCount">
          <el-input v-model="dataForm.planSubjectiveCount" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="题库章节" prop="chapter">
          <p style="margin:0;">章节名称</p>
          <div v-for="(item,index) in dataForm.chapter" :key="index">
            <el-input v-model="dataForm.chapter[index]" style="width:470px;"></el-input>
            <i class="el-icon-circle-plus-outline" @click="addChapter(index)"></i>
            <i class="el-icon-delete" @click="deleteChapter(index)"></i>
          </div>
        </el-form-item>
        <el-form-item label="题库题型" prop="type">
          <div class="type_box">
            <div class="type_box_list">
              <div class="type_box_title">基础题型</div>
              <div class="type_box_content">新建题型</div>
            </div>
            <div class="type_box_list">
              <div class="type_box_title">
                <el-checkbox v-model="dataForm.single">单选题</el-checkbox>
                <i class="el-icon-circle-plus-outline" @click="addQuestionType('单选题')"></i>
              </div>
              <div class="type_box_content">
                <div v-for="(item,index) in singleSelectType" :key="index">
                  <el-checkbox v-model="item.select" >{{item.name}}</el-checkbox>
                  <i class="el-icon-delete" @click="deleteQuestionType('singleSelectType',index)"></i>
                </div>
              </div>
            </div>
            <div class="type_box_list">
              <div class="type_box_title">
                <el-checkbox v-model="dataForm.multiply">多选题</el-checkbox>
                <i class="el-icon-circle-plus-outline" @click="addQuestionType('多选题')"></i>
              </div>
              <div class="type_box_content">
                <div v-for="(item,index) in multiplySelectType" :key="index">
                  <el-checkbox v-model="item.select" >{{item.name}}</el-checkbox>
                  <i class="el-icon-delete" @click="deleteQuestionType('multiplySelectType',index)"></i>
                </div>
              </div>
            </div>
            <div class="type_box_list">
              <div class="type_box_title">
                <el-checkbox v-model="dataForm.trueFalse">判断题</el-checkbox>
                <i class="el-icon-circle-plus-outline" @click="addQuestionType('判断题')"></i>
              </div>
              <div class="type_box_content">
                <div v-for="(item,index) in trueFalseType" :key="index">
                  <el-checkbox v-model="item.select" >{{item.name}}</el-checkbox>
                  <i class="el-icon-delete" @click="deleteQuestionType('trueFalseType',index)"></i>
                </div>
              </div>
            </div>
            <div class="type_box_list">
              <div class="type_box_title">
                <el-checkbox v-model="dataForm.completion">填空题</el-checkbox>
                <i class="el-icon-circle-plus-outline" @click="addQuestionType('填空题')"></i>
              </div>
              <div class="type_box_content">
                <div v-for="(item,index) in completionType" :key="index">
                  <el-checkbox v-model="item.select" >{{item.name}}</el-checkbox>
                  <i class="el-icon-delete" @click="deleteQuestionType('completionType',index)"></i>
                </div>
              </div>
            </div>
            <div class="type_box_list">
              <div class="type_box_title">
                <el-checkbox v-model="dataForm.subject">主观题</el-checkbox>
                <i class="el-icon-circle-plus-outline" @click="addQuestionType('主观题')"></i>
              </div>
              <div class="type_box_content">
                <div v-for="(item,index) in subjectType" :key="index">
                  <el-checkbox v-model="item.select" >{{item.name}}</el-checkbox>
                  <i class="el-icon-delete" @click="deleteQuestionType('subjectType',index)"></i>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="考核目标" >
          <el-select v-model="dataForm.assessmentTarget" multiple placeholder="请选择" style="width:300px;">
            <el-option label="记忆" value="记忆"></el-option>
            <el-option label="理解" value="理解"></el-option>
            <el-option label="运用" value="运用"></el-option>
            <el-option label="分析" value="分析"></el-option>
            <el-option label="评价" value="评价"></el-option>
            <el-option label="创建" value="创建"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="知识点" prop="topic">
          <div v-for="(item,index) in dataForm.topic" :key="index">
            <el-input v-model="dataForm.topic[index]" style="width:470px;"></el-input>
            <i class="el-icon-circle-plus-outline" @click="addTopic(index)"></i>
            <i class="el-icon-delete" @click="deleteTopic(index)"></i>
          </div>
        </el-form-item>
        <el-form-item label="是否需要审核">
          <el-switch
            v-model="dataForm.isReviewer"
            active-color="#13ce66">
          </el-switch>
          <el-input v-model="dataForm.reviewerName" auto-complete="off" @focus="addTeacherId" placeholder="请选择审核人" v-if="dataForm.isReviewer"></el-input>
        </el-form-item>
<!--        <el-form-item label="题库使用范围" >-->
<!--          <el-cascader-->
<!--            v-model="dataForm.deptmentIds"-->
<!--            :options="deptData1"-->
<!--            :props="{ checkStrictly: true }"-->
<!--            collapse-tags>-->
<!--          </el-cascader>-->
<!--        </el-form-item>-->
        <el-form-item label="备注" prop="remark">
          <el-input v-model="dataForm.remark" type="textarea" :rows="2" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">{{$t('action.submit')}}</el-button>
      </div>
      <TeacherSelect
        ref="myTeacherId"
        :dialogVisible="addTeacherVisible"
        @teacherVisible="teacherVisible"
        @changeTeacher="changeTeacher">
      </TeacherSelect>
    </el-dialog>
    <!--自定义题型新增界面-->
    <el-dialog title="自定义题型" width="500px" :visible.sync="customQuestionVisible" :close-on-click-modal="false" append-to-body>
      <el-form :model="typeForm" label-width="110px" :rules="dataFormRules" ref="typeForm" :size="size"
               label-position="right">
        <el-form-item label="基础题型" >
          <el-input v-model="typeForm.type" auto-complete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="自定义题型名称" >
          <el-input v-model="typeForm.name" auto-complete="off" placeholder="请填入自定义题型名称"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" type="primary" @click="addCustomQuestion">{{$t('action.submit')}}</el-button>
      </div>
    </el-dialog>
    <!--统计界面-->
    <el-dialog title="统计" width="600px" :visible.sync="statisticsVisible" :close-on-click-modal="false" append-to-body>
      <div  v-if="statisticsVisible">
        <m-echarts
          :echartStyle="echartsData.s"
          :titleText="echartsData.a"
          :tooltipFormatter="echartsData.b"
          :opinion="echartsData.c"
          :seriesName="echartsData.d"
          :opinionData="echartsData.e"
          v-on:currentEchartData="getEchartData"
        ></m-echarts>
        <el-divider></el-divider>
        <m-echarts
          v-if="typeData.e.length !== 0"
          id="typeChart"
          :echartStyle="typeData.s"
          :titleText="typeData.a"
          :tooltipFormatter="typeData.b"
          :opinion="typeData.c"
          :seriesName="typeData.d"
          :opinionData="typeData.e"
          v-on:currentEchartData="getEchartData"
        ></m-echarts>
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
  import {addBean, queryBean, updateBean,addBatchBean} from "@/http/base";
  import TeacherSelect from "@/components/ObjectSelect/TeacherSelect";
  import mEcharts from '@/components/Echarts/EchartsPie'

  export default {
    components:{
      PopupTreeInput,
      KtTable,
      KtButton,
      TableColumnFilterDialog,
      TeacherSelect,
      mEcharts,
    },
    data() {
      return {
        val:[],
        size: 'mini',
        filters: {
          name: '',
        },
        columns: [],
        filterColumns: [],
        pageRequest: { pageNum: 1, pageSize: 10 },
        pageResult: {},
        tableData:[], //批量导入用户列表
        operation: false, // true:新增, false:编辑
        dialogVisible: false, // 新增编辑界面是否显示
        customQuestionVisible:false,
        statisticsVisible:false,
        addTeacherVisible:false,
        addCourseVisible:false,
        editLoading: false,
        loading:false,
        dataFormRules: {
          name: [
            { required: true, message: '请输入题库名称', trigger: 'blur' }
          ],
          nickname: [
            { required: true, message: '请输入题库课程', trigger: 'blur' }
          ],
          code: [
            { required: true, message: '请输入题库编号', trigger: 'blur' }
          ],
          courseId: [
            { required: true, message: '请输入课程', trigger: 'change' }
          ],
          type: [
            { required: true, message: '请输入题库类型', trigger: 'blur' }
          ],
          chapter: [
            { required: true, message: '请输入章节', trigger: 'blur' }
          ],
          topic: [
            { required: true, message: '请输入知识点', trigger: 'blur' }
          ],
        },
        // 新增编辑界面数据
        dataForm: {
          id: 0,
          name: '',
          code: '',
          remark:'',
          type:'必修课',
          courseId:'',
          planCount:1,
          planSubjectiveCount:1,
          chapter:[''],
          singleSelectType:[],
          multiplySelectType:[],
          trueFalseType:[],
          completionType:[],
          subjectType:[],
          assessmentTarget:[],
          // deptmentIds:[],
          isReviewer:false,
          textbook:'',
          topic:[''],
        },
        deptData: [],
        deptData1: [],
        deptTreeProps: {
          label: 'name',
          children: 'children'
        },
        excelData:[],
        excelAllData:[],
        courseData:[],
        typeForm:{
          type:'',
          name:''
        },
        singleSelectType:[],
        multiplySelectType:[],
        trueFalseType:[],
        completionType:[],
        subjectType:[],
        echartsData:{
          a:'总体量完成比例',
          b:'数量',
          c:['已建试题','待建试题'],
          d:'完成比例',
          e:[],
          s: {
            height: '400px'
          }
        },
        typeData:{
          a:'各题型所占比例',
          b:'数量',
          c:['已建试题','待建试题'],
          d:'所占比例',
          e:[],
          s: {
            height: '400px'
          }
        },
        textbookData:[]
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
          pageRequest = data.pageRequest;
        }
        if(this.filters.name){
          pageRequest.condition['name$regex'] = this.filters.name;
        }
        this.$api.bank.findPage(pageRequest).then((res) => {
          this.pageResult = res.pageResult;
        }).then(data!=null?data.callback:'')
      },
      // 批量删除
      handleDelete: function (params) {
        if (params.row.questCount > 0) {
          this.$message({
            type:"error",
            message:'题库中有试题无法删除题库！！！'
          })
          return false;
        }
        this.$confirm('删除后不可恢复，确定删除这一项吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$api.bank.singleDelete(params.row).then(res =>{
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
      // 显示新增界面
      handleAdd: function () {
        this.dialogVisible = true;
        this.operation = true;
        this.dataForm = {
          id: 0,
          name: '',
          code: '',
          remark:'',
          type:'必修课',
          courseId:'',
          planCount:1,
          planSubjectiveCount:1,
          chapter:[''],
          singleSelectType:[],
          multiplySelectType:[],
          trueFalseType:[],
          completionType:[],
          subjectType:[],
          single:true,
          multiply:true,
          trueFalse:true,
          subject:true,
          completion:true,
          assessmentTarget:[],
          deptmentIds:[],
          isReviewer:false,
          textbook:'',
          topic:[''],
        }
        this.singleSelectType=[];
        this.multiplySelectType=[];
        this.trueFalseType=[];
        this.completionType=[];
        this.subjectType=[];
      },
      handleCustom:function(params){
        this.$api.bank.questBankStat(params.row.id).then(res =>{
          this.echartsData.e = [...res.result.plan];
          this.typeData.e = [...res.result.type];
          this.typeData.c = res.result.type.map(item =>{
            return item.name;
          })
          this.statisticsVisible = true;
        })
      },
      getEchartData(val){
        console.log(val);
      },
      // 显示编辑界面
      handleEdit: function (params) {
        this.dialogVisible = true;
        this.operation = false;
        if (params.row.courseId) {
          this.courseChangeHandle(params.row.courseId);
        }
        this.dataForm = Object.assign({}, params.row);

        if (this.dataForm.topic.length === 0) {
          this.dataForm.topic[0]='';
        }
        if(params.row.reviewerId){
          this.$set(this.dataForm,'isReviewer',true)
          this.dataForm.reviewerName = params.row.reviewer.nickname;
        }
        let selectType = [
          {name:'单选题',arrStr:'singleSelectType',string:'single'},
          {name:'多选题',arrStr:'multiplySelectType',string:'multiply'},
          {name:'判断题',arrStr:'trueFalseType',string:'trueFalse'},
          {name:'填空题',arrStr:'completionType',string:'completion'},
          {name:'主观题',arrStr:'subjectType',string:'subject'},
        ];
        selectType.forEach(type =>{
          if (params.row[type.arrStr].findIndex(item => item === type.name)> -1) {
            // this.dataForm[type.string] = true;
            this.$set(this.dataForm,type.string,true);
          }
          if (params.row[type.arrStr].length>0) {
            let arrSelectType = params.row[type.arrStr].filter(item => item !== type.name);
            this[type.arrStr]= arrSelectType.map(item =>{
              return {
                name:item,
                select:true,
                type:type.name
              }
            });
          }
        });
      },
      //添加审核人
      addTeacherId:function(){
        this.addTeacherVisible=true;
        this.$refs.myTeacherId.getTableData();
        console.log(this.addTeacherVisible)
      },
      changeTeacher:function(val){
        this.addTeacherVisible=false;
        this.dataForm.reviewerName = val.nickname;
        this.dataForm.reviewerId = val.id;
        console.log(val);
      },
      teacherVisible:function(val){
        this.addTeacherVisible=val;
      },
      //添加章节
      addChapter:function(index){
        this.dataForm.chapter.splice(index+1,0,'')
      },
      deleteChapter:function(index){
        if(this.dataForm.chapter.length > 1){
          this.dataForm.chapter.splice(index,1)
        }else{
          this.$message({
            type:'warning',
            message:'章节最少有一条！！'
          })
        }

      },
      //添加章节
      addTopic:function(index){
        this.dataForm.topic.splice(index+1,0,'')
      },
      deleteTopic:function(index){
        if(this.dataForm.topic.length > 1){
          this.dataForm.topic.splice(index,1)
        }else{
          this.$message({
            type:'warning',
            message:'知识点最少有一条！！'
          })
        }

      },
      addQuestionType:function(typeName){
        this.customQuestionVisible = true;
        this.typeForm={
          select:true,
          type : typeName,
          name:''
        };
      },
      deleteQuestionType:function(questionType,index){
        this[questionType].splice(index,1)
      },
      addCustomQuestion:function(){
        let typeForm = Object.assign({},this.typeForm);
        if(typeForm.name){
          if(typeForm.type === '单选题'){
            this.singleSelectType.push(typeForm);
            this.customQuestionVisible = false;
          }else if(typeForm.type === '多选题'){
            this.multiplySelectType.push(typeForm);
            this.customQuestionVisible = false;
          }else if(typeForm.type === '判断题'){
            this.trueFalseType.push(typeForm);
            this.customQuestionVisible = false;
          }else if(typeForm.type === '填空题'){
            this.completionType.push(typeForm);
            this.customQuestionVisible = false;
          }else if(typeForm.type === '主观题'){
            this.subjectType.push(typeForm);
            this.customQuestionVisible = false;
          }
        }else{
          this.$message({
            type:'error',
            message:'请输入自定义题目名称！！！'
          })
        }
      },
      //跳转详情界面
      handleDetail:function(params){
        this.$router.push({name:'用户中心',params:{id : params.row.id}});
      },
      selectionChange:function(params){
        this.excelData=params.selections;
      },
      // 编辑
      submitForm: function () {
        if(!this.dataForm.chapter[0]){
          this.$message({
            message:'请输入题库章节!!',
            type:'error'
          })
          return false
        }
        if(!this.dataForm.topic[0]){
          this.$message({
            message:'请输入知识点!!',
            type:'error'
          })
          return false
        }
        if(!this.dataForm.code){
          this.$message({
            message:'题库编号不能为空!!',
            type:'error'
          })
          return false
        }
        if(!this.dataForm.type){
          this.$message({
            message:'请选择题库类型!!',
            type:'error'
          })
          return false
        }
        if(!this.dataForm.courseId){
          this.$message({
            message:'题库对应课程不能为空!!',
            type:'error'
          })
          return false
        }
        this.$refs.dataForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let params = Object.assign({}, this.dataForm);
              params.planSubjectiveCount = Number(params.planSubjectiveCount)
              params.planCount = Number(params.planCount)
              let selectType = [
                {name:'单选题',arrStr:'singleSelectType',string:'single'},
                {name:'多选题',arrStr:'multiplySelectType',string:'multiply'},
                {name:'判断题',arrStr:'trueFalseType',string:'trueFalse'},
                {name:'填空题',arrStr:'completionType',string:'completion'},
                {name:'主观题',arrStr:'subjectType',string:'subject'},
              ];
              selectType.forEach(type =>{
                params[type.arrStr]=[];
                if (params[type.string]) {
                  params[type.arrStr].push(type.name)
                }
                if (this[type.arrStr].length>0) {
                  let arrSelectType = [];
                  this[type.arrStr].forEach(item =>{
                    if (item.select === true) {
                      arrSelectType.push(item.name);
                    }
                  });
                  params[type.arrStr] = [...params[type.arrStr],...arrSelectType]
                }
              });
              if(selectType.every(v =>params[v.arrStr].length === 0)){
                this.$message({
                  message:'题库类型不能为空！！！',
                  type:'error'
                })
                return false
              }
              if (!params.isReviewer) {
                params.reviewerId = ''
              }
              this.$api.bank.save(params).then((res) => {
                this.editLoading = false
                this.dialogVisible = false
                this.$refs['dataForm'].resetFields()
                this.findPage(null)
              })
            })
          }
        })
      },
      // 获取课程
      findCourse: function () {
        queryBean('Course',{status:0}).then((res) => {
          // 加载角色集合
          this.courseData = res.bean.data;
        })
      },
      // 获取用户组列表
      findDeptTree: function () {
        this.$api.dept.findDeptTree().then((res) => {
          this.deptData = res.bean.data;
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
          this.deptData1=options(res.bean.data)
        })
      },
      // 菜单树选中
      deptTreeCurrentChangeHandle (data, node) {
        this.dataForm.deptmentId = data.id
        this.dataForm.deptName = data.name
      },
      // 时间格式化
      dateFormat:function(row, column, cellValue, index){
        return format(row[column.property])
      },
      // 时间格式化
      annualFormat:function(row, column, cellValue, index){
        return this.annualData[row.annual].label;
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
          {prop:"code", label:"题库编号", minWidth:80},
          {prop:"name", label:"题库名称", minWidth:120},
          {prop:"type", label:"题库类别", minWidth:120,},
          {prop:"questCount", label:"试题数量", minWidth:120,},
          // {prop:"creator.name", label:"创建人", minWidth:120},
          {prop:"remark", label:"备注信息", minWidth:100},
          // {prop:"createBy", label:"创建人", minWidth:120},
          // {prop:"createTime", label:"创建时间", minWidth:120, formatter:this.dateFormat}
          // {prop:"lastUpdateBy", label:"更新人", minWidth:100},
          // {prop:"lastUpdateTime", label:"更新时间", minWidth:120, formatter:this.dateFormat}
        ]
        this.filterColumns = this.columns;
      },
      courseChangeHandle(val){
        queryBean('Course',{id:val}).then(res =>{
          this.textbookData=res.bean.data[0].textbook;
        })
      },
    },
    mounted(){
      // this.findDeptTree();
      this.findCourse();
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
  .type_box{
    border-top:1px solid #e0e0e0;
    border-left:1px solid #e0e0e0;
  }
  .type_box_list{
    display: flex;
  }
  .type_box_list>div{
    padding:0 10px;
    border-bottom:1px solid #e0e0e0;
    border-right:1px solid #e0e0e0;
  }
  .type_box_title{
    width:30%;
  }
  .type_box_title i{
    cursor: pointer;
  }
  .type_box_content{
    width:70%;
  }
  .type_box_content>div{
    display: inline-block;
    margin-right:10px;
  }
</style>
