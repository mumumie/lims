<template>
  <div class="page-container" >
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
          <!--          <el-input v-model="filters.name" placeholder="试卷名称"></el-input>-->
          <el-select
            v-model="filters.experimentId"
            filterable
            clearable
            size="mini"
            placeholder="请选择试卷名称">
            <el-option
              v-for="item in ExperimentAll"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="filters.status"
            placeholder="状态"
            clearable
            style="width:100px;">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="" type="primary" @click="findPage(null)"/>
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
      :height="700"
      permsEdit="teach:curriculum:edit"
      permsDelete="teach:curriculum:delete"
      permsDetail=""
      permsPass="sys:user:view"
      :btnWidth="180"
      :maxHeight="700"
      :data="pageResult"
      :columns="filterColumns"
      @findPage="findPage"
      @handleEdit="handleEdit"
      @handleDelete="handleDelete"
      @handleDetail="handleDetail"
      @handlePass="handlePass"
      :showBtnEdit="false"
      :showBtnDelete="false"
      :showReset="true"
      :showBtnPass="true"
      @handleReset="handleReset"
      :showBtnDetail="true">
    </kt-table>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" label-width="100px" :rules="dataFormRules" ref="dataForm" :size="size"
               label-position="right">
        <el-form-item label="ID" prop="id" v-if="false">
          <el-input v-model="dataForm.id" :disabled="true" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="实验室课程" prop="name">
          <el-input v-model="dataForm.name" auto-complete="off" :disabled="operation?false:true"></el-input>
        </el-form-item>
        <el-form-item label="课程备注" prop="content">
          <el-input v-model="dataForm.content" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="实验室" prop="labRoomIds">
          <el-select v-model="dataForm.labRoomIds" multiple filterable placeholder="请选择"
                     style="width: 100%;">
            <el-option v-for="item in lab" :key="item.name"
                       :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关联实验" prop="expTemplateId" >
          <el-select v-model="dataForm.expTemplateId" filterable placeholder="请选择"
                     style="width: 100%;">
            <el-option v-for="item in experiment" :key="item.id"
                       :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="实验类型" prop="publicType" >
          <el-select v-model="dataForm.publicType"  filterable placeholder="请选择"
                     style="width: 100%;">
            <el-option label="教学实验" :value="1"></el-option>
            <el-option label="开放实验" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="课程时间" prop="datetime">
          <el-date-picker
            v-model.trim="dataForm.datetime"
            @input="datetimeChange"
            type="daterange"
            value-format="timestamp"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">{{$t('action.submit')}}</el-button>
      </div>
      <el-dialog
        width="60%"
        title="获取成员"
        :visible.sync="innerVisible"
        append-to-body>
        <GetUser :memberData="memberInfo" @memberData="getMemberInfo" v-if="innerVisible"></GetUser>
        <div slot="footer" class="dialog-footer">
          <el-button :size="size" @click.native="innerVisible = false">{{$t('action.cancel')}}</el-button>
          <el-button :size="size" type="primary" @click.native="addMembers" :loading="editLoading">{{$t('action.submit')}}</el-button>
        </div>
      </el-dialog>
    </el-dialog>
    <!--    详情界面-->
    <!--    <el-dialog-->
    <!--      width="60%"-->
    <!--      title="详情"-->
    <!--      :visible.sync="detailVisible">-->
    <!--      <ExperimentDetail :tamplateData="tamplateData"></ExperimentDetail>-->
    <!--      <div slot="footer" class="dialog-footer">-->
    <!--        <el-button :size="size" @click.native="detailVisible = false">{{$t('action.cancel')}}</el-button>-->
    <!--      </div>-->
    <!--    </el-dialog>-->
  </div>
</template>

<script>
  import PopupTreeInput from "@/components/PopupTreeInput"
  import KtTable from "@/views/Core/ExperimentResultTable"
  import KtButton from "@/views/Core/KtButton"
  import TableColumnFilterDialog from "@/views/Core/TableColumnFilterDialog"
  import { formatDataAll,formatData,formatDataStep } from "@/utils/datetime"
  import {addBean, queryBean, updateBean} from "@/http/base";
  import { getIFrameUrl, getIFramePath } from '@/utils/iframe'
  import store from '@/store'
  import GetUser from "@/components/ObjectSelect/GetUser"
  import { hasPermission } from '@/permission/index.js'
  export default {
    name:'Experiment',
    components:{
      PopupTreeInput,
      KtTable,
      KtButton,
      TableColumnFilterDialog,
      GetUser,
    },
    data() {
      return {
        size: 'mini',
        filters: {
          status: '',
          experimentId:''
        },
        columns: [],
        filterColumns: [],
        pageRequest: { pageNum: 1, pageSize: 10 },
        pageResult: {},
        detailVisible:false,
        operation: false, // true:新增, false:编辑
        dialogVisible: false, // 新增编辑界面是否显示
        editLoading: false,
        dataFormRules: {
          title: [
            { required: true, message: '请输入用户名', trigger: 'blur' }
          ]
        },
        // 新增编辑界面数据
        dataForm: {
          id: 0,
          name: '',
          content: '',
          memberIds: [],
          labRoomIds:[],
          datetime:[],
          reviewer:'',
          publicType:'',
          expTemplateId:'',
          expAnimalIds:[],
        },
        deptData: [],
        deptTreeProps: {
          label: 'name',
          children: 'children'
        },
        roles: [],
        innerVisible:false, //获取用户弹出框显示
        memberInfo:[], //成员id
        lab:[], //全部教室
        userAll:[],//全部用户
        memberData:[], //课程成员信息
        reviewer:[], //审核人
        experiment:[],//所有实验
        ExperimentAll:[],
        statusOptions:[
          {value:0,label:'未开始'},
          {value:1,label:'进行中'},
          {value:2,label:'已完成'},
        ],
        tamplateData:{},
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
          pageRequest = data.pageRequest
        }
        if(this.filters.experimentId){
          pageRequest.condition.experimentId = this.filters.experimentId
        }
        // if(!this.hasPerms('teach:curriculum:edit')){
        //   pageRequest.condition.userid=sessionStorage.getItem('userid');
        // }
        if(this.filters.status || this.filters.status === 0){
          pageRequest.condition.status = this.filters.status;
        }
        this.$api.expresult.findPage(pageRequest).then((res) => {
          this.pageResult = res.pageResult;
        }).then(data!=null?data.callback:'')
      },

      // 批量删除
      handleDelete: function (data) {
        this.$api.experiment.batchDelete(data.params).then(data!=null?data.callback:'')
      },
      // 显示新增界面
      handleAdd: function () {
        this.dialogVisible = true;
        this.operation = true;
        this.dataForm = {
          id: 0,
          name: '',
          content: '',
          memberIds: [],
          labRoomIds:[],
          datetime:[],
          reviewer:'',
          publicType:'',
          expTemplateId:'',
          expAnimalIds:[],
        }
      },
      // 显示编辑界面
      handleEdit: function (params) {
        console.log(params);
        this.dialogVisible = true;
        this.operation = false;
        this.dataForm = Object.assign({}, params.row);
        this.publicType=String(params.row.publicType);
        this.$set(this.dataForm, "datetime", [params.row.startTime, params.row.endTime]);
        this.memberInfo=this.dataForm.memberIds;

      },
      // 查看
      handleDetail: function(params) {
        // this.detailVisible = true;
        // this.tamplateData=params.row;
        this.$router.push({path:'/teach/experimentdetail',query:{id:params.row.id}});
        console.log(params.row)

      },
      // 显示重置界面
      handleReset: function (params) {
        console.log(params.row);
        this.$api.expresult.rewriteResult(params.row.id)
          .then(res =>{
            console.log(res);
            this.$message({
              type:'success',
              message:'重新生成结果报表成功！'
            })
          })
      },
      //作废
      handlePass:function(params){
        let postData = {
          id : params.row.id,
          status: 3
        };
        this.$confirm('此操作将作废该实验记录, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateBean('ExperimentResult',postData.id,postData)
            .then(res =>{
              if (res.retCode === 0) {
                this.$message({
                  type:'error',
                  message:'实验数据已作废！'
                });
                this.findPage(null)
              }
            })
        }).catch(() => {

        });

      },
      // 编辑
      submitForm: function () {
        this.$refs.dataForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let params = Object.assign({}, this.dataForm);
              if(params.datetime){
                params.startTime=params.datetime[0];
                params.endTime=params.datetime[1];
              }

              console.log(params);
              this.$api.experiment.save(params).then((res) => {

                this.editLoading = false;
                this.dialogVisible = false;
                this.$refs['dataForm'].resetFields();
                this.findPage(null)
              })
            })
          }
        })
      },
      // 获取用户组列表
      findDeptTree: function () {
        this.$api.dept.findDeptTree().then((res) => {
          this.deptData = res.bean.data
        })
      },
      // 加载实验室信息
      findlabroom: function () {
        this.$api.labroom.findAll().then((res) => {
          // 加载实验室集合
          this.lab = res.bean.data
        })
      },
      // 加载动物信息
      findanimal: function () {
        let postData={
          type:'animal',
        };
        queryBean('Dict',postData).then((res) => {
          // 加载实验室集合
          this.animals=res.bean.data;
        })
      },
      // 加载关联实验
      findexperiment: function () {
        let postData={

        };
        queryBean('ExpTemplate',postData).then((res) => {
          // 加载实验室集合
          this.experiment=res.bean.data;
        })
      },
      // 菜单树选中
      deptTreeCurrentChangeHandle (data, node) {
        this.dataForm.deptmentId = data.id;
        this.dataForm.deptName = data.name
      },
      // 时间格式化
      dateFormat: function (row, column, cellValue, index){

        return formatData(row.experiment.startTime)+'-'+formatData(row.experiment.endTime)
      },
      // 实验时间格式化
      dateFormat1: function (et,st){
        if(et && st){
          return formatDataAll(et)+'-'+formatDataAll(st)
        }else if(et){
          return formatDataAll(et)
        }else{
          return 0
        }

      },
      //时间差 时分秒
      formatDataStep:function(date){
        return formatDataStep(date)
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
          {prop:"id", label:"ID", minWidth:50},
          {prop:"experiment.name", label:"课程", minWidth:120},
          {prop:"student.name", label:"学生姓名", minWidth:120},
          {prop:"totalScore", label:"总得分", minWidth:100},
          {prop:"experiment.startTime", label:"课程时间", minWidth:120,formatter:this.dateFormat},
          {prop:"status", label:"审核状态", minWidth:100,formatter: this.statusFilter},
          // {prop:"createBy", label:"创建人", minWidth:120},
          // {prop:"createTime", label:"创建时间", minWidth:120, formatter:this.dateFormat}
          // {prop:"lastUpdateBy", label:"更新人", minWidth:100},
          // {prop:"lastUpdateTime", label:"更新时间", minWidth:120, formatter:this.dateFormat}
        ];
        this.filterColumns = this.columns;
      },

      getMemberInfo:function(val){
        this.memberInfo=val;
      },
      addMembers:function(){
        this.dataForm.memberIds=this.memberInfo;
        this.innerVisible=false;
        this.memberInfo=[];
      },
      //过滤实验室字段
      labFilter:function(row, column, cellValue, index){
        let name=row.experiment.labRoomIds.map((item)=>{
          for(let key of this.lab){
            if(key.id===item){
              return key.name
            }
          }
        });
        return name.join(',');
      },
      //过滤审核人字段
      reviewerFilter:function(row, column, cellValue, index){
        if(row.reviewer){
          let reviewer=this.userAll.find((item)=>{
            if(row.reviewer===item.id){
              return item.nickname
            }
          });
          if(reviewer){
            return reviewer.nickname;
          }
        }else{
          return '无'
        }
      },
      //过滤状态字段
      statusFilter:function(row, column, cellValue, index){
        if(row.status===0){
          return '未开始';
        }else if(row.status === 1){
          return '进行中';
        }else if(row.status === 2){
          return '已完成';
        }else{
          return '已作废';
        }
      },
      datetimeChange:function(val){
        this.$nextTick(() => {
          this.dataForm.datetime = null;
          this.$set(this.dataForm, "datetime", [val[0], val[1]]);
        });
      },
      remoteMethod:function(){

      },
      //查找所有用户
      findAccount:function(){
        this.$api.user.findAll().then((res) => {
          this.userAll = res.bean.data
        })
      },
      //查找审核人角色的用户
      findReviewer:function(){
        let postData={
          roleIdList:'5d312e18e7675a1173e84de5'
        };
        queryBean('UserRoles',postData).then((res) => {
          this.reviewer = res.bean.data.map((item) =>{
            return {
              userid:item.userid,
              nickname:item.user.nickname,
            }
          })
        })
      },
      //查找所有试卷
      findExperiment: function (){
        let condition={

        };
        queryBean('Experiment',condition)
          .then(res =>{
            this.ExperimentAll=res.bean.data;
          })
      },
      hasPerms: function (perms) {
        // 根据权限标识和外部指示状态进行权限判断
        return hasPermission(perms)
      }
    },
    created(){
      this.findExperiment();
      // this.findlabroom();
      if(this.$route.query.id) {
        this.filters.experimentId = this.$route.query.id;
      }
      this.initColumns();

    },
    mounted() {
      // this.findDeptTree()
      // this.findAccount();
      // this.findReviewer();
      // this.findanimal();
      // this.findexperiment();

    }
  }
</script>

<style scoped>

</style>
