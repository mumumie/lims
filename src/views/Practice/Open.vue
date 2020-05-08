<template>
  <div class="page-container">
    <tip :value="
    ['从题库中选择一批试题来组成试卷']" />
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
          <el-input v-model="filters.name" style="width:150px;" placeholder="请输入练习名称"></el-input>
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
      permsEdit=""
      permsDelete=""
      permsDetail=""
      :data="pageResult"
      :columns="filterColumns"
      @selectionChange="selectionChange"
      @findPage="findPage"
      :showBtnDetail="false"
      @handleEdit="handleEdit"
      @handleDetail="handleDetail"
      @handleDelete="handleDelete">
    </kt-table>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="600px" :visible.sync="dialogVisible" :close-on-click-modal="false" append-to-body>
      <el-form :model="dataForm" label-width="80px" :rules="dataFormRules" ref="dataForm" :size="size"
               label-position="right">
        <el-form-item label="课程题库" prop="questBankId">
          <el-select v-model="dataForm.questBankId" placeholder="请选择" @change="questBankChangeHandle">
            <el-option :label="item.name" :value="item.id" v-for="item in questBankData" :key="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建类型" prop="openType">
          <el-radio-group v-model="dataForm.openType" disabled>
            <el-radio :label="1">开放练习</el-radio>
            <el-radio :label="2">自测</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选择班级" prop="deptmentIds">
          <el-cascader
            v-model="dataForm.deptmentIds"
            :options="deptData1"
            :props="{ checkStrictly: true }"
            collapse-tags>
          </el-cascader>
        </el-form-item>
        <el-form-item label="章节"  prop="chapter">
          <el-select v-model="dataForm.chapter" multiple collapse-tags placeholder="请选择" >
            <el-option :label="item" :value="item" v-for="(item,index) in chapterData" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="题型"  prop="questType">
          <el-select v-model="dataForm.questType" multiple collapse-tags placeholder="请选择">
            <el-option :label="item.value" :value="item.value" v-for="(item,index) in typeData" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开放比例" prop="timeLimit">
          <el-select v-model="dataForm.timeLimit" placeholder="请选择试卷名称" >
            <el-option label="20%" :value="20" ></el-option>
            <el-option label="40%" :value="40" ></el-option>
            <el-option label="60%" :value="60" ></el-option>
            <el-option label="80%" :value="80" ></el-option>
            <el-option label="100%" :value="100" ></el-option>
          </el-select>
        </el-form-item>
<!--        <el-form-item label="时间限制" prop="timeLimit">-->
<!--          <el-input v-model="dataForm.timeLimit" auto-complete="off" placeholder="请选择课程"></el-input>-->
<!--        </el-form-item>-->
        <el-form-item label="时间范围" prop="time">
          <el-date-picker
            v-model="dataForm.time"
            type="daterange"
            value-format="timestamp"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="练习名称" prop="name">
          <el-input v-model="dataForm.name" auto-complete="off" placeholder="请输入练习名称"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">{{$t('action.submit')}}</el-button>
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
  export default {
    components:{
      PopupTreeInput,
      KtTable,
      KtButton,
      TableColumnFilterDialog,
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
        dialogVisibleBatch:false, //批量新增界面是否显示
        addTeacherVisible:false,
        addCourseVisible:false,
        editLoading: false,
        loading:false,
        dataFormRules: {
          name: [
            { required: true, message: '请输入练习名称', trigger: 'blur' }
          ],
          openType: [
            { required: true, message: '请选择创建类型', trigger: 'change' }
          ],
          timeLimit: [
            { required: true, message: '请选择开放比例', trigger: 'change' }
          ],
          deptmentIds: [
            { required: true, message: '请选择班级', trigger: 'change' }
          ],
          chapter: [
            { required: true, message: '请选择章节', trigger: 'change' }
          ],
          questType: [
            { required: true, message: '请选择题型', trigger: 'change' }
          ],
          time: [
            { required: true, message: '请选择时间范围', trigger: 'change' }
          ],
          questBankId: [
            { required: true, message: '请选择课程题库', trigger: 'change' }
          ],
        },
        // 新增编辑界面数据
        dataForm: {
          id: 0,
          openType: 1,
          name: '',
          questBankId:'',
          deptmentIds:[],
          chapter:[],
          questType:[],
          timeLimit:null,
          time:[],
        },
        deptData: [],
        deptData1: [],
        deptTreeProps: {
          label: 'name',
          children: 'children'
        },
        questBankData:[],
        chapterData:[],
        typeData:[],
      }
    },
    methods: {
      // 获取分页数据
      findPage: function (data) {
        let pageRequest={
          pageNum: 1,
          pageSize: 10,
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
        pageRequest.condition['openType'] = 1;
        this.$api.practice.findPage(pageRequest).then((res) => {
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
        this.dataForm.type = [];
        this.dataForm.chapter=[]
      },
      // 批量删除
      handleDelete: function (params) {
        this.$confirm('确定后将永久删除，确定删除这一项吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$api.practice.singleDelete(params.row).then(res =>{
            if(res.retCode === 0){
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
          openType: 1,
          name: '',
          questBankId:'',
          deptmentIds:[],
          chapter:[],
          questType:[],
          timeLimit:null,
          time:[],
        }
      },
      // 显示编辑界面
      handleEdit: function (params) {
        this.questBankChangeHandle(params.row.questBankId);
        this.dataForm = Object.assign({}, params.row);
        this.dialogVisible = true;
        this.operation = false;

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
        this.$refs.dataForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let params = Object.assign({}, this.dataForm);
              this.$api.practice.save(params).then((res) => {
                this.editLoading = false
                this.dialogVisible = false
                this.$refs['dataForm'].resetFields()
                this.findPage(null)
              })
            })
          }
        })
      },
      // 获取部门列表
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
      dateFormat: function (row, column, cellValue, index){
        return format(row[column.property][0])+ '---' + format(row[column.property][1])
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
          {prop:"name", label:"练习名称", minWidth:100},
          // {prop:"createBy", label:"创建人", minWidth:120},
          {prop:"time", label:"时间范围", minWidth:120, formatter: this.dateFormat},
          // {prop:"lastUpdateBy", label:"更新人", minWidth:100},
          // {prop:"lastUpdateTime", label:"更新时间", minWidth:120, formatter:this.dateFormat}
        ]
        this.filterColumns = this.columns;
      },


    },
    mounted() {
      this.findDeptTree();
      this.findQuestBank();
      this.initColumns()
    }
  }
</script>

<style scoped>

</style>
