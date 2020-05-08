<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
          <el-input v-model="filters.name" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="" type="primary" @click="findPage(null)"/>
        </el-form-item>
<!--        <el-form-item>-->
<!--          <kt-button icon="fa fa-plus" :label="$t('action.add')" v-if="hasPerms('teach:curriculum:edit')" perms="teach:curriculum:edit" type="primary" @click="handleAdd" />-->
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
    <kt-table :height="700"
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
              :showBtnPass="false"
              :showBtnEdit="false"
              :showBtnDelete="false"
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
        <el-form-item label="学生成员" prop="members">
          <el-select
            v-model="dataForm.memberIds"
            multiple
            filterable
            :disabled="true"
            remote
            reserve-keyword
            :remote-method="remoteMethod"
            placeholder="请添加成员"
            style="width: 70%;">
            <el-option v-for="item in userAll" :key="item.name"
                       :label="item.nickname" :value="item.id">
            </el-option>
          </el-select>
<!--          <div class="memberInfo">-->
<!--            <span v-for="item in dataForm.memberIds" :key="item">{{item}}</span>-->
<!--          </div>-->
          <el-button :size="size" @click.native="innerVisible = true">{{operation?'新增':'修改'}}</el-button>
        </el-form-item>
        <el-form-item label="教室" prop="labRoomIds">
          <el-select
            v-model="dataForm.labRoomIds"
            multiple
            filterable
            placeholder="请选择"
            style="width: 100%;">
            <el-option v-for="item in lab" :key="item.name"
                       :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
<!--        <el-form-item label="审核人" prop="reviewer" v-if="operation">-->
<!--          <el-select v-model="dataForm.reviewer"  placeholder="请选择"-->
<!--                     style="width: 100%;">-->
<!--            <el-option v-for="item in reviewer" :key="item.userid"-->
<!--                       :label="item.nickname" :value="item.userid">-->
<!--            </el-option>-->
<!--          </el-select>-->
<!--        </el-form-item>-->
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
<!--    详情展示弹框-->
    <el-dialog
      width="60%"
      title="详情"
      :visible.sync="detailVisible">
      <div>
        <el-table
          :data="memberData"
          stripe
          style="width: 100%">
          <el-table-column
            prop="nickname"
            label="学生姓名"
            >
          </el-table-column>
          <el-table-column
            prop="deptName"
            label="所在班级"
            >
          </el-table-column>
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
  import KtTable from "@/views/Core/StudentstatTable"
  import KtButton from "@/views/Core/KtButton"
  import TableColumnFilterDialog from "@/views/Core/TableColumnFilterDialog"
  import { format,formatData } from "@/utils/datetime"
  import {addBean, queryBean, updateBean, getStudentStat} from "@/http/base";
  import { getIFrameUrl, getIFramePath } from '@/utils/iframe'
  import store from '@/store'
  import GetUser from "@/components/ObjectSelect/GetUser"
  import { hasPermission } from '@/permission/index.js'
  export default {
    components:{
      PopupTreeInput,
      KtTable,
      KtButton,
      TableColumnFilterDialog,
      GetUser
    },
    data() {
      return {
        size: 'mini',
        filters: {
          name: ''
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
          title: '',
          content: '',
          memberIds: [],
          labRoomIds:[],
          datetime:[],
          reviewer:''
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
        condition:{}
      }
    },
    // watch:{
    //   'dataForm.datetime':function(val,oldval){
    //     if(this.setupData.ifReturnPage && (isNaN(val) || val>10 || val<0)){
    //       setTimeout(()=>{
    //         this.$set(this.setupData,'returnCD',oldval);
    //       },1)
    //     }
    //   }
    // },
    methods: {
      // 获取分页数据
      findPage: function (data) {
        let pageRequest={
          pageNum: 1,
          pageSize: 10,
          condition:{
            conditionAccount:{},
            conditionExamResult:{},
            conditionLoginLog:{},
          },
          sort:{
            sumTotalScore: -1
          }
        };
        if(data !== null) {
          pageRequest = data.pageRequest
        }
        pageRequest.condition.conditionExamResult.status=2;
        pageRequest.sort.sumTotalScore=-1;
        if(this.filters.name){
          pageRequest.condition.conditionAccount['name$regex'] = this.filters.name;
        }
        getStudentStat(pageRequest.condition,pageRequest).then((res) => {
          this.pageResult = res.pageResult;
        }).then(data!=null?data.callback:'')
      },

      // 批量删除
      handleDelete: function (data) {
        this.$api.curriculum.batchDelete(data.params).then(data!=null?data.callback:'')
      },
      // 显示新增界面
      handleAdd: function () {
        this.dialogVisible = true;
        this.operation = true;
        this.dataForm = {
          id: 0,
          title: '',
          content: '',
          memberIds: [],
        }
      },
      // 显示编辑界面
      handleEdit: function (params) {
        console.log(params);
        this.dialogVisible = true;
        this.operation = false;
        this.dataForm = Object.assign({}, params.row);
        // this.dataForm.datetime=[params.row.startTime,params.row.endTime];
        this.$set(this.dataForm, "datetime", [params.row.startTime, params.row.endTime]);
        this.memberInfo=this.dataForm.memberIds;
        // let memberIds = [];
        // for(let i=0,len=params.row.memberIds.length; i<len; i++) {
        //   memberIds.push(params.row.memberIds[i])
        // }
        // this.dataForm.memberIds = memberIds
      },
      //跳转详情界面
      handleDetail:function(params){
        this.$router.push({name:'用户中心',params:{id : params.row.id}});
      },
      //通过
      handlePass:function(params){
        let oldState='待审核';
        let state='启用';
        let status=1;
        if(params.row.status===1){
          oldState='启用';
          state='停用';
          status=2;
        }else if(params.row.status===2){
          oldState='停用';
          state='启用';
          status=1;
        }else{
          oldState='待审核';
          state='启用';
          status=1;
        }
        this.$prompt(`请备注说明${state}课程的原因`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(({value}) => {
          let postData={
            status:status,
            reviewerId:sessionStorage.getItem('userid')
          };
          let doc={
            targetName:'Course',
            targetId:params.row.id,
            content:value,
            title:`${oldState} -> ${state}`
          };
          updateBean('Course', params.row.id, postData)
            .then(res =>{
              this.findPage(null);
              this.$message({
                type: 'success',
                message: `${state}成功!`
              });
          });
          addBean('OperateMark',doc)
            .then(res =>{

            })
            .catch(err =>{
              this.$message(err)
            })

        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
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
              this.$api.curriculum.save(params).then((res) => {

                this.editLoading = false;
                this.dialogVisible = false;
                this.$refs['dataForm'].resetFields();
                this.findPage(null)
              })
            })
          }
        })
      },
      // 获取部门列表
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
      // 菜单树选中
      deptTreeCurrentChangeHandle (data, node) {
        this.dataForm.deptmentId = data.id;
        this.dataForm.deptName = data.name
      },
      // 时间格式化
      dateFormat: function (row, column, cellValue, index){
        return formatData(row.startTime)+'-'+formatData(row.endTime)
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
          {prop:"name", label:"用户名", minWidth:120},
          {prop:"sumObjScore", label:"客观题分数", minWidth:120},
          {prop:"sumTotalScore", label:"总得分", minWidth:120},
          {prop:"sumLogin", label:"试卷总分", minWidth:100},
          // {prop:"reviewerId", label:"审核人", minWidth:120,formatter: this.reviewerFilter},
          // {prop:"status", label:"审核状态", minWidth:100,formatter: this.statusFilter},
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
        let name=row.labRoomIds.map((item)=>{
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
          return row.reviewer.nickname;
        }else{
          return '无'
        }
      },
      //过滤状态字段
      statusFilter:function(row, column, cellValue, index){
        if(row.status===0){
          return '待审核';
        }else if(row.status === 1){
          return '启用';
        }else if(row.status === 2){
          return '停用';
        }else{
          return '未知状态';
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
          this.userAll = res.bean.data;
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
      hasPerms: function (perms) {
        // 根据权限标识和外部指示状态进行权限判断
        return hasPermission(perms)

      }
    },
    mounted() {
      // this.findDeptTree()
      // this.findAccount();
      // this.findlabroom();
      // this.findReviewer();
      this.initColumns();
    }
  }
</script>

<style scoped>

</style>
