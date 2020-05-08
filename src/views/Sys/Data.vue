<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true"  :size="size">
        <el-form-item>
          <el-select v-model="typeName" placeholder="typeName类型选择" filterable @change="initColumns(typeName)" >
            <el-option
              v-for="(item,index) in selectInfo"
              :key="index"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model="keyword" placeholder="关键词"></el-input>
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
    <kt-table :height="350" permsEdit="sys:user:edit" permsDelete="sys:user:delete"
              :data="pageResult" :columns="filterColumns"
              @findPage="findPage" @handleEdit="handleEdit" @handleDelete="handleDelete">
    </kt-table>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" label-width="80px" :rules="dataFormRules" ref="dataForm" :size="size"
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
  import KtTable from "@/views/Core/KtTable"
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
          name: [
            { required: true, message: '请输入用户名', trigger: 'blur' }
          ]
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
        typeName:"bean.TestBean",
        selectInfo:[],
        formInfo:{},
        inputsInfo:[],
        tableNav:[],
        tableNavs:[],
        reFresh:true
      }
    },
    watch:{
      formInfo(){
        this.reFresh= false;
        this.$nextTick(()=>{
          this.reFresh = true
        })

      }
    },
    methods: {
      // 获取分页数据
      findPage: function (data) {
        if(data !== null) {
          this.pageRequest = data.pageRequest
        }
        let postData={
          typeName:this.typeName,
          keyword:this.keyword,
          pagesize:this.pageRequest.pageSize,
          pageno:this.pageRequest.pageNum-1
        };
        this.$api.data.findKeyWord(postData).then((res) => {
          this.pageResult=res.pageResult;
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
        this.formInfo={};
        if(!typeName){
          this.$message('选项不能为空！！！！');
          return;
        }else{
          this.$api.data.findTableInfo(typeName).then(res =>{
            this.inputsInfo=res.bean.fieldList;
          });

        }

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
      initColumns: function (typeName) {
        this.$api.data.findTableInfo(typeName).then(res =>{
          this.inputsInfo=res.bean.fieldList;
          let arr=this.inputsInfo.map(item =>{
            let str=[];
            if(item.name!==('id'&&'_id'&&'flag'&&'status'&&'insertDt')){
              str=item;
              return str;
            }
          });
          arr.unshift({
            "desc": "id",
            "name": "id",
            "nullable": false,
            "refClass": "",
            "refField": "",
            "type": "String"
          });
          this.tableNavs=arr;
          this.columns =this.tableNavs.map(item =>{
            return {
              prop:item.name, label:item.desc
            }
          });
          /*{prop:"id", label:"ID", minWidth:50},*/
          // {prop:"name", label:"账号", minWidth:120},
          // {prop:"nickname", label:"昵称", minWidth:120},
          // {prop:"deptName", label:"部门", minWidth:120},
          // {prop:"roleNames", label:"角色", minWidth:100},
          // {prop:"email", label:"邮箱", minWidth:120},
          // {prop:"phone", label:"手机", minWidth:100},

          this.filterColumns = JSON.parse(JSON.stringify(this.columns));
        });

      },
      getTypeName:function(){
        this.$api.data.findTableList().then(res =>{
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
          console.log(res);
          this.inputsInfo=res.bean.fieldList
        });
      },
      inputValue:function(val){
        this.formInfo = Object.assign(this.formInfo, val);
        console.log(this.formInfo)
      },
    },
    mounted() {
      this.findPage(null);
      this.initColumns(this.typeName);
      this.getTypeName();
    }
  }
</script>

<style scoped>

</style>
