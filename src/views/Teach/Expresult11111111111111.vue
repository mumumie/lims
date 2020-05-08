<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true"  :size="size">
        <el-form-item>
          <el-select v-model="typeName" placeholder="typeName类型选择" filterable>
            <el-option
              v-for="(item,index) in selectInfo"
              :key="index"
              :label="item.zhName"
              :value="item.name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model="keyword" placeholder="关键词"></el-input>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="" type="primary" @click="findPage(null)"/>
        </el-form-item>
<!--        <el-form-item>-->
<!--          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="" type="primary" @click="handleAdd" />-->
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
    <kt-table
      :height="700"
      permsEdit=""
      permsDelete=""
      :data="pageResult"
      :columns="filterColumns"
      @findPage="findPage"
      ref="kt_table"
      @handleEdit="handleEdit"
      @handleDelete="handleDelete">
    </kt-table>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="60%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="formInfo" label-width="140px" :rules="dataFormRules" ref="dataForm" :size="size"
               class="input_value"
               label-position="right">
        <InputValue
          :name="item"
          v-for="item in tableNavs"
          :list="formInfo"
          :key="item.id"
          :operation="operation"
          @inputValue="inputValue"
          ref="isEmpty"
          v-if="reFresh"></InputValue>
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
  import InputValue from "@/components/DataManager/inputValue"
  import KtTable from "@/views/Core/data_KtTable"
  import KtButton from "@/views/Core/KtButton"
  import TableColumnFilterDialog from "@/views/Core/TableColumnFilterDialog"
  import { format } from "@/utils/datetime"
  import {addBean, queryBean, updateBean} from "@/http/base";
  export default {
    components:{
      PopupTreeInput,
      KtTable,
      KtButton,
      TableColumnFilterDialog,
      InputValue
    },
    data() {

      return {
        size: 'small',
        keyword:'',
        columns: [],
        filterColumns: [],
        pageRequest: { pageNum: 1, pageSize: 10 },
        pageResult: {},
        operation: false, // true:新增, false:编辑
        dialogVisible: false, // 新增编辑界面是否显示
        editLoading: false,
        dataFormRules: {

        },
        // 新增编辑界面数据
        dataForm: {
          id: 0,
          name: '',
          nickname: '',
          passwd: '123456',
          deptmentId: 1,
          deptName: '',
          email: 'test@qq.com',
          phone: '13889700023',
          userRoles: [],
          userRolesId: ''
        },
        deptData: [],
        deptTreeProps: {
          label: 'name',
          children: 'children'
        },
        roles: [],
        typeName:"bean.ExpOne",
        selectInfo:[],
        formInfo:{},
        inputsInfo:[],
        tableNav:[],
        tableNavs:[],
        reFresh:true,
      }
    },
    watch:{
      formInfo(){
        this.reFresh= false;
        this.$nextTick(()=>{
          this.reFresh = true
        })
      },

    },
    methods: {
      // 获取分页数据
      findPage: function (data) {
        this.initColumns(this.typeName);
        let postData={
          typeName:this.typeName,
          keyword:this.keyword,
          pagesize:10,
          pageno:0
        };
        if(data !== null) {
          postData.pageno=data.pageRequest.pageNum-1;
        }else{
          this.$refs.kt_table.clearPages();
        }
        this.$api.data.findKeyWord(postData).then((res) => {
          this.pageResult=res.pageResult;
          this.$nextTick(()=>{
            this.$refs.kt_table.tableRefresh()
          })
        }).then(data!=null?data.callback:'')
      },
      // 批量删除
      handleDelete: function (data) {
        this.$api.data.batchDelete(data.params,this.typeName).then(data!=null?data.callback:'')
      },
      // 显示新增界面
      handleAdd: function () {
        this.dialogVisible = true;
        this.operation = true;
        let typeName=this.typeName;
        let formInfo={};
        this.tableNavs.forEach(item =>{
          if(item.fieldClass === 'List'){
            formInfo[item.name]=[];
          }else{
            formInfo[item.name]='';
          }

        });
        this.formInfo=Object.assign({},formInfo);
        // if(!typeName){
        //   this.$message('选项不能为空！！！！');
        //   return;
        // }else{
        //   this.$api.data.findTableInfo(typeName).then(res =>{
        //     this.inputsInfo=res.bean.fieldList;
        //   });
        //
        // }

      },
      // 显示编辑界面
      handleEdit: function (params) {

        this.dialogVisible = true;
        this.operation = false;
        this.formInfo = Object.assign({}, params.row);
      },
      // 编辑
      submitForm: function () {
        let typeName=this.typeName;
        this.$refs.dataForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let params = Object.assign({}, this.formInfo);
              this.$api.data.save(params,typeName).then((res) => {
                this.editLoading = false;
                this.dialogVisible = false;
                this.$refs['dataForm'].resetFields();
                this.findPage(null)
              })
            })
          }
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
      // list格式化
      listFormat: function (row, column, cellValue, index){
        if(row[column.property] && row[column.property].length>0){
          return row[column.property].join();
        }else{
          return row[column.property]
        }

      },
      // 处理表格列过滤显示
      displayFilterColumnsDialog: function () {
        this.$refs.tableColumnFilterDialog.setDialogVisible(true)
      },
      // 处理表格列过滤显示
      handleFilterColumns: function (data) {
        this.filterColumns = data.filterColumns;
        this.$refs.tableColumnFilterDialog.setDialogVisible(false);
        this.$nextTick(()=>{
          this.$refs.kt_table.tableRefresh()
        })
      },
      // 处理表格列过滤显示
      initColumns: function (typeName) {
        this.$api.data.findTableInfo(typeName).then(res =>{
          this.inputsInfo=res.bean.fieldProps;
          let arr=[];
          this.inputsInfo.forEach(item =>{
            if(item.name!=='id' && item.name!=='_id' && item.name!=='flag'){
              arr.push(item);
            }
          });
          arr.unshift({
            desc: "",
            editable: false,
            emptyAble: true,
            verify: [],
            verifyDesc: [],
            fieldClass: "String",
            fieldType: "INPUT",
            name: "id",
            zhName: "id"
          });
          this.tableNavs=arr;
          this.columns =this.tableNavs.map(item =>{
            let label;
            let dataObject={};

            if(item.zhName){
              label=item.zhName
            }else{
              label=item.name
            }

            if(item.fieldClass === 'long'){
              dataObject={
                prop:item.name,
                label:label,
                minWidth:140,
                formatter:this.dateFormat
              }
            }else if(item.fieldClass === 'List'){
              dataObject={
                prop:item.name,
                label:label,
                formatter:this.listFormat
              }
            }else{
              dataObject={
                prop:item.name,
                label:label,
              }
            }
            return dataObject
          });
          /*{prop:"id", label:"ID", minWidth:50},*/
          // {prop:"name", label:"账号", minWidth:120},
          // {prop:"nickname", label:"昵称", minWidth:120},
          // {prop:"deptName", label:"部门", minWidth:120},
          // {prop:"roleNames", label:"角色", minWidth:100},
          // {prop:"email", label:"邮箱", minWidth:120},
          // {prop:"phone", label:"手机", minWidth:100},

          this.tableNavs.forEach( item =>{
            if (item.emptyAble === false) {
              this.dataFormRules[item.name]=[
                { required: true, message: '请输入'+item.zhName, trigger: 'blur' }
              ]
            }else{
              this.dataFormRules[item.name]=[]
            }
            let checkNum = (rule, value, callback) => {
              let reg = new RegExp(item.regEx,'g');
              if (value && !reg.test(value)) {
                callback(new Error(`请正确输入${item.zhName}`));
              } else {
                callback();
              }
            };
            if(item.regEx){
              this.dataFormRules[item.name].push(
                { validator: checkNum, trigger: 'blur' },
              )
            }

          });
          this.filterColumns = this.columns;
        });

      },
      getTypeName:function(){
        this.$api.experiment.findExpTableList().then(res =>{
          this.selectInfo=res.bean;
        });
      },
      getTableInfo:function(){
        let typeName=this.typeName;
        this.formInfo={};
        if(!typeName){
          this.$message('选项不能为空！！！！');
          return;
        }
        this.$api.data.findTableInfo(typeName).then(res =>{
          this.inputsInfo=res.bean.fieldProps
        });
      },
      inputValue:function(val){
        this.formInfo = Object.assign(this.formInfo, val);
        console.log(this.formInfo)
      },
    },
    mounted() {
      this.findPage(null);
      this.getTypeName();
    }
  }
</script>

<style>
  .input_value .el-form-item__label{
    font-size: 12px !important;
  }
</style>
