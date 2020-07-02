<template>
  <div class="page-container">
    <tip :value="
    ['学生根据教师及其关联的课程来进行选课。前提是教师及课程已进行关联。']" />
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
<!--        <el-form-item>-->
<!--          <el-input v-model="filters.name" style="width:150px;" placeholder="请输入学生姓名"></el-input>-->
<!--        </el-form-item>-->
<!--        <el-form-item>-->
<!--          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="" type="primary" @click="findPage(null)"/>-->
<!--        </el-form-item>-->
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="" type="primary" @click="handleAdd" />
        </el-form-item>
      </el-form>
    </div>
<!--    <div class="toolbar" style="float:right;padding-top:10px;padding-right:15px;">-->
<!--      <el-form :inline="true" :size="size">-->
<!--        <el-form-item>-->
<!--          <el-button-group>-->
<!--            <el-tooltip content="刷新" placement="top">-->
<!--              <el-button icon="fa fa-refresh" @click="findPage(null)"></el-button>-->
<!--            </el-tooltip>-->
<!--            <el-tooltip content="列显示" placement="top">-->
<!--              <el-button icon="fa fa-filter" @click="displayFilterColumnsDialog"></el-button>-->
<!--            </el-tooltip>-->
<!--          </el-button-group>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--      &lt;!&ndash;表格显示列界面&ndash;&gt;-->
<!--      <table-column-filter-dialog ref="tableColumnFilterDialog" :columns="columns"-->
<!--                                  @handleFilterColumns="handleFilterColumns">-->
<!--      </table-column-filter-dialog>-->
<!--    </div>-->
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
      @handleEdit="handleEdit"
      @handleDetail="handleDetail"
      @handleBatchDelete="handleBatchDelete"
      @handleDelete="handleDelete">
    </kt-table>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false" append-to-body>
      <el-form :model="dataForm" label-width="110px" :rules="dataFormRules" ref="dataForm" :size="size"
               label-position="right" v-if="dialogVisible">
        <el-form-item label="选择学年" prop="annual">
          <el-select
            v-model="dataForm.annual"
            placeholder="请选择学年"
            clearable
            style="width:200px;">
            <el-option v-for="(item,index) in annualData" :key="index" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择学期" prop="annual">
          <el-select
            v-model="dataForm.semester"
            placeholder="请选择学期"
            clearable
            style="width:200px;">
            <el-option label="第一学期" value="第一学期"></el-option>
            <el-option label="第二学期" value="第二学期"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="学生姓名" prop="name" >
          <el-input v-model="dataForm.name" auto-complete="off" @focus="addTeacherId" placeholder="请选择学生" :disabled="!operation"></el-input>
        </el-form-item>
        <el-form-item label="教师授课列表" prop="nickname">
          <el-input v-model="dataForm.nickname" auto-complete="off" @focus="addCourseId" placeholder="请选择课程"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">{{$t('action.submit')}}</el-button>
      </div>
      <StudentSelect
        ref="myTeacherId"
        :dialogVisible="addTeacherVisible"
        @teacherVisible="teacherVisible"
        @changeTeacher="changeTeacher">
      </StudentSelect>
      <CourseTeachSelect
        ref="myCourseId"
        :dialogVisible="addCourseVisible"
        @courseVisible="courseVisible"
        @changeCourse="changeCourse">
      </CourseTeachSelect>
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
  import StudentSelect from "@/components/ObjectSelect/StudentSelect";
  import CourseTeachSelect from "@/components/ObjectSelect/CourseTeachSelect";
  export default {
    components:{
      PopupTreeInput,
      KtTable,
      KtButton,
      TableColumnFilterDialog,
      StudentSelect,
      CourseTeachSelect,
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
            { required: true, message: '请选择学生', trigger: 'change' }
          ],
          nickname: [
            { required: true, message: '请选择姓名', trigger: 'change' }
          ],
          annual: [
            { required: true, message: '请选择学年', trigger: 'change' }
          ],
          semester: [
            { required: true, message: '请选择学期', trigger: 'change' }
          ],
        },
        // 新增编辑界面数据
        dataForm: {
          id: 0,
          name: '',
          nickname: '',
          annual: 2020,
          semester:''
        },
        deptData: [],
        deptData1: [],
        deptTreeProps: {
          label: 'name',
          children: 'children'
        },
        roles: [],
        excelData:[],
        excelAllData:[],
        annualData:[
          {label:'2017-2018', value: 2017},
          {label:'2018-2019', value: 2018},
          {label:'2019-2020', value: 2019},
          {label:'2020-2021', value: 2020},
          {label:'2021-2022', value: 2021},
          {label:'2022-2023', value: 2022},
        ]
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
          pageRequest.condition['nickname$regex'] = this.filters.name;
        }
        this.$api.student.findPage(pageRequest).then((res) => {
          this.pageResult = res.pageResult;
        }).then(data!=null?data.callback:'')
      },
      // 加载用户角色信息
      findUserRoles: function () {
        this.$api.role.findAll().then((res) => {
          // 加载角色集合
          this.roles = res.bean.data
        })
      },
      // 单个删除
      handleDelete: function (params) {
        this.$confirm('确定删除这一项吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$api.student.singleDelete(params.row).then(res =>{
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
      // 批量删除
      handleBatchDelete: function (params) {
        this.$confirm('确定批量删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$api.student.deleteBatchBean(params).then(res =>{
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
          nickname: '',
          annual:'',
          semester:''
        }
      },
      // 显示编辑界面
      handleEdit: function (params) {
        this.dialogVisible = true
        this.operation = false
        this.dataForm = Object.assign({}, params.row)
        this.dataForm.name = params.row.student.nickname;
        this.dataForm.nickname = params.row.courseTeaching.course.name + '---' + params.row.courseTeaching.teacher.nickname;
      },
      //跳转详情界面
      handleDetail:function(params){
        this.$router.push({name:'用户中心',params:{id : params.row.id}});
      },
      selectionChange:function(params){
        this.excelData=params.selections;
      },
      //添加学生
      addTeacherId:function(){
        this.addTeacherVisible=true;
        this.$refs.myTeacherId.getTableData();
      },
      changeTeacher:function(val){
        this.addTeacherVisible=false;
        this.dataForm.name = val.map(v =>{
          return v.nickname;
        }).toString();
        this.dataForm.studentId = val.map(v =>{
          return v.id;
        });
      },
      teacherVisible:function(val){
        this.addTeacherVisible=val;
      },
      //添加题目
      addCourseId:function(){
        this.addCourseVisible=true;
        this.$refs.myCourseId.getTableData();
      },
      changeCourse:function(val){
        this.addCourseVisible=false;
        this.dataForm.nickname = val.course.name+'---'+val.teacher.nickname;
        this.dataForm.courseTeachingId = val.id;
      },
      courseVisible:function(val){
        this.addCourseVisible=val;
      },
      // 编辑
      submitForm: function () {
        this.$refs.dataForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let params = Object.assign({}, this.dataForm);
              this.$api.student.save(params).then((res) => {
                this.editLoading = false
                this.dialogVisible = false
                this.$refs['dataForm'].resetFields()
                this.findPage(null)
              })
            })
          }
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
                arrStr.children=[];
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
        return row.annual + '-' + (row.annual + 1);
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
          {prop:"student.nickname", label:"学生姓名", minWidth:120},
          {prop:"annual", label:"学年", minWidth:120, formatter:this.annualFormat},
          {prop:"semester", label:"学期", minWidth:120},
          {prop:"courseTeaching.course.name", label:"课程名称", minWidth:100},
          {prop:"courseTeaching.teacher.nickname", label:"教师姓名", minWidth:100},
          // {prop:"createBy", label:"创建人", minWidth:120},
          // {prop:"createTime", label:"创建时间", minWidth:120, formatter:this.dateFormat}
          // {prop:"lastUpdateBy", label:"更新人", minWidth:100},
          // {prop:"lastUpdateTime", label:"更新时间", minWidth:120, formatter:this.dateFormat}
        ]
        this.filterColumns = this.columns;
      },


    },
    mounted() {
      // this.findDeptTree();
      this.initColumns()
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
</style>
