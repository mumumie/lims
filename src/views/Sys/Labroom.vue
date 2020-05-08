<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
          <el-input v-model="filters.name" placeholder="教室房间号"></el-input>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="sys:role:view" type="primary" @click="findPage(null)"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="sys:user:add" type="primary" @click="handleAdd" />
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
      <table-column-filter-dialog ref="tableColumnFilterDialog" :columns="columns"
                                  @handleFilterColumns="handleFilterColumns">
      </table-column-filter-dialog>
    </div>
    <!--表格内容栏-->
    <kt-table :height="350" permsEdit="sys:user:edit" permsDelete="sys:user:delete"
              :data="pageResult" :columns="filterColumns"
              @findPage="findPage" @handleEdit="handleEdit" @handleDelete="handleDelete">
    </kt-table>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" label-width="80px" :rules="dataFormRules" ref="dataForm" :size="size"
               label-position="right">
        <el-form-item label="ID" prop="id" v-if="false">
          <el-input v-model="dataForm.id" :disabled="true" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="房间号" prop="name">
          <el-input v-model="dataForm.name" auto-complete="off" :disabled="operation?false:true"></el-input>
        </el-form-item>
        <el-form-item label="房间类型" prop="type">
          <el-select v-model="dataForm.type"  placeholder="请选择"
                     style="width: 100%;">
            <el-option label="教室" value="1"></el-option>
            <el-option label="实验室" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="电力负荷" prop="powerLoad">
          <el-input v-model="dataForm.powerLoad" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="楼层" prop="floorNum">
          <el-input v-model.number="dataForm.floorNum" auto-complete="off" ></el-input>
        </el-form-item>
        <el-form-item label="占地面积" prop="area">
          <el-input v-model.number="dataForm.area" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="网络情况" prop="netWork">
          <el-input v-model="dataForm.netWork" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">{{$t('action.submit')}}</el-button>
      </div>
    </el-dialog>
    <!--批量新增界面-->
    <el-dialog title="批量添加" width="60%" :visible.sync="dialogVisibleBatch" :close-on-click-modal="false">
      <div class="batchAddHeader">
        <el-upload
          ref="upload"
          action="/"
          :show-file-list="false"
          :on-change="importExcel"
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
          <el-table-column prop="name" label="房间号">
          </el-table-column>
          <el-table-column prop="type" label="房间类型">
            <template slot-scope="scope">
              <span>{{scope.row.type === 1 ? '教室' : '实验室'}}</span>
            </template>
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
  import {addBean, queryBean, updateBean} from "@/http/base";
  // import XLSX from 'xlsx'
  export default {
    name:'LabRoom',
    components:{
      PopupTreeInput,
      KtTable,
      KtButton,
      TableColumnFilterDialog
    },
    data() {
      return {
        size: 'small',
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
          shortName: '',
          powerLoad:'220v',
          floorSum:{
            type:Number
          },
          area:{
            type:Number
          },
          picPath:[]
        },
        deptData: [],
        deptTreeProps: {
          label: 'name',
          children: 'children'
        },
        roles: [],
        oldtableData:[],
      }
    },
    methods: {
      // 获取分页数据
      findPage: function (data) {
        if(data !== null) {
          this.pageRequest = data.pageRequest;
        }
        if(this.filters.name){
          this.pageRequest.condition = {name: this.filters.name};
        }else{
          this.pageRequest.condition={};
        }
        this.$api.labroom.findPage(this.pageRequest).then((res) => {
          this.pageResult = res.pageResult;
        }).then(data!=null?data.callback:'')
      },
      // 批量删除
      handleDelete: function (data) {
        this.$api.labroom.batchDelete(data.params).then(data!=null?data.callback:'')
      },
      // 显示新增界面
      handleAdd: function () {
        this.dialogVisible = true;
        this.operation = true;
        this.dataForm = {
          id: 0,
          name: '',
          type: '1'
        }
      },
      // 显示编辑界面
      handleEdit: function (params) {
        this.dialogVisible = true;
        this.operation = false;
        this.dataForm = Object.assign({}, params.row);
        this.dataForm.type=String(this.dataForm.type);
      },
      // 编辑
      submitForm: function () {
        this.$refs.dataForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let params = Object.assign({}, this.dataForm);
              this.$api.labroom.save(params).then((res) => {
                if (params.id == 0){

                }
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
          {prop:"name", label:"房间号", minWidth:120},
          {prop:"type", label:"房间类型", minWidth:120,formatter:this.roomFilter},
          {prop:"powerLoad", label:"电力负荷", minWidth:120},
          {prop:"floorNum", label:"楼层", minWidth:100},
          {prop:"area", label:"占地面积(m)", minWidth:120},
          {prop:"netWork", label:"网络情况", minWidth:100},
          // {prop:"createBy", label:"创建人", minWidth:120},
          // {prop:"insertDt", label:"创建时间", minWidth:120,formatter:this.dateFormat}
          // {prop:"lastUpdateBy", label:"更新人", minWidth:100},
          // {prop:"lastUpdateTime", label:"更新时间", minWidth:120, formatter:this.dateFormat}
        ];
        // this.filterColumns = JSON.parse(JSON.stringify(this.columns));
        this.filterColumns = this.columns;
      },
      //房间号过滤
      roomFilter:function(row, column, cellValue, index){
        if(row.type === 1){
          return '教室';
        }else if(row.type === 2){
          return '实验室';
        }else{
          return '';
        }
      },
      // 时间格式化
      dateFormat: function (row, column, cellValue, index){
        return format(row[column.property])
      },
      //批量添加用户显示界面
      handleBatchAdd:function(){
        this.dialogVisibleBatch = true
      },
      //批量导入excle
      importExcel(file) {
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
                let type;
                arr['name'] =  item['房间号'];
                if(item['房间类型']==='教室'){
                  type=1
                }else if(item['房间类型']==='实验室'){
                  type=2
                }else{
                  type=null
                }
                arr['type'] =  type;

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
          this.$api.labroom.addBatchBean(that.tableData)
            .then(function (res) {
              if(res.retCode == 0){
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
