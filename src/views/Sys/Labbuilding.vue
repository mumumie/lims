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
    <kt-table
      :height="350"
      :btnWidth="280"
      permsEdit="sys:user:edit"
      permsDelete="sys:user:delete"
      permsDetail=""
      :data="pageResult"
      :columns="filterColumns"
      @findPage="findPage"
      @handleEdit="handleEdit"
      @handleDetail="handleDetail"
      :showBtnDetail="true"
      @handleDelete="handleDelete">
    </kt-table>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" label-width="100px" :rules="dataFormRules" ref="dataForm" :size="size"
               label-position="right">
        <el-form-item label="ID" prop="id" v-if="false">
          <el-input v-model="dataForm.id" :disabled="true" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="楼栋" prop="name">
          <el-input v-model="dataForm.name" auto-complete="off" :disabled="operation?false:true"></el-input>
        </el-form-item>
        <el-form-item label="简称" prop="shortName">
          <el-input v-model="dataForm.shortName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="电力负荷" prop="powerLoad">
          <el-input v-model="dataForm.powerLoad" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="总楼层" prop="floorSum">
          <el-input v-model.number="dataForm.floorSum" auto-complete="off" ></el-input>
        </el-form-item>
        <el-form-item label="占地面积" prop="area">
          <el-input v-model.number="dataForm.area" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="教室" prop="labRoomIds">
          <el-select v-model="dataForm.labRoomIds" multiple filterable placeholder="请选择"
                     style="width: 100%;">
            <el-option v-for="item in lab" :key="item.name"
                       :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="教室分布图" prop="netWork">
          <el-upload
            :action="global.baseUrl+'/thumb'"
            name="image"
            list-type="picture-card"
            :before-upload="beforeAvatarUpload"
            :on-preview="handlePictureCardPreview"
            :on-change="handleChange"
            :file-list="fileList"
            :on-remove="handleRemove">
            <i class="el-icon-plus"></i>
          </el-upload>
          <el-dialog :visible.sync="ImageUrldialogVisible" append-to-body>
            <img width="100%" :src="dialogImageUrl" alt="">
          </el-dialog>
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
      title="详情"
      :visible.sync="detailVisible">
      <div>
        <el-alert
          title="所有教室"
          type="info"
          :closable="false">
        </el-alert>
        <el-table
          :data="labData"
          border
          size="mini"
          style="width: 100%">
          <el-table-column
            prop="name"
            label="教室"
          ></el-table-column>
          <el-table-column
            prop="floorNum"
            label="楼层"
          ></el-table-column>
          <el-table-column
            prop="type"
            label="类型"
          ></el-table-column>
        </el-table>
        <el-alert
          title="教室分布图"
          type="info"
          :closable="false">
        </el-alert>
        <div class="picData">
          <div class="pic" v-for="item in picData" :key="item">
            <img :src="global.baseUrl+item" />
          </div>
        </div>
        <el-alert
          title="楼栋信息"
          type="info"
          :closable="false">
        </el-alert>
        <el-table
          :data="buildData"
          border
          size="mini"
          style="width: 100%">
          <el-table-column
            prop="name"
            label="楼栋"
          ></el-table-column>
          <el-table-column
            prop="shortName"
            label="简称"
          ></el-table-column>
          <el-table-column
            prop="powerLoad"
            label="电力负荷"
          ></el-table-column>
          <el-table-column
            prop="floorSum"
            label="总楼层"
          ></el-table-column>
          <el-table-column
            prop="area"
            label="占地面积"
          ></el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
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
  // import XLSX from 'xlsx'
  export default {
    name:'LabBuilding',
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
        ImageUrldialogVisible:false,//图片详情弹出框
        detailVisible:false,//详情页弹出框
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
          shortName:'',
          powerLoad:'220v',
          floorSum:0,
          area:0,
          picPath:[],
          labRoomIds:[],
        },
        deptData: [],
        deptTreeProps: {
          label: 'name',
          children: 'children'
        },
        fileList: [],
        dialogImageUrl:'',
        oldtableData:[],
        lab:[],
        labData:[], //详情教室数据
        picData:[],//详情教室分布图数据
        buildData:[],//楼栋详情
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
        this.$api.labbuilding.findPage(this.pageRequest).then((res) => {
          this.pageResult = res.pageResult;
        }).then(data!=null?data.callback:'')
      },
      // 批量删除
      handleDelete: function (data) {
        this.$api.labbuilding.batchDelete(data.params).then(data!=null?data.callback:'')
      },
      // 显示新增界面
      handleAdd: function () {
        this.fileList=[];
        this.dialogVisible = true;
        this.operation = true;
        this.dataForm = {
          id: 0,
          name: '',
          shortName:'',
          powerLoad:'220v',
          floorSum:0,
          area:0,
          picPath:[]
        }
      },
      // 显示编辑界面
      handleEdit: function (params) {
        this.dataForm = Object.assign({}, params.row);
        this.fileList=params.row.picPath.map(item =>{
          return {
            url:this.global.baseUrl+item,
            response:item
          }
        });
        this.dialogVisible = true;
        this.operation = false;
      },
      handleDetail:function(params){
        this.detailVisible = true;
        this.picData=params.row.picPath;
        this.buildData=[params.row];
        this.labData=params.row.labRoomIds.map(item =>{
          let obj=this.lab.find((it) => it.id === item);
          if(obj){
            let type='';
            if(obj.type===1){
              type='教室';
            }else if(obj.type===2){
              type='实验室';
            }else{
              type='';
            }
            return {
              floorNum:obj.floorNum,
              name:obj.name,
              id:obj.id,
              type:type
            }
          }
        });
      },
      // 编辑
      submitForm: function () {
        this.$refs.dataForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let params = Object.assign({}, this.dataForm);
              params.picPath=this.fileList.map(item => item.response);
              console.log(params.picPath);
              this.$api.labbuilding.save(params).then((res) => {
                this.editLoading = false;
                this.dialogVisible = false;
                this.$refs['dataForm'].resetFields();
                this.findPage(null);
                this.fileList=[];
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
          {prop:"name", label:"楼栋", minWidth:120},
          {prop:"shortName", label:"简称", minWidth:120},
          {prop:"powerLoad", label:"电力负荷", minWidth:120},
          {prop:"floorSum", label:"总楼层", minWidth:100},
          {prop:"area", label:"占地面积(m)", minWidth:120},
          // {prop:"netWork", label:"网络情况", minWidth:100},
          // {prop:"createBy", label:"创建人", minWidth:120},
          // {prop:"insertDt", label:"创建时间", minWidth:120,formatter:this.dateFormat}
          // {prop:"lastUpdateBy", label:"更新人", minWidth:100},
          // {prop:"lastUpdateTime", label:"更新时间", minWidth:120, formatter:this.dateFormat}
        ];
        // this.filterColumns = JSON.parse(JSON.stringify(this.columns));
        this.filterColumns = this.columns;
      },
      // 加载实验室信息
      findlabroom: function () {
        this.$api.labroom.findAll().then((res) => {
          // 加载实验室集合
          this.lab = res.bean.data
        })
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
      // 上传之前
      beforeAvatarUpload(file) {
        const isJPG = file.type === 'image/jpeg';
        const isPNG = file.type === 'image/png';
        const isGIF = file.type === 'image/gif';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG&&!isPNG&&!isGIF) {
          this.$message.error('上传头像图片只能是 JPG,PNG,GIF 格式!');
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!');
        }
        return (isJPG  || isPNG || isGIF) && isLt2M;
      },
      //上传文件时
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url;
        this.ImageUrldialogVisible = true;
      },
      //移除文件时
      handleRemove(file, fileList) {
        this.fileList=fileList;

      },
      //上传改变时
      handleChange:function(file, fileList){
        this.fileList = fileList.slice(-5);
        console.log(this.fileList)
      },
    },
    mounted() {
      // this.findDeptTree();
      this.findlabroom();
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
  .picData{
    width:100%;
    height:250px;
    display: flex;
    flex-wrap:wrap;
    justify-content:space-around;
    align-items:center;
  }
  .picData .pic{
    flex:auto;
    width:200px;
    text-align: center;
  }
  .picData .pic img{
    width:200px;
    height:200px;
  }
</style>
<style>
  .el-upload-list__item {
    transition: none !important;
  }
</style>
