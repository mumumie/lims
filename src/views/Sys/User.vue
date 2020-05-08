<template>
  <div class="page-container">
    <tip :value="
    ['包含所有用户（管理员，教师，学生）的帐号的增删改查——用户一览，添加学生，编辑等等',
    '用户必须要指定一个或多个角色，该用户登录后才能看到该角色拥有的菜单。']" />
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
          <el-input v-model="filters.name" style="width:150px;" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="filters.roleIdList"
            placeholder="角色"
            clearable
            style="width:100px;">
            <el-option
              v-for="item in roles"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-cascader
            :options="deptData1"
            placeholder="部门"
            v-model="filters.deptmentId"
            :props="{ checkStrictly: true }"
            clearable>
          </el-cascader>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="" type="primary" @click="findPage(null)"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="sys:user:add" type="primary" @click="handleAdd" />
        </el-form-item>
        <el-form-item>
          <kt-button  icon="el-icon-upload" label="批量添加" perms="sys:user:add" type="primary" @click="handleBatchAdd" />
        </el-form-item>
      </el-form>
    </div>
    <div class="toolbar" style="float:right;padding-top:10px;padding-right:15px;">
      <el-form :inline="true" :size="size">
        <el-form-item>
          <el-button-group>
<!--            <el-tooltip content="刷新" placement="top">-->
<!--              <el-button icon="fa fa-refresh" @click="findPage(null)"></el-button>-->
<!--            </el-tooltip>-->
<!--            <el-tooltip content="列显示" placement="top">-->
<!--              <el-button icon="fa fa-filter" @click="displayFilterColumnsDialog"></el-button>-->
<!--            </el-tooltip>-->
            <el-tooltip content="导出" placement="top">
              <el-button icon="fa fa-file-excel-o" @click="handleDownload(excelData)"></el-button>
            </el-tooltip>
            <el-tooltip content="导出全部" placement="top">
              <el-button icon="el-icon-s-release" @click="handleDownloadAll"></el-button>
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
      permsEdit="sys:user:edit"
      permsDelete="sys:user:delete"
      permsDetail=""
      :data="pageResult"
      :columns="filterColumns"
      @selectionChange="selectionChange"
      @findPage="findPage"
      :showBtnDetail="true"
      @handleEdit="handleEdit"
      @handleDetail="handleDetail"
      @handleBatchDelete="handleBatchDelete"
      @handleDelete="handleDelete">
    </kt-table>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false" append-to-body>
      <el-form :model="dataForm" label-width="80px" :rules="dataFormRules" ref="dataForm" :size="size"
               label-position="right">
        <el-form-item label="ID" prop="id" v-if="false">
          <el-input v-model="dataForm.id" :disabled="true" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="账号" prop="name">
          <el-input v-model="dataForm.name" auto-complete="off" :disabled="operation?false:true"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="nickname">
          <el-input v-model="dataForm.nickname" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="passwd">
          <el-input v-model="dataForm.passwd" type="password" show-password auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="部门" prop="deptName">
          <popup-tree-input
            :data="deptData"
            :props="deptTreeProps"
            :prop="dataForm.deptName"
            :nodeKey="''+dataForm.deptmentId"
            :currentChangeHandle="deptTreeCurrentChangeHandle">
          </popup-tree-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="dataForm.email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="dataForm.phone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="userRoles">
          <el-select v-model="dataForm.userRoles" multiple placeholder="请选择"
                     style="width: 100%;">
            <el-option v-for="item in roles" :key="item.name"
                       :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">{{$t('action.submit')}}</el-button>
      </div>
    </el-dialog>
    <!--批量新增界面-->
    <el-dialog title="批量添加" width="60%" :visible.sync="dialogVisibleBatch" :close-on-click-modal="false" append-to-body>
      <div class="batchAddHeader">
        <el-upload
          ref="upload"
          action="/"
          :show-file-list="false"
          :on-change="importExcel1"
          :auto-upload="false">
          <kt-button
            slot="trigger"
            icon="el-icon-upload"
            label="批量导入"
            perms="sys:user:add"
            type="primary" />
        </el-upload>
        <a href="/static/批量导入用户模板.xlsx" download="批量导入用户模板.xlsx">下载模板</a>
      </div>
      <div>
        <el-table
          ref="tableData"
          v-loading="loading"
          element-loading-text="拼命加载中"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.8)"
          :data="tableData"
          tooltip-effect="dark"
          style="width: 100%"
          class="loading-area">
          <el-table-column prop="name" label="账号">
          </el-table-column>
          <el-table-column prop="nickname" label="姓名" >
          </el-table-column>
          <el-table-column prop="passwd" label="密码" >
          </el-table-column>
          <el-table-column prop="deptmentId" label="部门" >
          </el-table-column>
          <el-table-column prop="email" label="邮箱" >
          </el-table-column>
          <el-table-column prop="phone" label="手机" >
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisibleBatch = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="BatchAdd" :loading="editLoading">{{$t('action.submit')}}</el-button>
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
  import {addBean, queryBean, updateBean,addBatchBean,deleteBean} from "@/http/base";
  export default {
    components:{
      PopupTreeInput,
      KtTable,
      KtButton,
      TableColumnFilterDialog
    },
    data() {
      return {
        val:[],
        size: 'mini',
        filters: {
          name: '',
          deptmentId:[],
          roleIdList:[]
        },
        columns: [],
        filterColumns: [],
        pageRequest: { pageNum: 1, pageSize: 10 },
        pageResult: {},
        tableData:[], //批量导入用户列表
        operation: false, // true:新增, false:编辑
        dialogVisible: false, // 新增编辑界面是否显示
        dialogVisibleBatch:false, //批量新增界面是否显示
        editLoading: false,
        loading:false,
        dataFormRules: {
          name: [
            { required: true, message: '请输入用户名', trigger: 'blur' }
          ],
          nickname: [
            { required: true, message: '请输入用户姓名', trigger: 'blur' }
          ],
          passwd: [
            { required: true, message: '请输入用户密码', trigger: 'blur' }
          ],
          userRoles: [
            { required: true, message: '请输入用户角色', trigger: 'blur' }
          ],
        },
        // 新增编辑界面数据
        dataForm: {
          id: 0,
          name: '',
          nickname: '',
          passwd: '',
          deptmentId: '',
          deptName: '',
          email: '',
          phone: '',
          userRoles: [],
          userRolesId: ''
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
        if (this.filters.deptmentId.length > 0) {
          pageRequest.condition.deptmentId = this.filters.deptmentId[this.filters.deptmentId.length-1]
        }
        if (this.filters.roleIdList.length > 0) {
          pageRequest.condition.roleIdList = this.filters.roleIdList
        }
        this.$api.user.findPage(pageRequest).then((res) => {
          this.pageResult = res.pageResult;
          this.findUserRoles()
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
          this.$api.user.singleDelete(params.row).then(res =>{
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
          this.$api.user.deleteBatchBean(params).then(res =>{
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
        this.dialogVisible = true
        this.operation = true
        this.dataForm = {
          id: 0,
          name: '',
          nickname: '',
          passwd: '',
          deptmentId: 1,
          deptName: '',
          email: '',
          phone: '',
          userRoles: []
        }
      },
      // 显示编辑界面
      handleEdit: function (params) {
        this.dialogVisible = true
        this.operation = false
        this.dataForm = Object.assign({}, params.row)
        let userRoles = []
        for(let i=0,len=params.row.userRoles.length; i<len; i++) {
          userRoles.push(params.row.userRoles[i].roleId)
        }
        this.dataForm.userRoles = userRoles;
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
              let userRoles = [];
              for(let i=0,len=params.userRoles.length; i<len; i++) {
                let userRole = {
                  userId: params.id,
                  roleId: params.userRoles[i]
                };
                userRoles.push(userRole)
              }
              params.userRoles = userRoles;

              //保存用户后再保存用户角色
              let roleIdList = [];
              params.userRoles.forEach(v =>{
                roleIdList.push(v.roleId)
              });
              params.roleIdList = roleIdList;
              this.$api.user.save(params).then((res) => {
                if (params.id == 0){
                  let doc2 = {
                    userid: res.bean.id,
                    roleIdList: roleIdList
                  };
                  // addBean('UserRoles', doc2)
                }
                this.editLoading = false
                this.dialogVisible = false
                this.$refs['dataForm'].resetFields()
                this.findPage(null)
              }).catch(err =>{
                setTimeout(()=>{
                  this.editLoading = false;
                },2000)
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
          {prop:"name", label:"账号", minWidth:120},
          {prop:"nickname", label:"姓名", minWidth:120},
          {prop:"deptName", label:"部门", minWidth:120},
          {prop:"roleNames", label:"角色", minWidth:100},
          {prop:"email", label:"邮箱", minWidth:120},
          {prop:"phone", label:"手机", minWidth:100},
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
          this.$api.user.addBatchBean(that.tableData)
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
        this.$api.user.findPage(pageRequest).then((res) => {
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
