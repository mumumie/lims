<template>
  <div class="page-container">
    <tip :value="
    ['教师授课的设置，前提要有课程',
    '教师与所教授的课程相关联，然后学生才可以进行选课']" />
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
<!--        <el-form-item>-->
<!--          <el-input v-model="filters.name" style="width:150px;" placeholder="请输入教师名称"></el-input>-->
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
      <el-form :model="dataForm" label-width="80px" :rules="dataFormRules" ref="dataForm" :size="size"
               label-position="right">
        <el-form-item label="教师姓名" prop="name">
          <el-input v-model="dataForm.name" auto-complete="off" @focus="addTeacherId" placeholder="请选择教师"></el-input>
        </el-form-item>
        <el-form-item label="课程名称" prop="nickname">
          <el-input v-model="dataForm.nickname" auto-complete="off" @focus="addCourseId" placeholder="请选择课程"></el-input>
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
      <CourseSelect
        ref="myCourseId"
        :dialogVisible="addCourseVisible"
        @courseVisible="courseVisible"
        @changeCourse="changeCourse">
      </CourseSelect>
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
  import CourseSelect from "@/components/ObjectSelect/CourseSelect";
  export default {
    components:{
      PopupTreeInput,
      KtTable,
      KtButton,
      TableColumnFilterDialog,
      TeacherSelect,
      CourseSelect,
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
            { required: true, message: '请选择教师', trigger: 'change' }
          ],
          nickname: [
            { required: true, message: '请选择课程', trigger: 'change' }
          ]
        },
        // 新增编辑界面数据
        dataForm: {
          id: 0,
          name: '',
          nickname: '',
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
        this.$api.teacher.findPage(pageRequest).then((res) => {
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
          this.$api.teacher.singleDelete(params.row).then(res =>{
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
          this.$api.teacher.deleteBatchBean(params).then(res =>{
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
          passwd: '',
        }
      },
      // 显示编辑界面
      handleEdit: function (params) {
        this.dialogVisible = true;
        this.operation = false;
        this.dataForm = Object.assign({}, params.row);
        this.dataForm.name = params.row.teacher.nickname;
        this.dataForm.nickname = params.row.course.name;

      },
      //跳转详情界面
      handleDetail:function(params){
        this.$router.push({name:'用户中心',params:{id : params.row.id}});
      },
      selectionChange:function(params){
        this.excelData=params.selections;
      },
      //添加题目
      addTeacherId:function(){
        this.addTeacherVisible=true;
        this.$refs.myTeacherId.getTableData();
      },
      changeTeacher:function(val){
        this.addTeacherVisible=false;
        this.dataForm.name = val.nickname;
        this.dataForm.teacherId = val.id;
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
        this.dataForm.nickname = val.name;
        this.dataForm.courseId = val.id;
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
              this.$api.teacher.save(params).then((res) => {
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
      dateFormat: function (row, column, cellValue, index){
        return format(row[column.property])
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
          {prop:"teacher.nickname", label:"教师姓名", minWidth:120},
          // {prop:"teacherId", label:"教师ID", minWidth:120},
          {prop:"course.name", label:"课程名称", minWidth:120},
          // {prop:"courseId", label:"课程ID", minWidth:100},
          // {prop:"createBy", label:"创建人", minWidth:120},
          // {prop:"createTime", label:"创建时间", minWidth:120, formatter:this.dateFormat}
          // {prop:"lastUpdateBy", label:"更新人", minWidth:100},
          // {prop:"lastUpdateTime", label:"更新时间", minWidth:120, formatter:this.dateFormat}
        ]
        this.filterColumns = JSON.parse(JSON.stringify(this.columns));
      },
      //批量添加用户显示界面
      handleBatchAdd:function(){
        this.dialogVisibleBatch = true
      },
      //批量导入excle
      importExcel1(file) {
        const types = file.name.split('.')[1];
        this.fileName=file.name;
        const fileType = ['xlsx', 'xlc', 'xlm', 'xls', 'xlt', 'xlw', 'csv'].some(item => item === types);
        if (!fileType) {
          this.$message('文件格式错误！请重新选择');
          return;
        }else {
          let _this = this;
          // 通过DOM取文件数据
          this.file = event.currentTarget.files[0];
          // this.file = event.currentTarget.files[0];
          var rABS = false; //是否将文件读取为二进制字符串
          var f = this.file;
          var reader = new FileReader();
          //if (!FileReader.prototype.readAsBinaryString) {
          FileReader.prototype.readAsBinaryString = function(f) {
            var binary = "";
            var rABS = false; //是否将文件读取为二进制字符串
            var wb; //读取完成的数据
            var outdata;
            var reader = new FileReader();
            reader.onload = function(e) {
              var bytes = new Uint8Array(reader.result);
              var length = bytes.byteLength;
              for(var i = 0; i < length; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              var XLSX = require('xlsx');
              if(rABS) {
                wb = XLSX.read(btoa(fixdata(binary)), { //手动转化
                  type: 'base64'
                });
              } else {
                wb = XLSX.read(binary, {
                  type: 'binary'
                });
              }
              outdata = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
              //outdata就是你想要的东西
              this.da = [...outdata];
              let tableData = this.da.map(item => {
                var arr={}
                arr['name'] =  item['账号'];
                arr['nickname'] =  item['昵称'];
                arr['passwd'] =  String(item['密码']);
                arr['deptmentId'] =  item['部门id'];
                arr['email'] =  item['邮箱'];
                arr['phone'] =  item['手机'];
                return arr;
              });
              console.log(tableData);
              _this.tableData=tableData;
            };
            reader.readAsArrayBuffer(f);
          };
          if(rABS) {
            reader.readAsArrayBuffer(f);
          } else {
            reader.readAsBinaryString(f);
          }
        }
      },

      //批量添加按钮
      BatchAdd:function () {
        var that = this;
        this.editLoading = true;
        if(that.tableData){
          this.$api.teacher.addBatchBean(that.tableData)
            .then(function (res) {
              if(res.retCode === 0){
                console.log(res.bean);
                that.$message("导入成功");
                that.editLoading = false;
                that.dialogVisibleBatch=false;
                that.findPage(null);
                that.tableData = [];
              }
            }).catch(function (error) {
            that.$message(error);
          })
        }else{
          that.$message("导入为空");
        }

      },
      // 导出excel数据
      handleDownload(data1) {
        console.log(data1);
        if (data1.length > 0) {
          this.$confirm('确定将此数据导出Excel文件?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            import('@/vendor/Export2Excel').then(excel => {
              const tHeader = ['账号', '昵称', '部门', '角色', '邮箱', '手机'] // 表头
              const filterVal = ['name', 'nickname', 'deptName', 'roleNames', 'email', 'phone'] // 需要导出的项目
              const list = data1 ;// 所有列表数据
              const data = this.formatJson(filterVal, list);
              excel.export_json_to_excel({
                header: tHeader,
                data,
                autoWidth: this.autoWidth,
                filename: '用户表' // 文件名称
              })
              this.downloadLoading = false
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消导出'
            })
          })
        } else {
          this.$message('暂无数据可导出')
        }
      },
      // 过滤需要的数据
      formatJson(filterVal, jsonData) {
        return jsonData.map(v => filterVal.map(j => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        }))
      },
      parseTime(time, cFormat) {
        if (arguments.length === 0) {
          return null
        }
        const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
        let date
        if (typeof time === 'object') {
          date = time
        } else {
          if (('' + time).length === 10) time = parseInt(time) * 1000
          date = new Date(time)
        }
        const formatObj = {
          y: date.getFullYear(),
          m: date.getMonth() + 1,
          d: date.getDate(),
          h: date.getHours(),
          i: date.getMinutes(),
          s: date.getSeconds(),
          a: date.getDay()
        }
        const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
          let value = formatObj[key]
          if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
          if (result.length > 0 && value < 10) {
            value = '0' + value
          }
          return value || 0
        })
        return time_str
      },
      handleDownloadAll:function(){
        let pageRequest={
          pageNum: 1,
          sort:{
            insertDt:-1,
          },
          condition:{}
        };
        if(this.filters.name){
          pageRequest.condition['name$regex'] = this.filters.name;
        }
        if (this.filters.deptmentId.length > 0) {
          pageRequest.condition.deptmentId = this.filters.deptmentId[this.filters.deptmentId.length-1]
        }
        if (this.filters.roleIdList.length > 0) {
          pageRequest.condition.roleIdList = this.filters.roleIdList
        }
        this.$api.teacher.findPage(pageRequest).then((res) => {
          this.excelAllData=res.bean.data;
          this.$nextTick(function(){
            this.handleDownload(this.excelAllData);
          })

        })
      },

    },
    mounted() {
      this.findDeptTree();
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
