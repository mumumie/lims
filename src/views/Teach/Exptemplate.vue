<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
          <el-input v-model="filters.name" placeholder="实验名称"></el-input>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="" type="primary" @click="findPage(null)"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="teach:curriculum:edit" type="primary" @click="handleAdd" />
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
      :btnWidth="180"
      :maxHeight="700"
      :data="pageResult"
      :columns="filterColumns"
      @findPage="findPage"
      @handleEdit="handleEdit"
      @handleDelete="handleDelete"
      @handleDetail="handleDetail"
      :showBtnDelete="hasPerms('teach:curriculum:delete')"
      :showBtnDetail="true">
    </kt-table>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="60%" :visible.sync="dialogVisible" :close-on-click-modal="false">

        <el-form :model="dataForm" label-width="150px" :rules="dataFormRules" ref="dataForm" :size="size"
                 label-position="right">
          <el-form-item label="ID" prop="id" v-if="false">
            <el-input v-model="dataForm.id" :disabled="true" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="实验名称" prop="name">
            <el-input v-model="dataForm.name" auto-complete="off" :disabled="operation?false:true"></el-input>
          </el-form-item>
          <el-form-item label="实验类型" prop="code">
            <el-select
              v-model="dataForm.code"
              placeholder="请选择"
              style="width: 100%;"
              :disabled="operation?false:true"
              @change="codeHandle(dataForm.code)">
              <el-option label="动物休克模型教学实验" value='1'></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="实验动物" prop="expAnimalIds">
            <div class="question_type">
              <div class="question_type_title" style="padding-bottom: 1px;">

                <i class="el-icon-circle-plus" @click="addAnimals"></i>
              </div>
              <el-table
                :data="dataForm.expAnimalList"
                size="mini"
                border
                style="width: 100%">
                <el-table-column
                  prop="name"
                  label="动物名称"
                  show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                  prop="minWeight"
                  label="最小体重(g)"
                  width="100">
                </el-table-column>
                <el-table-column
                  prop="maxWeight"
                  label="最大体重(g)"
                  width="100">
                </el-table-column>
                <el-table-column
                  prop="amount"
                  label="数量">
                </el-table-column>
                <el-table-column
                  prop="mf"
                  label="雌雄">
                  <template slot-scope="scope">
                    {{scope.row.mf === 0 ? '雌' : '雄'}}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="monthAge"
                  label="月龄">
                </el-table-column>
                <el-table-column label="操作" fixed="right" width="50">
                  <template slot-scope="scope">
                    <i class="el-icon-delete" @click="handleDeleting(scope.$index, scope.row)"></i>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-form-item>
          <el-form-item label="指标观测" prop="indicator">
            <el-input v-model="dataForm.indicator[0]"  type="textarea" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="实验药品" prop="medicine">
            <el-input v-model="dataForm.medicine[0]" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="实验器材" prop="apparatus">
            <el-input v-model="dataForm.apparatus[0]" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="步骤"  prop="steps">
            <el-input v-model="dataForm.steps[0]" :rows="5" type="textarea" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="放血时间" prop="pj11">
            <el-col :span="11">
              <el-input v-model="dataForm.pj11[0]" auto-complete="off">
                <template slot="append">min</template>
              </el-input>
            </el-col>
            <el-col style="text-align: center;" :span="1">
              -
            </el-col>
            <el-col :span="11">
              <el-input v-model="dataForm.pj11[1]" auto-complete="off">
                <template slot="append">min</template>
              </el-input>
            </el-col>
          </el-form-item>
          <el-form-item label="得分" >
            <el-input v-model="dataForm.pj11Score" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="map上升至基础值的x" prop="pj12">
            <el-col :span="11">
              <el-input v-model="dataForm.pj12[0]" auto-complete="off">
                <template slot="append">%</template>
              </el-input>
            </el-col>
            <el-col style="text-align: center;" :span="1">
              -
            </el-col>
            <el-col :span="11">
              <el-input v-model="dataForm.pj12[1]" auto-complete="off">
                <template slot="append">%</template>
              </el-input>
            </el-col>
          </el-form-item>
          <el-form-item label="得分" >
            <el-input v-model="dataForm.pj12Score" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="血压平稳时间" prop="pj13">
            <el-col :span="11">
              <el-input v-model="dataForm.pj13[0]" auto-complete="off">
                <template slot="append">min</template>
              </el-input>
            </el-col>
            <el-col style="text-align: center;" :span="1">
              -
            </el-col>
            <el-col :span="11">
              <el-input v-model="dataForm.pj13[1]" auto-complete="off">
                <template slot="append">min</template>
              </el-input>
            </el-col>
          </el-form-item>
          <el-form-item label="得分" >
            <el-input v-model="dataForm.pj13Score" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="x分钟内进行wap测定" prop="pj21">
            <el-col :span="11">
              <el-input v-model="dataForm.pj21[0]" auto-complete="off">
                <template slot="append">min</template>
              </el-input>
            </el-col>
            <el-col style="text-align: center;" :span="1">
              -
            </el-col>
            <el-col :span="11">
              <el-input v-model="dataForm.pj21[1]" auto-complete="off">
                <template slot="append">min</template>
              </el-input>
            </el-col>
          </el-form-item>
          <el-form-item label="得分" >
            <el-input v-model="dataForm.pj21Score" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="map下降" prop="pj22">
            <el-col :span="11">
              <el-input v-model="dataForm.pj22[0]" auto-complete="off">
                <template slot="append">%</template>
              </el-input>
            </el-col>
            <el-col style="text-align: center;" :span="1">
              -
            </el-col>
            <el-col :span="11">
              <el-input v-model="dataForm.pj22[1]" auto-complete="off">
                <template slot="append">%</template>
              </el-input>
            </el-col>
          </el-form-item>
          <el-form-item label="得分" >
            <el-input v-model="dataForm.pj22Score" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="血压平稳时间" prop="pj23">
            <el-col :span="11">
              <el-input v-model="dataForm.pj23[0]" auto-complete="off">
                <template slot="append">min</template>
              </el-input>
            </el-col>
            <el-col style="text-align: center;" :span="1">
              -
            </el-col>
            <el-col :span="11">
              <el-input v-model="dataForm.pj23[1]" auto-complete="off">
                <template slot="append">min</template>
              </el-input>
            </el-col>
          </el-form-item>
          <el-form-item label="得分" >
            <el-input v-model="dataForm.pj23Score" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="存活时间" prop="pj31">
            <el-col :span="11">
              <el-input v-model="dataForm.pj31[0]" auto-complete="off">
                <template slot="append">min</template>
              </el-input>
            </el-col>
            <el-col style="text-align: center;" :span="1">
              -
            </el-col>
            <el-col :span="11">
              <el-input v-model="dataForm.pj31[1]" auto-complete="off">
                <template slot="append">min</template>
              </el-input>
            </el-col>
          </el-form-item>
          <el-form-item label="得分" >
            <el-input v-model="dataForm.pj31Score" auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">{{$t('action.submit')}}</el-button>
      </div>
      <el-dialog
        width="40%"
        title="添加动物属性"
        :visible.sync="animalsVisible"
        :close-on-click-modal="false"
        append-to-body>
        <el-form :model="animalForm" label-width="100px" :rules="dataFormRules" ref="animalForm" :size="size">
          <el-form-item label="动物名称" >
            <el-input v-model="animalForm.name" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="最小体重(g)" >
            <el-input v-model="animalForm.minWeight" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="最大体重(g)" >
            <el-input v-model="animalForm.maxWeight" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="数量" >
            <el-input v-model.number="animalForm.amount" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="雌雄" >
            <el-select
              v-model="animalForm.mf"
              placeholder="请选择"
              style="width: 100%;">
              <el-option label="雌" :value='0'></el-option>
              <el-option label="雄" :value='1'></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="月龄" >
            <el-input v-model="animalForm.monthAge" auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button :size="size" @click.native="animalsVisible = false">{{$t('action.cancel')}}</el-button>
          <el-button :size="size" type="primary" @click.native="animalSubmitForm">{{$t('action.submit')}}</el-button>
        </div>
      </el-dialog>
    </el-dialog>
<!--    详情弹框-->
    <el-dialog
      width="60%"
      title="详情"
      :visible.sync="detailVisible">
      <div>
        <p><span>实验名称：</span>{{tamplateData.name}}</p>
        <el-divider></el-divider>
        <p><span>实验类型：</span>{{tamplateData.code===1?'动物休克模型教学实验':'其他教学实验'}}</p>
        <p v-if="tamplateData.indicator"><span>指标观测：</span>{{tamplateData.indicator[0]}}</p>
        <p v-if="tamplateData.medicine"><span>实验药品：</span>{{tamplateData.medicine[0]}}</p>
        <p v-if="tamplateData.apparatus"><span>实验器材：</span>{{tamplateData.apparatus[0]}}</p>
        <p v-if="tamplateData.steps"><span>步骤：</span>{{tamplateData.steps[0]}}</p>
        <p v-if="tamplateData.expAnimals"><span>实验动物：</span>{{tamplateData.expAnimals}}</p>
        <p v-if="tamplateData.pj11"><span>放血时间：</span>{{tamplateData.pj11}}Min</p>
        <p v-if="tamplateData.pj12"><span>map上升至基础值的x：</span>{{tamplateData.pj12[0]+'-'+tamplateData.pj12[1]}}%</p>
        <p v-if="tamplateData.pj13"><span>血压平稳时间：</span>{{tamplateData.pj13}}Min</p>
        <p v-if="tamplateData.pj21"><span>x分钟内进行wap测定：</span>{{tamplateData.pj21}}Min</p>
        <p v-if="tamplateData.pj22"><span>map下降：</span>{{tamplateData.pj22[0]+'-'+tamplateData.pj22[1]}}%</p>
        <p v-if="tamplateData.pj23"><span>血压平稳时间：</span>{{tamplateData.pj23}}Min</p>
        <p v-if="tamplateData.pj31"><span>存活时间：</span>{{tamplateData.pj31}}Min</p>
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
  import { format,formatData } from "@/utils/datetime"
  import {addBean, queryBean, updateBean} from "@/http/base";
  import { getIFrameUrl, getIFramePath } from '@/utils/iframe'
  import store from '@/store'
  import GetUser from "@/components/ObjectSelect/GetUser"
  import { hasPermission } from '@/permission/index.js'
  export default {
    name:'ExpTemplate',
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
        animalsVisible:false, //添加动物属性是否显示
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
          code:'',
          indicator: [],
          medicine: [],
          expAnimalList:[],
          apparatus:[],
          steps:[],
          pj11:[],
          pj11Score:0,
          pj12:[],
          pj12Score:0,
          pj13:[],
          pj13Score:0,
          pj21:[],
          pj21Score:0,
          pj22:[],
          pj22Score:0,
          pj23:[],
          pj23Score:0,
          pj31:[],
          pj31Score:0,
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
        tamplateData:[], //模板数据信息
        reviewer:[], //审核人
        animals:[],//所有动物
        experiment:[],//所有实验
        animalForm:{
          name:'Wistar 大鼠',
          minWeight:'290',
          maxWeight:'310',
          amount:5,
          mf:1,
          monthAge:'10',
        }, //动物表单
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
          sort:{
            insertDt:-1,
          },
          condition:{}
        };
        if(data !== null) {
          pageRequest = data.pageRequest
        }
        if(!this.hasPerms('teach:curriculum:edit')){
          pageRequest.condition.status=1;
        }
        if(this.filters.name){
          pageRequest.condition['name$regex'] =  this.filters.name;
        }

        this.$api.exptemplate.findPage(pageRequest).then((res) => {
          this.pageResult = res.pageResult;
        }).then(data!=null?data.callback:'')
      },

      // 批量删除
      handleDelete: function (data) {
        this.$api.exptemplate.batchDelete(data.params).then(data!=null?data.callback:'')
      },
      // 显示新增界面
      handleAdd: function () {
        this.dialogVisible = true;
        this.operation = true;
        this.dataForm = {
          id: 0,
          name: '',
          code:'',
          indicator: [],
          expAnimalList:[],
          medicine: [],
          apparatus:[],
          steps:[],
          pj11:[],
          pj11Score:0,
          pj12:[],
          pj12Score:0,
          pj13:[],
          pj13Score:0,
          pj21:[],
          pj21Score:0,
          pj22:[],
          pj22Score:0,
          pj23:[],
          pj23Score:0,
          pj31:[],
          pj31Score:0,
        }
      },
      // 显示编辑界面
      handleEdit: function (params) {
        this.dialogVisible = true;
        this.operation = false;
        this.dataForm = Object.assign({}, params.row);
        this.dataForm.pj12[0]=this.dataForm.pj12[0]*100;
        this.dataForm.pj12[1]=this.dataForm.pj12[1]*100;
        this.dataForm.pj22[0]=this.dataForm.pj22[0]*100;
        this.dataForm.pj22[1]=this.dataForm.pj22[1]*100;
        console.log(params);
        this.dataForm.code=String(params.row.code);
      },
      // 查看
      handleDetail: function(params) {
        this.detailVisible = true;
        console.log(params);
        this.tamplateData=params.row;
      },
      // 编辑
      submitForm: function () {
        this.$refs.dataForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let params = Object.assign({}, this.dataForm);
              params.pj12[0] = Number(params.pj12[0])/100;
              params.pj12[1] = Number(params.pj12[1])/100;
              params.pj22[0] = Number(params.pj22[0])/100;
              params.pj22[1] = Number(params.pj22[1])/100;
              console.log(params);
              this.$api.exptemplate.save(params).then((res) => {
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
          {prop:"name", label:"实验名称", minWidth:120},
          {prop:"code", label:"实验类型", minWidth:120,formatter: this.codeFilter},
          {prop:"indicator[0]", label:"指标观测", minWidth:120},
          {prop:"medicine[0]", label:"实验药品", minWidth:120},
          {prop:"apparatus[0]", label:"实验器材", minWidth:120},
          // {prop:"apparatus[0]", label:"创建时间", minWidth:120, formatter:this.dateFormat}
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
      //过滤实验类型
      codeFilter:function(row, column, cellValue, index){
        if(row.code===1){
          return '动物休克模型教学实验';
        }else{
          return '其他教学实验';
        }
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
          return '未审核';
        }else if(row.status === 1){
          return '已审核';
        }else{
          return '拒绝审核';
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
      hasPerms: function (perms) {
        // 根据权限标识和外部指示状态进行权限判断
        return hasPermission(perms)
      },
      codeHandle:function(val){
        let dataForm = {
          pj11:[55,65],
          pj11Score:15,
          pj12:[75,85],
          pj12Score:15,
          pj13:[15,100],
          pj13Score:15,
          pj21:[5,10],
          pj21Score:15,
          pj22:[20,30],
          pj22Score:15,
          pj23:[30,100],
          pj23Score:15,
          pj31:[10,100],
          pj31Score:10,
          indicator: ['①　使用多道生理记录仪对MAP、心率、体温等进行连续监测。\n' +
          '②　使用血气仪对动脉血氧血气进行定时测定。'],
          medicine:['戊巴比妥钠、肝素钠、乳酸Ringers溶液。'],
          apparatus:['血气仪、多道生理记录仪、引导管、自制保温装置。'],
          steps:['诱导休克模型制备：\n' +
          '①　大鼠腹腔注射戊巴比妥钠麻醉 ( 50 mg/ kg w ) 。\n' +
          '②　外颈静脉插管, 注入肝素钠抗凝(1000 IU/ kg)。\n' +
          '③　颈动脉插管，用于动脉压的监测。\n' +
          '④　股动脉插管，用于放血和采集血样。\n' +
          '⑤  用保温装置控制大鼠麻醉态体温在( 35±1℃) 。放血过程持续60min，放血过程采用梯度放血期加上血量调节期的双阶段放血方式。'],
          expAnimalList:[
            {
              name:'Wistar 大鼠',
              minWeight:'290',
              maxWeight:'310',
              amount:5,
              mf:1,
              monthAge:'10',
            },
          ]
        };
        if(val==='1'){
          this.dataForm=Object.assign(this.dataForm,dataForm);
        }
      },
      handleDeleting:function(index,row){
        this.dataForm.expAnimalList.splice(index,1);
      },
      addAnimals:function(){
        this.animalsVisible=true;
      },
      animalSubmitForm:function(){
        let animalForm=Object.assign({},this.animalForm);
        this.dataForm.expAnimalList.push(animalForm);
        this.animalsVisible=false;
        this.animalForm={
          name:'小白兔',
          minWeight:'20',
          maxWeight:'30',
          amount:5,
          mf:0,
          monthAge:'10',
        }
      }

    },
    mounted() {

      // this.findDeptTree()
      this.findAccount();
      this.findlabroom();
      // this.findReviewer();
      this.initColumns();
      this.findexperiment();
    }
  }
</script>
<style>
  .question_type .cell{
    text-align: center;
  }
</style>
<style scoped>
  .question_type{

  }
  .question_type_title{
    overflow: hidden;
    line-height: 30px;
    margin-bottom: 1px;
  }
  .question_type_title h4{
    float:left;
    margin:0;
  }
  .question_type_title .el-icon-circle-plus{
    float:right;
    line-height: 30px;
    font-size: 20px;
    color:#55a532;
    cursor: pointer;
  }

  .question_type .cell i{
    font-size:16px;
    cursor: pointer;
  }
</style>
