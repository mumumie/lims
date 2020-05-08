<template>
  <div class="page-container">
    <tip :value="
    ['包含部门和班级的增删改查，以及指定客户拥有的题库(即非自建题库)',
     '班级是一种特殊的部门，班级下不能有其他班级或部门',
     '按类型查询时，将不以树状结构显示']" />
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
          <el-select v-model="filters.type" clearable placeholder="类型" style="width:120px;">
            <el-option label="部门" :value="0"></el-option>
            <el-option label="班级" :value="1"></el-option>
<!--            <el-option label="客户" :value="3"></el-option>-->
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.name" style="width:150px;" placeholder="名称"></el-input>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="" type="primary" @click="findPage(null)"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="" type="primary" @click="handleAdd" />
        </el-form-item>
<!--        <el-form-item>-->
<!--          <kt-button  icon="el-icon-upload" label="批量添加" perms="sys:user:add" type="primary" @click="handleBatchAdd" />-->
<!--        </el-form-item>-->
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
<!--            <el-tooltip content="导出" placement="top">-->
<!--              <el-button icon="fa fa-file-excel-o" @click="handleDownload(excelData)"></el-button>-->
<!--            </el-tooltip>-->
<!--            <el-tooltip content="导出全部" placement="top">-->
<!--              <el-button icon="el-icon-s-release" @click="handleDownloadAll"></el-button>-->
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
    <el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false" append-to-body>
      <el-form :model="dataForm" label-width="80px" :rules="dataFormRules" ref="dataForm" :size="size"
               label-position="right">
        <el-form-item label="ID" prop="id" v-if="false">
          <el-input v-model="dataForm.id" :disabled="true" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="dataForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="上级部门" prop="deptName">
          <popup-tree-input
            :data="deptData"
            :props="deptTreeProps"
            :prop="dataForm.parentName"
            :nodeKey="''+dataForm.parentId"
            :currentChangeHandle="deptTreeCurrentChangeHandle">
          </popup-tree-input>
        </el-form-item>
<!--        <el-form-item label="非自建题库" v-if="!operation">-->
<!--          <el-select v-model="dataForm.questBankIds" clearable multiple placeholder="请选择题库" >-->
<!--            <el-option :label="item.name" :value="item.id" v-for="item in questBankData" :key="item.id"></el-option>-->
<!--          </el-select>-->
<!--        </el-form-item>-->
        <el-form-item label="类型">
          <el-select v-model="dataForm.type" clearable placeholder="请选择部门" >
            <el-option label="部门" :value="0"></el-option>
            <el-option label="班级" :value="1"></el-option>
<!--            <el-option label="客户" :value="3"></el-option>-->
          </el-select>
        </el-form-item>
        <el-form-item label="状态" v-if="!operation">
          <el-select v-model="dataForm.status" placeholder="请选择" >
            <el-option label="停用" :value="0"></el-option>
            <el-option label="启用" :value="1"></el-option>
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
          <el-table-column prop="nickname" label="昵称" >
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
  import KtTable from "@/views/Core/DeptTable"
  import KtButton from "@/views/Core/KtButton"
  import TableColumnFilterDialog from "@/views/Core/TableColumnFilterDialog"
  import { format } from "@/utils/datetime"
  import {addBean, queryBean, updateBean,addBatchBean} from "@/http/base";
  // import XLSX from 'xlsx'
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
          type:'',
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
          ]
        },
        // 新增编辑界面数据
        dataForm: {
          id: 0,
          name: '',
          parentName: '',
          parentId: '',
          type:0,
          questBankIds:''
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
        questBankData:[],
      }
    },
    methods: {
      // 获取分页数据
      findPage: function (data) {
        let pageRequest = {
          pageNum: 1,
          pageSize: 10,
          condition: {}
        };
        if (data !== null) {
          pageRequest = data.pageRequest;
        }
        if(this.filters.type !== ''){
          pageRequest.condition.type = this.filters.type;
        }
        if(this.filters.name){
          pageRequest.condition['name$regex'] = this.filters.name;
        }
        this.$api.dept.findPage(pageRequest).then((res) => {
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
// 批量删除
      handleDelete: function (params) {
        this.$confirm('删除后不可恢复，确定删除这一项吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$api.dept.singleDelete(params.row).then(res =>{
            if (res.retCode === 0) {
              this.$message({
                type:"success",
                message:'已删除！！！'
              })
              this.findPage(null);
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
          parentName: '',
          parentId: '',
          type:0,
        }
      },
      // 显示编辑界面
      handleEdit: function (params) {
        this.dialogVisible = true
        this.operation = false
        this.dataForm = Object.assign({}, params.row);
        // this.findQuestBank(this.dataForm.id);

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
              this.$api.dept.save(params).then((res) => {
                this.editLoading = false;
                this.dialogVisible = false;
                this.$refs['dataForm'].resetFields();
                this.findPage(null);
                this.findDeptTree();
              })
            })
          }
        })
      },
      // 获取部门列表
      findDeptTree: function () {
        let postData = {

        }
        this.$api.dept.findDept(postData).then((res) => {
          this.deptData = res.bean.data;
        })
      },
      // 菜单树选中
      deptTreeCurrentChangeHandle (data, node) {
        this.dataForm.parentId = data.id;
        this.dataForm.parentName = data.name
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
          {prop:"name", label:"名称", minWidth:120},
          {prop:"type", label:"类型", minWidth:100, formatter: (row) =>{
              if(row.type === 0) return '部门';
              if(row.type === 1) return '班级';
              if(row.type === 3) return '客户';
              return '未知'
            }},
          {prop:"parentName", label:"上级名称", minWidth:120},
          // {prop:"parentId", label:"上级ID", minWidth:120},
          {prop:"status", label:"状态", minWidth:100 , formatter:(row) =>{
              if(row.status === 0) return '停用';
              if(row.status === 1) return '启用';
              return '未知'
            }}
          // {prop:"createBy", label:"创建人", minWidth:120},
          // {prop:"createTime", label:"创建时间", minWidth:120, formatter:this.dateFormat}
          // {prop:"lastUpdateBy", label:"更新人", minWidth:100},
          // {prop:"lastUpdateTime", label:"更新时间", minWidth:120, formatter:this.dateFormat}
        ]
        this.filterColumns = this.columns;
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
      findQuestBank(id){
        let exCondition={
          notinDeptmentId:id
        }
        queryBean('QuestBank',undefined,undefined,exCondition).then(res =>{
          this.questBankData = res.bean.data;
        })
      }
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
